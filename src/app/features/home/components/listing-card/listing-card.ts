import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FavoriteStore } from '../../../favourites/services/favorite.store';
import { UserService } from '../../../../core/services/user.service';
import { ListingSummary } from '../../../listings/models/listing.model';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, PhotoPlaceholder],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss'
})
export class ListingCard {
  @Input({ required: true }) listing!: ListingSummary;
  @Input() badge = 'Top offer';

  private readonly favoriteStore = inject(FavoriteStore);
  private readonly userService = inject(UserService);

  readonly isFavorite = computed(() => this.favoriteStore.isFavorite(this.listing.id));
  readonly canFavorite = computed(() => this.userService.isUserLoggedIn());

  get imageUrl(): string | null {
    return this.listing.coverPhoto?.contentUrl ?? null;
  }

  get priceSuffix(): string {
    return this.listing.listingType === 'RENT' ? '/month' : '';
  }

  get location(): string {
    return this.listing.city;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteStore.toggle(this.listing.id);
  }
}
