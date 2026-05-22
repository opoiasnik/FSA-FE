import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListingResponse } from '../../models/listing.model';

export interface ListingFact {
  icon: string;
  label: string;
  value: string;
}

export interface ListingAmenity {
  key: 'furnished' | 'parkingAvailable' | 'balcony' | 'elevator' | 'petsAllowed';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-listing-detail-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-detail-overview.html',
  styleUrls: ['./listing-detail-overview.scss']
})
export class ListingDetailOverview {
  @Input({ required: true }) listing!: ListingResponse;
  @Input() facts: ListingFact[] = [];
  @Input() amenities: ListingAmenity[] = [];
  @Input() address = '';
  @Input() saved = false;
  @Input() ownListing = false;

  @Output() saveToggled = new EventEmitter<void>();
  @Output() shared = new EventEmitter<void>();

  hasAmenity(key: ListingAmenity['key']): boolean {
    return !!this.listing.features[key];
  }
}
