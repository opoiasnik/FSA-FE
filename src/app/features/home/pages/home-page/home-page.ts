import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { FavoriteStore } from '../../../favourites/services/favorite.store';
import { ListingSummary } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { SearchPill, SearchPillValues } from '../../../../shared/component/search-pill/search-pill.component';
import { HeroSection } from '../../components/hero-section/hero-section';
import { ListingsCarousel } from '../../components/listings-carousel/listings-carousel';
import { ModeTabs } from '../../components/mode-tabs/mode-tabs';
import { PopularRegions } from '../../components/popular-regions/popular-regions';
import { PropertyTypes } from '../../components/property-types/property-types';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonModule,
    MessageModule,
    HeroSection,
    SearchPill,
    ModeTabs,
    ListingsCarousel,
    PropertyTypes,
    PopularRegions,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly listingService = inject(ListingService);
  private readonly errorHandler   = inject(ErrorHandlerService);
  private readonly favoriteStore  = inject(FavoriteStore);

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly listings = signal<ListingSummary[]>([]);

  readonly firstCity       = computed(() => this.listings()[0]?.city ?? 'Featured');
  readonly featuredListings = computed(() => this.listings().slice(0, 6));

  ngOnInit(): void {
    this.favoriteStore.loadIfNeeded();
    this.loadFeatured();
  }

  onSearch(values: SearchPillValues): void {
    this.loadFeatured(values.q.trim() || undefined);
  }

  private loadFeatured(city?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getFeatured({ city }).subscribe({
      next: items => {
        this.listings.set(items);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(this.errorHandler.toMessage(err));
        this.loading.set(false);
      },
    });
  }
}
