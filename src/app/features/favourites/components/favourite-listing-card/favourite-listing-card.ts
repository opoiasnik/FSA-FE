import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { ListingSummary } from '../../../listings/models/listing.model';

@Component({
  selector: 'app-favourite-listing-card',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './favourite-listing-card.html',
  styleUrls: ['./favourite-listing-card.scss']
})
export class FavouriteListingCard {
  @Input({ required: true }) listing!: ListingSummary;

  @Output() opened = new EventEmitter<number>();
  @Output() removed = new EventEmitter<number>();

  open(): void {
    this.opened.emit(this.listing.id);
  }

  remove(event: Event): void {
    event.stopPropagation();
    this.removed.emit(this.listing.id);
  }

  formatPrice(): string {
    const suffix = this.listing.listingType === 'RENT' ? ' / mo' : '';
    return `${new Intl.NumberFormat('sk-SK').format(this.listing.price.amount)} €${suffix}`;
  }
}
