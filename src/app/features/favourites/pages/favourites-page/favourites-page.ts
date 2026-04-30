import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { MockDataService, SavedSearch } from '../../../../shared/services/mock-data.service';
import { formatPrice, shortLocation } from '../../../listings/models/listing.helpers';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';

type Tab = 'ALL' | 'RENT' | 'SALE';

@Component({
  selector: 'app-favourites-page',
  standalone: true,
  imports: [CommonModule, MessageModule, SkeletonModule, EmptyState, PhotoPlaceholder],
  templateUrl: './favourites-page.html',
  styleUrl: './favourites-page.scss'
})
export class FavouritesPage implements OnInit {
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly mocks = inject(MockDataService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly tab = signal<Tab>('ALL');
  readonly savedSearches = signal<SavedSearch[]>(this.mocks.getSavedSearches());

  readonly saved = computed(() => {
    const ids = this.mocks.getFavouriteIds();
    return this.listings().filter(l => ids.has(l.id));
  });

  readonly filtered = computed(() => {
    const t = this.tab();
    if (t === 'ALL') return this.saved();
    return this.saved().filter(l => l.listingType === t);
  });

  readonly counts = computed(() => {
    const s = this.saved();
    return {
      ALL: s.length,
      RENT: s.filter(l => l.listingType === 'RENT').length,
      SALE: s.filter(l => l.listingType === 'SALE').length
    };
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.listingService.getFeatured().subscribe({
      next: items => { this.listings.set(items ?? []); this.loading.set(false); },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
  }

  open(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  remove(event: Event, id: number): void {
    event.stopPropagation();
    this.mocks.toggleFavourite(id);
    this.listings.set([...this.listings()]);
  }

  browse(): void {
    void this.router.navigate(['/listings']);
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
