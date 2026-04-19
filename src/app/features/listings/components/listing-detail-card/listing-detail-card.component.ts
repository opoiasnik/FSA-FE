import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ListingResponse } from '../../models/listing.model';

@Component({
  selector: 'app-listing-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-detail-card.component.html',
  styleUrl: './listing-detail-card.component.scss'
})
export class ListingDetailCardComponent {
  @Input({ required: true }) listing!: ListingResponse;
}
