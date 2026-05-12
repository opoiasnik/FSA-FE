import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ListingResponse } from '../../models/listing.model';

@Component({
  selector: 'app-listing-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-detail-card.html',
  styleUrl: './listing-detail-card.scss'
})
export class ListingDetailCard {
  @Input({ required: true }) listing!: ListingResponse;
}
