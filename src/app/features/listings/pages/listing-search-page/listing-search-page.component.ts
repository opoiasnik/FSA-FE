import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MapStub, MapPin } from '../../../../shared/component/map-stub/map-stub';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { MockDataService } from '../../../../shared/services/mock-data.service';
import { formatPrice, shortLocation } from '../../models/listing.helpers';
import { ListingResponse, ListingType, PropertyType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

type PropertyFilter = 'ALL' | PropertyType;
type DealFilter = 'ALL' | ListingType;

@Component({
  selector: 'app-listing-search-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MessageModule, SkeletonModule, MapStub, PhotoPlaceholder],
  templateUrl: './listing-search-page.component.html',
  styleUrl: './listing-search-page.component.scss'
})
export class ListingSearchPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly mocks = inject(MockDataService);

  readonly filtersForm = this.fb.nonNullable.group({
    q: [''],
    propertyType: ['ALL' as PropertyFilter],
    listingType: ['ALL' as DealFilter]
  });

  readonly sort = signal<'relevance' | 'price-asc' | 'price-desc' | 'newest'>('relevance');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly selectedId = signal<number | null>(null);

  readonly results = computed(() => {
    const q = this.filtersForm.controls.q.value.trim().toLowerCase();
    const prop = this.filtersForm.controls.propertyType.value;
    const deal = this.filtersForm.controls.listingType.value;

    const filtered = this.listings().filter(item => {
      const matchQ = !q
        || item.title.toLowerCase().includes(q)
        || item.address.city.toLowerCase().includes(q)
        || item.address.country.toLowerCase().includes(q);
      const matchProp = prop === 'ALL' || item.features.propertyType === prop;
      const matchDeal = deal === 'ALL' || item.listingType === deal;
      return matchQ && matchProp && matchDeal;
    });

    return this.sortResults(filtered);
  });

  readonly mapPins = computed<MapPin[]>(() =>
    this.results()
      .filter(l => l.address.lat != null && l.address.lng != null)
      .map(l => ({ id: l.id, lat: l.address.lat!, lng: l.address.lng!, price: l.price.amount }))
  );

  readonly filterChips = ['Price', 'Rooms', 'Area', 'Furnished', 'Parking', 'Balcony', 'Pets', 'Energy class'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getAll().subscribe({
      next: (items) => {
        this.listings.set(Array.isArray(items) ? items : []);
        this.loading.set(false);
      },
      error: (error) => {
        this.listings.set([]);
        this.error.set(this.toMessage(error));
        this.loading.set(false);
      }
    });
  }

  openDetail(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  toggleSave(event: Event, id: number): void {
    event.stopPropagation();
    this.mocks.toggleFavourite(id);
  }

  isSaved(id: number): boolean {
    return this.mocks.isFavourite(id);
  }

  formatPrice = formatPrice;
  shortLocation = shortLocation;

  private sortResults(items: ListingResponse[]): ListingResponse[] {
    const sorted = [...items];
    switch (this.sort()) {
      case 'price-asc': return sorted.sort((a, b) => a.price.amount - b.price.amount);
      case 'price-desc': return sorted.sort((a, b) => b.price.amount - a.price.amount);
      case 'newest': return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default: return sorted;
    }
  }

  private toMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const maybe = error as { error?: { message?: string }; message?: string; status?: number };
      return maybe.error?.message ?? maybe.message ?? (maybe.status ? `Request failed with status ${maybe.status}.` : 'Unexpected error.');
    }
    return 'Unexpected error.';
  }
}
