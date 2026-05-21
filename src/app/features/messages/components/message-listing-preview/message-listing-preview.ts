import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { ListingSummary } from '../../../listings/models/listing.model';

@Component({
  selector: 'app-message-listing-preview',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './message-listing-preview.html',
  styleUrls: ['./message-listing-preview.scss']
})
export class MessageListingPreview {
  @Input() listing: ListingSummary | null = null;
  @Input() photoUrl: string | null = null;
  @Output() opened = new EventEmitter<number>();

  formatPrice(listing: ListingSummary): string {
    const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
    return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' EUR' + suffix;
  }

  isDeleted(listing: ListingSummary): boolean {
    return listing.status === 'DELETED';
  }

  openListing(): void {
    if (this.listing && !this.isDeleted(this.listing)) {
      this.opened.emit(this.listing.id);
    }
  }
}
