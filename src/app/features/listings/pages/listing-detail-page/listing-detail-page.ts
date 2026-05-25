import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { MessageService as ToastService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { MapPin } from '../../../../shared/component/map-view/map-view';
import { formatAmount, fullAddress } from '../../models/listing.helpers';
import { AccessService } from '../../../../core/access/access';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ImageContentService } from '../../../../core/services/image-content.service';
import { UserService } from '../../../../core/services/user.service';
import { FavoriteStore } from '../../../favourites/services/favorite.store';
import { MessageService } from '../../../messages/services/message.service';
import { ViewingRequestResponse, ViewingService, ViewingStatus } from '../../../viewings/services/viewing.service';
import { ListingDetailSidebar, ListingSidebarOwner } from '../../components/listing-detail-sidebar/listing-detail-sidebar';
import { ListingAmenity, ListingDetailOverview, ListingFact } from '../../components/listing-detail-overview/listing-detail-overview';
import { ListingGallery } from '../../components/listing-gallery/listing-gallery';
import { ListingLocationSection } from '../../components/listing-location-section/listing-location-section';
import { ListingViewingDialog } from '../../components/listing-viewing-dialog/listing-viewing-dialog';
import { ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MessageModule, SkeletonModule, ListingGallery, ListingDetailOverview, ListingDetailSidebar, ListingLocationSection, ListingViewingDialog],
  templateUrl: './listing-detail-page.html',
  styleUrl: './listing-detail-page.scss'
})
export class ListingDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly imageContentService = inject(ImageContentService);
  private readonly favoriteStore = inject(FavoriteStore);
  private readonly userService = inject(UserService);
  private readonly access = inject(AccessService);
  private readonly messageService = inject(MessageService);
  private readonly toast = inject(ToastService);
  private readonly viewingService = inject(ViewingService);

  readonly listing = signal<ListingResponse | null>(null);
  readonly photoImageUrls = signal<Record<number, string>>({});
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = computed(() => {
    const item = this.listing();
    return item ? this.favoriteStore.isFavorite(item.id) : false;
  });
  readonly canFavorite = this.access.can('saveFavorite');
  private readonly canBookViewingAccess = this.access.can('bookViewing');
  private readonly canSendMessageAccess = this.access.can('sendMessage');

  readonly viewingForm = signal(false);
  readonly viewingDate = signal<Date | null>(null);
  readonly viewingNote = signal('');
  readonly creatingViewing = signal(false);
  readonly viewingError = signal<string | null>(null);
  readonly viewingSuccess = signal(false);
  readonly currentViewingRequest = signal<ViewingRequestResponse | null>(null);
  readonly loadingCurrentViewingRequest = signal(false);
  readonly openingConversation = signal(false);
  readonly ownerAvatarUrl = signal<string | null>(null);
  readonly today = new Date();
  private photoObjectUrls: string[] = [];
  private ownerAvatarObjectUrl: string | null = null;

  readonly canBookViewing = computed(() => {
    return this.canBookViewingAccess() && !this.isOwnListing()
      && !this.loadingCurrentViewingRequest() && !this.hasActiveViewingRequest();
  });
  readonly canMessageOwner = computed(() => this.canSendMessageAccess() && !this.isOwnListing());
  readonly isOwnListing = computed(() => {
    const item = this.listing();
    const userEmail = this.userService.getUserSnapshot()?.email;
    return !!item?.owner?.email && !!userEmail
      && item.owner.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
  });

  private canContactOwner(): boolean {
    return !!this.listing() && this.canSendMessageAccess() && !this.isOwnListing();
  }

  readonly owner = computed<ListingSidebarOwner | undefined>(() => {
    const item = this.listing();
    if (!item?.owner) return undefined;
    return {
      name: [item.owner.name, item.owner.surname].filter(Boolean).join(' '),
      role: item.owner.role === 'OWNER' ? 'Private owner' : 'User',
      phone: item.owner.phone,
      avatarHue: 200,
      avatarUrl: this.ownerAvatarUrl(),
      verified: true
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

  readonly listingViews = computed(() => this.listing()?.stats?.views ?? 0);
  readonly canViewListingStats = this.access.can('viewListingStats');

  readonly facts = computed<ListingFact[]>(() => {
    const item = this.listing();
    if (!item) return [];
    const f = item.features;
    const facts: ListingFact[] = [
      { icon: 'pi-home', label: 'Type', value: f.propertyType.toLowerCase() },
      { icon: 'pi-expand', label: 'Area', value: f.area ? `${f.area} m²` : '—' },
      { icon: 'pi-th-large', label: 'Rooms', value: f.roomCount?.toString() ?? '—' },
      { icon: 'pi-sort-amount-up', label: 'Floor', value: f.floor?.toString() ?? '—' },
      { icon: 'pi-bolt', label: 'Energy', value: f.energyClass ? `Class ${f.energyClass}` : '—' },
      { icon: 'pi-calendar', label: 'Built', value: f.yearBuilt?.toString() ?? '—' }
    ];

    return facts;
  });

  readonly amenities: ListingAmenity[] = [
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

  ngOnDestroy(): void {
    this.revokePhotoObjectUrls();
    this.revokeOwnerAvatarObjectUrl();
  }

  loadListing(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.listingService.getById(id).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.loadPhotoContents(listing);
        this.loadOwnerAvatar(listing);
        if (!this.isOwnListing()) {
          this.loadCurrentViewingRequest(listing.id);
        }
        this.loading.set(false);
        if (!this.isOwnListing()) {
          this.listingService.recordView(id).subscribe({ error: () => {} });
        }
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

  async shareListing(): Promise<void> {
    const item = this.listing();
    if (!item) {
      return;
    }

    const url = window.location.href;
    const data = {
      title: item.title,
      text: `${item.title} in ${item.address.city}`,
      url
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        this.toast.add({
          severity: 'success',
          summary: 'Listing shared',
          detail: 'The listing link was shared.'
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      this.toast.add({
        severity: 'success',
        summary: 'Link copied',
        detail: 'The listing link was copied to your clipboard.'
      });
    } catch {
      // Sharing can be cancelled by the user.
    }
  }

  private loadPhotoContents(listing: ListingResponse): void {
    this.revokePhotoObjectUrls();
    this.photoImageUrls.set({});

    for (const photo of listing.photos ?? []) {
      this.listingService.loadPhotoObjectUrl(photo.contentUrl).subscribe({
        next: objectUrl => {
          this.photoObjectUrls.push(objectUrl);
          this.photoImageUrls.update(urls => ({ ...urls, [photo.id]: objectUrl }));
        },
        error: () => {}
      });
    }
  }

  private revokePhotoObjectUrls(): void {
    this.photoObjectUrls.forEach(url => this.listingService.revokePhotoObjectUrl(url));
    this.photoObjectUrls = [];
  }

  private loadOwnerAvatar(listing: ListingResponse): void {
    this.revokeOwnerAvatarObjectUrl();
    this.ownerAvatarUrl.set(null);

    const avatarUrl = listing.owner?.avatarUrl;
    if (!avatarUrl) {
      return;
    }

    this.imageContentService.loadObjectUrl(avatarUrl).subscribe({
      next: objectUrl => {
        this.revokeOwnerAvatarObjectUrl();
        this.ownerAvatarObjectUrl = objectUrl;
        this.ownerAvatarUrl.set(objectUrl);
      },
      error: () => {}
    });
  }

  private revokeOwnerAvatarObjectUrl(): void {
    this.imageContentService.revokeObjectUrl(this.ownerAvatarObjectUrl);
    this.ownerAvatarObjectUrl = null;
  }

  openMessages(): void {
    const item = this.listing();
    if (!item || !this.canMessageOwner() || this.openingConversation()) return;

    this.openingConversation.set(true);
    this.messageService.openConversation({ listingId: item.id }).subscribe({
      next: conversation => {
        this.openingConversation.set(false);
        this.toast.add({
          severity: 'success',
          summary: 'Conversation ready',
          detail: 'You can now message the owner.'
        });
        void this.router.navigate(['/messages', conversation.id]);
      },
      error: err => {
        this.showError('Conversation not opened', err);
        this.openingConversation.set(false);
      }
    });
  }

  openViewingForm(): void {
    if (!this.canBookViewing()) {
      return;
    }
    this.viewingError.set(null);
    this.viewingSuccess.set(false);
    this.viewingForm.set(true);
  }

  cancelViewingForm(): void {
    this.viewingForm.set(false);
    this.viewingDate.set(null);
    this.viewingNote.set('');
    this.viewingError.set(null);
  }

  setViewingDate(value: Date | null): void {
    this.viewingDate.set(value);
  }

  setViewingNote(value: string): void {
    this.viewingNote.set(value);
  }

  submitViewing(): void {
    const item = this.listing();
    const date = this.viewingDate();
    if (!item || !date) return;

    this.creatingViewing.set(true);
    this.viewingError.set(null);
    this.viewingService.create({
      listingId: item.id,
      requestedDate: date.toISOString(),
      note: this.viewingNote() || undefined
    }).subscribe({
      next: viewingRequest => {
        this.currentViewingRequest.set(viewingRequest);
        this.viewingSuccess.set(true);
        this.creatingViewing.set(false);
        this.viewingForm.set(false);
        this.viewingDate.set(null);
        this.viewingNote.set('');
        this.toast.add({
          severity: 'success',
          summary: 'Viewing requested',
          detail: 'The owner will see your viewing request.'
        });
      },
      error: (err) => {
        this.viewingError.set(this.toMessage(err));
        this.toast.add({
          severity: 'error',
          summary: 'Viewing not requested',
          detail: this.toMessage(err)
        });
        this.creatingViewing.set(false);
      }
    });
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }

  private showError(summary: string, error: unknown): void {
    const detail = this.toMessage(error);
    this.error.set(detail);
    this.toast.add({ severity: 'error', summary, detail });
  }

  private loadCurrentViewingRequest(listingId: number): void {
    this.currentViewingRequest.set(null);
    if (!this.canBookViewingAccess()) {
      return;
    }

    this.loadingCurrentViewingRequest.set(true);
    this.viewingService.getMy().subscribe({
      next: requests => {
        const current = (requests ?? []).find(request =>
          request.listing.id === listingId && this.isActiveViewingStatus(request.status)
        );
        this.currentViewingRequest.set(current ?? null);
        this.loadingCurrentViewingRequest.set(false);
      },
      error: () => {
        this.currentViewingRequest.set(null);
        this.loadingCurrentViewingRequest.set(false);
      }
    });
  }

  private hasActiveViewingRequest(): boolean {
    const request = this.currentViewingRequest();
    return !!request && this.isActiveViewingStatus(request.status);
  }

  private isActiveViewingStatus(status: ViewingStatus): boolean {
    return status === 'PENDING' || status === 'APPROVED';
  }
}
