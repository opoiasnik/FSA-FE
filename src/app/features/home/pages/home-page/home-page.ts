import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ListingSummary, ListingType, PropertyType } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { HeroSection } from '../../components/hero-section/hero-section';
import { ListingsCarousel } from '../../components/listings-carousel/listings-carousel';
import { ModeTabs } from '../../components/mode-tabs/mode-tabs';
import { PopularRegions } from '../../components/popular-regions/popular-regions';
import { PropertyTypes } from '../../components/property-types/property-types';
import { SearchFilters } from '../../components/search-filters/search-filters';

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
    ListingsCarousel,
    PropertyTypes,
    PopularRegions
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage implements OnInit {
  private readonly listingService = inject(ListingService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingSummary[]>([]);

  readonly searchText = signal('');
  readonly selectedPropertyType = signal<'ALL' | 'APARTMENT' | 'HOUSE' | 'ROOM'>('ALL');
  readonly selectedListingType = signal<'ALL' | 'RENT' | 'SALE'>('ALL');

  readonly firstCity = computed(() => this.listings()[0]?.city ?? 'Popular');
  readonly featuredListings = computed(() => this.listings().slice(0, 12));
  readonly extraListings = computed(() => this.listings().slice(12, 24));

  ngOnInit(): void {
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getFeatured().subscribe({
      next: (items) => {
        this.listings.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.listings.set([]);
        this.error.set(this.toMessage(err));
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loading.set(true);
    this.error.set(null);

    const city = this.searchText().trim() || undefined;
    const listingType = this.selectedListingType() === 'ALL' ? undefined : this.selectedListingType() as ListingType;
    const propertyType = this.selectedPropertyType() === 'ALL' ? undefined : this.selectedPropertyType() as PropertyType;

    this.listingService.getFeatured({ city, listingType, propertyType }).subscribe({
      next: (items) => {
        this.listings.set(items);
        if (!items.length) {
          this.error.set('No listings found for the selected filters.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.listings.set([]);
        this.error.set(this.toMessage(err));
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

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
