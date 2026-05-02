import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MapPin } from '../map-view';

@Component({
  selector: 'app-map-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-preview.html',
  styleUrl: './map-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapPreview {
  @Input({ required: true }) pin!: MapPin;

  get priceLabel(): string {
    if (this.pin.price == null) return '';
    const cur = this.pin.currency === 'USD' ? '$' : '€';
    return new Intl.NumberFormat('sk-SK').format(this.pin.price) + ' ' + cur;
  }

  get isRent(): boolean {
    return this.pin.listingType === 'RENT';
  }
}
