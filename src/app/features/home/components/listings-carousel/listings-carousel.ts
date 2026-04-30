import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingCard } from '../listing-card/listing-card';

@Component({
  selector: 'app-listings-carousel',
  standalone: true,
  imports: [CommonModule, ListingCard],
  templateUrl: './listings-carousel.html',
  styleUrl: './listings-carousel.scss'
})
export class ListingsCarousel {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: ListingResponse[] = [];
  @Input() imageSeedOffset = 0;
}
