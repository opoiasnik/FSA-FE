import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AccessService } from '../../../../core/access/access';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { ViewingRequestResponse, ViewingService } from '../../../viewings/services/viewing.service';
import { OwnerListingsTable } from '../../components/owner-listings-table/owner-listings-table';
import { OwnerStatCard, OwnerStatGrid } from '../../components/owner-stat-grid/owner-stat-grid';
import { OwnerViewingRequests } from '../../components/owner-viewing-requests/owner-viewing-requests';
import { OwnerViewsChart } from '../../components/owner-views-chart/owner-views-chart';
import { OwnerService, OwnerStats } from '../../services/owner.service';

@Component({
  selector: 'app-owner-dashboard-page',
  standalone: true,
  imports: [CommonModule, MessageModule, OwnerStatGrid, OwnerViewsChart, OwnerViewingRequests, OwnerListingsTable],
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
  readonly canDeleteListing = this.access.can('deleteListing');

  readonly statCards = computed<OwnerStatCard[]>(() => {
    const stats = this.stats();
    if (!stats) return [];

    const trend = stats.viewsTrend ?? [];
    const todayViews = trend[trend.length - 1] ?? 0;
    const last7 = trend.slice(-7).reduce((a, b) => a + b, 0);
    const prev7 = trend.slice(-14, -7).reduce((a, b) => a + b, 0);
    const viewPct = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);
    const viewDelta = viewPct !== null
      ? `${viewPct >= 0 ? '+' : ''}${viewPct}% vs last week`
      : `+${todayViews} today`;
    const viewTone: OwnerStatCard['tone'] =
      viewPct === null ? (todayViews > 0 ? 'up' : 'flat')
        : viewPct > 0 ? 'up' : viewPct < 0 ? 'down' : 'flat';

    return [
      { label: 'Active listings', value: String(stats.activeListings ?? 0), delta: 'published', tone: 'flat' },
      { label: 'Saved by users', value: String(stats.savedByUsers ?? 0), delta: 'by renters', tone: 'up' },
      { label: 'Pending viewings', value: String(stats.pendingViewingRequests ?? 0), delta: 'await review', tone: 'flat' },
      { label: 'Total views', value: String(stats.totalViews ?? 0), delta: viewDelta, tone: viewTone },
    ];
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.listingService.getMy().subscribe({
      next: items => {
        this.listings.set(items ?? []);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(this.toMessage(err));
        this.loading.set(false);
      }
    });
    this.loadViewings();
    this.loadStats();
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

  toggleListingStatus(listing: ListingResponse): void {
    const request$ = listing.status === 'ACTIVE'
      ? this.listingService.deactivate(listing.id)
      : this.listingService.activate(listing.id);

    request$.subscribe({
      next: updated => this.listings.update(items => items.map(item => item.id === updated.id ? updated : item)),
      error: err => this.error.set(this.toMessage(err))
    });
  }

  deleteListing(listing: ListingResponse): void {
    const confirmed = window.confirm(`Delete "${listing.title}"? This listing will no longer be visible.`);
    if (!confirmed) {
      return;
    }

    this.listingService.delete(listing.id).subscribe({
      next: () => this.listings.update(items => items.filter(item => item.id !== listing.id)),
      error: err => this.error.set(this.toMessage(err))
    });
  }

  exportCsv(): void {
    const rows = this.listings();
    if (!rows.length) return;

    const header = [
      'ID', 'Title', 'City', 'Address', 'Price', 'Currency', 'Deal',
      'Status', 'Property type', 'Area', 'Rooms', 'Floor', 'Year built', 'Created at'
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

  editListing(listing: ListingResponse): void {
    void this.router.navigate(['/listings', listing.id, 'edit']);
  }

  private loadStats(): void {
    this.ownerService.getStats().subscribe({
      next: stats => this.stats.set(stats),
      error: () => this.stats.set(null)
    });
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
