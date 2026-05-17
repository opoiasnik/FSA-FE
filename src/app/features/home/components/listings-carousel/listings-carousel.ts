import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccessService } from '../../../../core/access/access';
import { ListingSummary } from '../../../listings/models/listing.model';
import { ListingCard } from '../listing-card/listing-card';

@Component({
  selector: 'app-listings-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, ListingCard],
  templateUrl: './listings-carousel.html',
  styleUrl: './listings-carousel.scss',
})
export class ListingsCarousel {
  private readonly access = inject(AccessService);

  @Input({ required: true }) title!: string;

  @Input({ required: true }) set items(v: ListingSummary[]) {
    this._items = v.slice(0, 5);
  }

  _items: ListingSummary[] = [];

  private readonly canSearchListings = this.access.can('searchListings');

  readonly viewMoreLink = computed(() => this.canSearchListings() ? '/listings' : '/login');
  readonly viewMoreQueryParams = computed(() => this.canSearchListings() ? null : { returnUrl: '/listings' });
}
