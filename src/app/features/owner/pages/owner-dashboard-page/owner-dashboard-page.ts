import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MockDataService, OwnerStats, ViewingEntry } from '../../../../shared/services/mock-data.service';
import { formatPrice, shortLocation } from '../../../listings/models/listing.helpers';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';

interface StatCard { label: string; value: string; delta: string; tone: 'up' | 'down' | 'flat'; }

@Component({
  selector: 'app-owner-dashboard-page',
  standalone: true,
  imports: [CommonModule, MessageModule, SkeletonModule],
  templateUrl: './owner-dashboard-page.html',
  styleUrl: './owner-dashboard-page.scss'
})
export class OwnerDashboardPage implements OnInit {
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly mocks = inject(MockDataService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly stats = signal<OwnerStats>(this.mocks.getOwnerStats());
  readonly viewings = signal<ViewingEntry[]>([]);

  readonly statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    return [
      { label: 'Active listings', value: String(s.activeListings), delta: '+1 this month', tone: 'up' },
      { label: 'Total views', value: s.totalViews.toLocaleString('sk-SK'), delta: '+12% week on week', tone: 'up' },
      { label: 'Saved by users', value: String(s.savedByUsers), delta: '+8 new', tone: 'up' },
      { label: 'Open conversations', value: String(s.openConversations), delta: '2 need a reply', tone: 'flat' }
    ];
  });

  readonly trendPath = computed(() => {
    const pts = this.stats().viewsTrend;
    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = max - min || 1;
    const w = 320, h = 80;
    return pts.map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.listingService.getAll().subscribe({
      next: items => {
        this.listings.set(items ?? []);
        this.viewings.set(this.mocks.getViewings(items ?? []));
        this.loading.set(false);
      },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
  }

  createListing(): void {
    void this.router.navigate(['/listings/create']);
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  viewingListing(v: ViewingEntry): ListingResponse | undefined {
    return this.listings().find(l => l.id === v.listingId);
  }

  formatPrice = formatPrice;
  shortLocation = shortLocation;

  private toMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const m = error as { error?: { message?: string }; message?: string; status?: number };
      return m.error?.message ?? m.message ?? (m.status ? `Request failed with status ${m.status}.` : 'Unexpected error.');
    }
    return 'Unexpected error.';
  }
}
