import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MapPin, MapView } from '../../../../shared/component/map-view/map-view';

@Component({
  selector: 'app-listing-location-section',
  standalone: true,
  imports: [CommonModule, MapView],
  templateUrl: './listing-location-section.html',
  styleUrls: ['./listing-location-section.scss']
})
export class ListingLocationSection {
  @Input({ required: true }) listingId!: number;
  @Input() mapPins: MapPin[] = [];
  @Input() address = '';
}
