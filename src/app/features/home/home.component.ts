import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChipModule } from 'primeng/chip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ListingResponse } from '../listings/models/listing.model';
import { ListingService } from '../listings/services/listing.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ChipModule,
    TagModule,
    SkeletonModule,
    MessageModule,
    CarouselModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly listingService = inject(ListingService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);

  readonly searchText = signal('');
  readonly selectedPropertyType = signal<'ALL' | 'APARTMENT' | 'HOUSE' | 'ROOM'>('ALL');
  readonly selectedListingType = signal<'ALL' | 'RENT' | 'SALE'>('ALL');

  readonly propertyTypeOptions = [
    { label: 'Any type', value: 'ALL' },
    { label: 'Apartment', value: 'APARTMENT' },
    { label: 'House', value: 'HOUSE' },
    { label: 'Room', value: 'ROOM' }
  ];

  readonly listingTypeOptions = [
    { label: 'Any deal', value: 'ALL' },
    { label: 'Rent', value: 'RENT' },
    { label: 'Sale', value: 'SALE' }
  ];

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

  readonly responsiveOptions = [
    { breakpoint: '1400px', numVisible: 6, numScroll: 1 },
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '900px', numVisible: 3, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 }
  ];

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getAll().pipe(
      map((response) => this.toArray(response)),
      catchError(() => this.fetchByIdRange())
    ).subscribe({
      next: (items) => {
        this.listings.set(items);
        if (!items.length) {
          this.error.set('No listings were returned by the backend list endpoints.');
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

  scoreFromId(id: number): string {
    return (4.7 + ((id % 4) * 0.07)).toFixed(2);
  }

  imageUrl(id: number): string {
    return `https://picsum.photos/seed/rental-${id}/540/540`;
  }

  private fetchByIdRange() {
    const probes = Array.from({ length: 24 }, (_, index) => index + 1).map((id) =>
      this.listingService.getById(id).pipe(catchError(() => of(null)))
    );

    return forkJoin(probes).pipe(
      map((items) => items.filter((item): item is ListingResponse => item !== null))
    );
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
