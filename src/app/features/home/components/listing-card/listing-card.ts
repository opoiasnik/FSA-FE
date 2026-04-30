import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ListingResponse } from '../../../listings/models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss'
})
export class ListingCard {
  @Input({ required: true }) listing!: ListingResponse;
  @Input() imageSeedOffset = 0;
  @Input() badge = 'Top offer';

  get imageUrl(): string {
    return `https://picsum.photos/seed/rental-${this.listing.id + this.imageSeedOffset}/540/540`;
  }

  get priceSuffix(): string {
    return this.listing.listingType === 'RENT' ? '/month' : '';
  }

  get location(): string {
    const { city, country } = this.listing.address;
    return [city, country].filter(Boolean).join(', ');
  }
}
