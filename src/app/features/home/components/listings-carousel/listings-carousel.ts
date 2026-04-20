import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingCard } from '../listing-card/listing-card';

@Component({
  selector: 'app-listings-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule, ListingCard],
  templateUrl: './listings-carousel.html',
  styleUrl: './listings-carousel.scss'
})
export class ListingsCarousel {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: ListingResponse[] = [];
  @Input() imageSeedOffset = 0;
  @Input() scoreSeedOffset = 0;

  readonly responsiveOptions = [
    { breakpoint: '1400px', numVisible: 6, numScroll: 1 },
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '900px', numVisible: 3, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 }
  ];
}
