import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { MapView, MapPin } from '../../../../shared/component/map-view/map-view';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { formatAmount, fullAddress } from '../../models/listing.helpers';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserService } from '../../../../core/services/user.service';
import { FavoriteStore } from '../../../favourites/services/favorite.store';
import { ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

interface Fact {
  icon: string;
  label: string;
  value: string;
}

interface Amenity {
  key: 'furnished' | 'parkingAvailable' | 'balcony' | 'elevator' | 'petsAllowed';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MessageModule, SkeletonModule, Avatar, MapView, PhotoPlaceholder],
  templateUrl: './listing-detail-page.html',
  styleUrl: './listing-detail-page.scss'
})
export class ListingDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly favoriteStore = inject(FavoriteStore);
  private readonly userService = inject(UserService);

  readonly listing = signal<ListingResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = computed(() => {
    const item = this.listing();
    return item ? this.favoriteStore.isFavorite(item.id) : false;
  });
  readonly canFavorite = computed(() => this.userService.isUserLoggedIn());

  readonly owner = computed(() => {
    const item = this.listing();
    if (!item?.owner) return undefined;
    return {
      name: item.owner.name,
      email: item.owner.email,
      role: item.owner.role === 'OWNER' ? 'Private owner' : 'User',
      avatarHue: 200,
      verified: true,
      rating: null as number | null,
      responseRate: null as number | null
    };
  });

  readonly fullAddress = computed(() => {
    const item = this.listing();
    return item ? fullAddress(item) : '';
  });

  readonly priceAmount = computed(() => {
    const item = this.listing();
    return item ? formatAmount(item.price.amount) : '';
  });

  readonly pricePerSqm = computed(() => {
    const item = this.listing();
    if (!item || !item.features.area) return '';
    const perM2 = Math.round(item.price.amount / item.features.area);
    return formatAmount(perM2) + ' / m²';
  });

  readonly facts = computed<Fact[]>(() => {
    const item = this.listing();
    if (!item) return [];
    const f = item.features;
    return [
      { icon: 'pi-home', label: 'Type', value: f.propertyType.toLowerCase() },
      { icon: 'pi-expand', label: 'Area', value: f.area ? `${f.area} m²` : '—' },
      { icon: 'pi-th-large', label: 'Rooms', value: f.roomCount?.toString() ?? '—' },
      { icon: 'pi-sort-amount-up', label: 'Floor', value: f.floor?.toString() ?? '—' },
      { icon: 'pi-bolt', label: 'Energy', value: f.energyClass ? `Class ${f.energyClass}` : '—' },
      { icon: 'pi-calendar', label: 'Built', value: f.yearBuilt?.toString() ?? '—' }
    ];
  });

  readonly amenities: Amenity[] = [
    { key: 'furnished', label: 'Furnished', icon: 'pi-inbox' },
    { key: 'parkingAvailable', label: 'Parking included', icon: 'pi-car' },
    { key: 'balcony', label: 'Balcony', icon: 'pi-sun' },
    { key: 'elevator', label: 'Elevator', icon: 'pi-arrow-up' },
    { key: 'petsAllowed', label: 'Pets allowed', icon: 'pi-heart' }
  ];

  readonly mapPin = computed<MapPin[]>(() => {
    const item = this.listing();
    if (!item?.address.lat || !item?.address.lng) return [];
    return [{ id: item.id, lat: item.address.lat, lng: item.address.lng }];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      void this.router.navigate(['/listings']);
      return;
    }

    this.favoriteStore.loadIfNeeded();
    this.loadListing(id);
  }

  loadListing(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getById(id).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(this.toMessage(error));
        this.loading.set(false);
      }
    });
  }

  toggleSave(): void {
    const item = this.listing();
    if (!item) return;
    this.favoriteStore.toggle(item.id);
  }

  hasAmenity(key: Amenity['key']): boolean {
    const features = this.listing()?.features;
    return !!features && !!features[key];
  }

  openMessages(): void {
    void this.router.navigate(['/messages']);
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
