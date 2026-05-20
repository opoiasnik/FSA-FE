import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ListingResponse } from '../../../listings/models/listing.model';

@Component({
  selector: 'app-owner-listings-table',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './owner-listings-table.html',
  styleUrls: ['./owner-listings-table.scss']
})
export class OwnerListingsTable {
  @Input() listings: ListingResponse[] = [];
  @Input() loading = false;
  @Input() canActivateListing = false;
  @Input() canDeactivateListing = false;
  @Output() exported = new EventEmitter<void>();
  @Output() opened = new EventEmitter<number>();
  @Output() statusToggled = new EventEmitter<ListingResponse>();

  canToggleListingStatus(listing: ListingResponse): boolean {
    return listing.status === 'ACTIVE' ? this.canDeactivateListing : this.canActivateListing;
  }

  toggleListingStatus(event: MouseEvent, listing: ListingResponse): void {
    event.stopPropagation();
    this.statusToggled.emit(listing);
  }

  formatPrice(listing: ListingResponse): string {
    const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
    return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' €' + suffix;
  }

  shortLocation(listing: ListingResponse): string {
    return listing.address.city;
  }
}
