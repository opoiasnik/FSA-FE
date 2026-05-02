import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MockDataService, OwnerStats } from '../../../../shared/services/mock-data.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { ViewingRequestResponse, ViewingService } from '../../../viewings/services/viewing.service';

interface StatCard { label: string; value: string; delta: string; tone: 'up' | 'down' | 'flat'; }

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
  private readonly mocks = inject(MockDataService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly stats = signal<OwnerStats>(this.mocks.getOwnerStats());
  readonly viewingRequests = signal<ViewingRequestResponse[]>([]);

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
    this.listingService.getMy().subscribe({
      next: items => {
        this.listings.set(items ?? []);
        this.loading.set(false);
      },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
    this.loadViewings();
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

  createListing(): void {
    void this.router.navigate(['/listings/create']);
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  formatPrice(listing: ListingResponse): string {
    const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
    return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' €' + suffix;
  }

  shortLocation(listing: ListingResponse): string {
    return listing.address.city;
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
