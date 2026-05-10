import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { formatPrice, shortLocation } from '../../models/listing.helpers';
import { ListingResponse } from '../../models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCard {
  @Input({ required: true }) listing!: ListingResponse;
  @Input() saved = false;

  @Output() cardClick  = new EventEmitter<void>();
  @Output() saveToggle = new EventEmitter<void>();

  onSaveClick(event: Event): void {
    event.stopPropagation();
    this.saveToggle.emit();
  }

  readonly formatPrice   = formatPrice;
  readonly shortLocation = shortLocation;
}
