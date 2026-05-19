import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { AccessService } from '../../../../core/access/access';
import { OwnerService, OwnerStats } from '../../services/owner.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { ViewingRequestResponse, ViewingService } from '../../../viewings/services/viewing.service';

interface StatCard { label: string; value: string; delta: string; tone: 'up' | 'down' | 'flat'; }

// Pure SVG drawing space — labels are HTML, not SVG text
const CW = 300;
const CH = 80;

interface ChartData {
  linePath: string;
  fillPath: string;
  gridY: number[];
  yMax: number;
  yMid: number;
  xLabels: string[];
  hasData: boolean;
}

interface HoveredPoint {
  pct: number;    // 0..1, position along x axis
  svgX: number;   // SVG coordinate x
  svgY: number;   // SVG coordinate y (for dot)
  date: string;
  views: number;
}

@Component({
  selector: 'app-owner-dashboard-page',
  standalone: true,
  imports: [CommonModule, DatePipe, MessageModule, SkeletonModule],
  templateUrl: './owner-dashboard-page.html',
  styleUrl: './owner-dashboard-page.scss'
})
export class OwnerDashboardPage implements OnInit {
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly viewingService = inject(ViewingService);
  private readonly ownerService = inject(OwnerService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly access = inject(AccessService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly stats = signal<OwnerStats | null>(null);
  readonly viewingRequests = signal<ViewingRequestResponse[]>([]);
  readonly canActivateListing = this.access.can('activateListing');
  readonly canDeactivateListing = this.access.can('deactivateListing');

  readonly statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];

    const trend = s.viewsTrend ?? [];
    const todayViews   = trend[trend.length - 1] ?? 0;
    const last7        = trend.slice(-7).reduce((a, b) => a + b, 0);
    const prev7        = trend.slice(-14, -7).reduce((a, b) => a + b, 0);
    const viewPct      = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);
    const viewDelta    = viewPct !== null
      ? `${viewPct >= 0 ? '+' : ''}${viewPct}% vs last week`
      : `+${todayViews} today`;
    const viewTone: 'up' | 'down' | 'flat' =
      viewPct === null ? (todayViews > 0 ? 'up' : 'flat')
      : viewPct > 0 ? 'up' : viewPct < 0 ? 'down' : 'flat';

