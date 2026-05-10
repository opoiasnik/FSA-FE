import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MapView, MapPin } from '../../../../shared/component/map-view/map-view';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { FavoriteStore } from '../../../favourites/services/favorite.store';
import { SearchPill, SearchPillValues } from '../../../../shared/component/search-pill/search-pill.component';
import { ListingCard } from '../../components/listing-card/listing-card.component';
import { ListingFilterBar, ChipFilters } from '../../components/listing-filter-bar/listing-filter-bar.component';
import { ListingResponse, ListingSearchParams, ListingType, PropertyType, SortBy } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

const emptyFilters = (): ChipFilters => ({
  priceMin: null, priceMax: null, roomCount: null,
  areaMin: null,  areaMax: null,  furnished: null,
  parkingAvailable: null, balcony: null, petsAllowed: null, energyClass: null,
});

const emptyPill = (): SearchPillValues => ({
  q: '', propertyType: 'ALL', listingType: 'ALL',
});

@Component({
  selector: 'app-listing-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageModule, SkeletonModule, MapView, ListingCard, ListingFilterBar, SearchPill],
  templateUrl: './listing-search-page.component.html',
  styleUrl: './listing-search-page.component.scss',
})
export class ListingSearchPageComponent implements OnInit {
  private readonly router         = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly errorHandler   = inject(ErrorHandlerService);
  private readonly favoriteStore  = inject(FavoriteStore);

  private readonly pillValues  = signal<SearchPillValues>(emptyPill());
  private readonly chipFilters = signal<ChipFilters>(emptyFilters());

  readonly sortBy        = signal<SortBy | null>(null);
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly listings      = signal<ListingResponse[]>([]);
  readonly totalElements = signal(0);
  readonly selectedId    = signal<number | null>(null);
  readonly cityLabel     = computed(() => this.pillValues().q || 'Slovakia');

  readonly mapPins = computed<MapPin[]>(() =>
    this.listings()
      .filter(l => l.address.lat != null && l.address.lng != null)
      .map(l => ({
        id: l.id, lat: l.address.lat!, lng: l.address.lng!,
        price: l.price.amount, currency: l.price.currency,
        title: l.title, city: l.address.city,
        listingType: l.listingType,
        imageUrl: `https://picsum.photos/seed/rental-${l.id}/320/180`,
      }))
  );

  readonly sortOptions: { value: SortBy; label: string }[] = [
    { value: 'newest',     label: 'Newest first' },
    { value: 'price_asc',  label: 'Price: low → high' },
    { value: 'price_desc', label: 'Price: high → low' },
    { value: 'area_asc',   label: 'Area: small → large' },
    { value: 'area_desc',  label: 'Area: large → small' },
  ];

  ngOnInit(): void {
    this.favoriteStore.loadIfNeeded();
    this.load();
  }

  onPillSearch(values: SearchPillValues): void {
    this.pillValues.set(values);
    this.load();
  }

  onFiltersSearch(filters: ChipFilters): void {
    this.chipFilters.set(filters);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const p = this.pillValues();
    const f = this.chipFilters();
    const params: ListingSearchParams = {
      city:             p.q.trim() || undefined,
      listingType:      p.listingType  !== 'ALL' ? p.listingType  as ListingType  : undefined,
      propertyType:     p.propertyType !== 'ALL' ? p.propertyType as PropertyType : undefined,
      priceMin:         f.priceMin         ?? undefined,
      priceMax:         f.priceMax         ?? undefined,
      roomCount:        f.roomCount        ?? undefined,
      areaMin:          f.areaMin          ?? undefined,
      areaMax:          f.areaMax          ?? undefined,
      furnished:        f.furnished        ?? undefined,
      parkingAvailable: f.parkingAvailable ?? undefined,
      balcony:          f.balcony          ?? undefined,
      petsAllowed:      f.petsAllowed      ?? undefined,
      energyClass:      f.energyClass      ?? undefined,
      sortBy:           this.sortBy()      ?? undefined,
      page: 0,
      size: 20,
    };

    this.listingService.search(params).subscribe({
      next: res => {
        this.listings.set(res.content);
        this.totalElements.set(res.pagination.totalElements);
        this.loading.set(false);
      },
      error: err => {
        this.listings.set([]);
        this.error.set(this.errorHandler.toMessage(err));
        this.loading.set(false);
      },
    });
  }

  openDetail(id: number): void { void this.router.navigate(['/listings', id]); }

  toggleSave(id: number): void { this.favoriteStore.toggle(id); }

  isSaved(id: number): boolean { return this.favoriteStore.isFavorite(id); }
}
