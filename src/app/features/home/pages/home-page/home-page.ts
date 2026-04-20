import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { map } from 'rxjs';
import { HeroSection } from '../../../../shared/component/hero-section/hero-section';
import { SearchFilters } from '../../../../shared/component/search-filters/search-filters';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { ListingsCarousel } from '../../components/listings-carousel/listings-carousel';
import { ModeTabs } from '../../components/mode-tabs/mode-tabs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    MessageModule,
    HeroSection,
    SearchFilters,
    ModeTabs,
    ListingsCarousel
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage implements OnInit {
  private readonly listingService = inject(ListingService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);

  readonly searchText = signal('');
  readonly selectedPropertyType = signal<'ALL' | 'APARTMENT' | 'HOUSE' | 'ROOM'>('ALL');
  readonly selectedListingType = signal<'ALL' | 'RENT' | 'SALE'>('ALL');

  readonly filteredListings = computed(() =>
    this.listings().filter((item) => {
      const query = this.searchText().trim().toLowerCase();
      const propertyFilter = this.selectedPropertyType();
      const listingFilter = this.selectedListingType();

      const matchesQuery =
        !query
        || item.title.toLowerCase().includes(query)
        || item.address.city.toLowerCase().includes(query)
        || item.address.country.toLowerCase().includes(query);
      const matchesProperty = propertyFilter === 'ALL' || item.features.propertyType === propertyFilter;
      const matchesListingType = listingFilter === 'ALL' || item.listingType === listingFilter;

      return matchesQuery && matchesProperty && matchesListingType;
    })
  );
  readonly firstCity = computed(() => this.filteredListings()[0]?.address.city ?? 'Popular');

  readonly featuredListings = computed(() => this.filteredListings().slice(0, 12));
  readonly extraListings = computed(() => this.filteredListings().slice(12, 24));

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getAll().pipe(
      map((response) => this.toArray(response))
    ).subscribe({
      next: (items) => {
        this.listings.set(items);
        if (!items.length) {
          this.error.set('No listings were returned by the backend featured endpoint.');
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.listings.set([]);
        this.error.set(this.toMessage(error));
        this.loading.set(false);
      }
    });
  }

  setSearchText(value: string): void {
    this.searchText.set(value);
  }

  setPropertyType(value: 'ALL' | 'APARTMENT' | 'HOUSE' | 'ROOM'): void {
    this.selectedPropertyType.set(value);
  }

  setListingType(value: 'ALL' | 'RENT' | 'SALE'): void {
    this.selectedListingType.set(value);
  }

  private toArray(value: unknown): ListingResponse[] {
    if (Array.isArray(value)) {
      return value as ListingResponse[];
    }

    if (value && typeof value === 'object') {
      const wrapped = value as { content?: ListingResponse[]; items?: ListingResponse[]; data?: ListingResponse[] };
      if (Array.isArray(wrapped.content)) {
        return wrapped.content;
      }
      if (Array.isArray(wrapped.items)) {
        return wrapped.items;
      }
      if (Array.isArray(wrapped.data)) {
        return wrapped.data;
      }
    }

    return [];
  }

  private toMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const maybeHttp = error as { error?: { message?: string }; message?: string; status?: number };
      return maybeHttp.error?.message
        ?? maybeHttp.message
        ?? (maybeHttp.status ? `Request failed with status ${maybeHttp.status}.` : 'Unexpected error.');
    }

    return 'Unexpected error.';
  }
}
