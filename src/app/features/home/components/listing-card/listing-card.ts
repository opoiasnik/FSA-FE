import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ListingResponse } from '../../../listings/models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss'
})
export class ListingCard {
  @Input({ required: true }) listing!: ListingResponse;
  @Input() imageSeedOffset = 0;
  @Input() scoreSeedOffset = 0;
  @Input() badge = 'Guest favorite';

  get imageUrl(): string {
    return `https://picsum.photos/seed/rental-${this.listing.id + this.imageSeedOffset}/540/540`;
  }

  get score(): string {
    const id = this.listing.id + this.scoreSeedOffset;
    return (4.7 + ((id % 4) * 0.07)).toFixed(2);
  }
}