    return [
      { label: 'Active listings',    value: String(s.activeListings ?? 0),           delta: 'published',       tone: 'flat' },
      { label: 'Saved by users',     value: String(s.savedByUsers ?? 0),             delta: 'by renters',      tone: 'up'   },
      { label: 'Pending viewings',   value: String(s.pendingViewingRequests ?? 0),   delta: 'await review',    tone: 'flat' },
      { label: 'Total views',        value: String(s.totalViews ?? 0),               delta: viewDelta,         tone: viewTone },
    ];
  });

  readonly chart = computed<ChartData>(() => {
    const trend = this.stats()?.viewsTrend;
    const empty: ChartData = { linePath: '', fillPath: '', gridY: [], yMax: 0, yMid: 0, xLabels: [], hasData: false };
    if (!trend || trend.length < 2 || !trend.some(v => v > 0)) return empty;

    const max = Math.max(...trend, 1);
    const yMax = max <= 10 ? max : Math.ceil(max / 5) * 5;
    const yMid = Math.round(yMax / 2);

    const toX = (i: number) => (i / (trend.length - 1)) * CW;
    const toY = (v: number) => CH - (v / yMax) * CH;

    const pts: [number, number][] = trend.map((v, i) => [toX(i), toY(v)]);

    let line = `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      line += ` C ${cx.toFixed(2)},${y0.toFixed(2)} ${cx.toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
    }
    const fill = `${line} L ${CW},${CH} L 0,${CH} Z`;

    const gridY = [0, CH / 2, CH];

    const today = new Date();
    const fmt = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    };
    const xLabels = [fmt(trend.length - 1), fmt(Math.floor((trend.length - 1) / 2)), 'Today'];

    return { linePath: line, fillPath: fill, gridY, yMax, yMid, xLabels, hasData: true };
  });

  readonly trendTotal = computed<number>(() =>
    this.stats()?.viewsTrend?.reduce((a, b) => a + b, 0) ?? 0
  );

  readonly hoveredPoint = signal<HoveredPoint | null>(null);

  onChartMove(event: MouseEvent): void {
    const trend = this.stats()?.viewsTrend;
    if (!trend || !trend.some(v => v > 0)) return;

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (trend.length - 1));
    const snappedPct = idx / (trend.length - 1);

    const max = Math.max(...trend, 1);
    const yMax = max <= 10 ? max : Math.ceil(max / 5) * 5;
    const svgX = snappedPct * CW;
    const svgY = CH - (trend[idx] / yMax) * CH;

    const today = new Date();
    const d = new Date(today);
    d.setDate(d.getDate() - (trend.length - 1 - idx));
    const date = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    this.hoveredPoint.set({ pct: snappedPct, svgX, svgY, date, views: trend[idx] });
  }

  onChartLeave(): void {
    this.hoveredPoint.set(null);
  }

  tooltipTransform(pct: number): string {
    if (pct < 0.12) return 'translateX(0)';
    if (pct > 0.88) return 'translateX(-100%)';
    return 'translateX(-50%)';
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.listingService.getMy().subscribe({
      next: items => {
        this.listings.set(items ?? []);
        this.loading.set(false);
      },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
    this.loadViewings();
    this.loadStats();
  }

  private loadStats(): void {
    this.ownerService.getStats().subscribe({
      next: stats => this.stats.set(stats),
      error: () => this.stats.set(null)
    });
  }

  loadViewings(): void {
    this.viewingService.getOwner().subscribe({
      next: items => this.viewingRequests.set(items ?? []),
      error: () => this.viewingRequests.set([])
    });
  }

  approveViewing(id: number): void {
    this.viewingService.approve(id).subscribe({
      next: updated => this.viewingRequests.update(list => list.map(v => v.id === id ? updated : v)),
      error: err => this.error.set(this.toMessage(err))
    });
  }

  rejectViewing(id: number): void {
    this.viewingService.reject(id).subscribe({
      next: updated => this.viewingRequests.update(list => list.map(v => v.id === id ? updated : v)),
      error: err => this.error.set(this.toMessage(err))
    });
  }

  toggleListingStatus(event: MouseEvent, listing: ListingResponse): void {
    event.stopPropagation();
    const request$ = listing.status === 'ACTIVE'
      ? this.listingService.deactivate(listing.id)
      : this.listingService.activate(listing.id);

    request$.subscribe({
      next: updated => this.listings.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: err => this.error.set(this.toMessage(err))
    });
  }

  exportCsv(): void {
    const rows = this.listings();
    if (!rows.length) {
      return;
    }

    const header = [
      'ID',
      'Title',
      'City',
      'Address',
      'Price',
      'Currency',
      'Deal',
      'Status',
      'Property type',
      'Area',
      'Rooms',
      'Floor',
      'Year built',
      'Created at'
    ];

    const csvRows = rows.map(listing => [
      listing.id,
      listing.title,
      listing.address.city,
      [listing.address.street, listing.address.district, listing.address.postalCode, listing.address.country]
        .filter(Boolean)
        .join(', '),
      listing.price.amount,
      listing.price.currency,
      listing.listingType,
      listing.status,
      listing.features.propertyType,
      listing.features.area ?? '',
      listing.features.roomCount ?? '',
      listing.features.floor ?? '',
      listing.features.yearBuilt ?? '',
      listing.createdAt
    ]);

    const csv = [header, ...csvRows]
      .map(row => row.map(value => this.escapeCsv(value)).join(','))
      .join('\r\n');

    this.downloadCsv(csv);
  }

  createListing(): void {
    void this.router.navigate(['/listings/create']);
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  canToggleListingStatus(listing: ListingResponse): boolean {
    return listing.status === 'ACTIVE' ? this.canDeactivateListing() : this.canActivateListing();
  }

  formatPrice(listing: ListingResponse): string {
    const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
    return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' €' + suffix;
  }

  shortLocation(listing: ListingResponse): string {
    return listing.address.city;
  }

  private escapeCsv(value: unknown): string {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  private downloadCsv(csv: string): void {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rentarea-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
