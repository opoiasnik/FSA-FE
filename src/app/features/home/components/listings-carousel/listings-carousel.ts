import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListingSummary } from '../../../listings/models/listing.model';
import { ListingCard } from '../listing-card/listing-card';

@Component({
  selector: 'app-listings-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, ListingCard],
  templateUrl: './listings-carousel.html',
  styleUrl: './listings-carousel.scss',
})
export class ListingsCarousel {
  @Input({ required: true }) title!: string;
  @Input() imageSeedOffset = 0;

  @Input({ required: true }) set items(v: ListingSummary[]) {
    this._items = v.slice(0, 5);
  }

  _items: ListingSummary[] = [];
}
