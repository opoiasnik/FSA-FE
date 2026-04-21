import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

export interface MapPin {
  id: number;
  lat: number;
  lng: number;
  price?: number;
}

@Component({
  selector: 'app-map-stub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-stub.html',
  styleUrl: './map-stub.scss'
})
export class MapStub {
  private readonly _pins = signal<MapPin[]>([]);

  @Input() set pins(value: MapPin[]) { this._pins.set(value ?? []); }
  @Input() selectedId: number | null = null;
  @Input() showPrices = true;
  @Output() pinSelect = new EventEmitter<number>();

  readonly bounds = computed(() => {
    const items = this._pins();
    const lats = items.map(p => p.lat);
    const lngs = items.map(p => p.lng);
    const minLat = Math.min(...lats, 48);
    const maxLat = Math.max(...lats, 49.5);
    const minLng = Math.min(...lngs, 17);
    const maxLng = Math.max(...lngs, 22);
    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      dLat: maxLat - minLat || 1,
      dLng: maxLng - minLng || 1
    };
  });

  readonly positioned = computed(() => {
    const b = this.bounds();
    return this._pins().map(p => ({
      ...p,
      x: ((p.lng - b.minLng) / b.dLng) * 90 + 5,
      y: ((b.maxLat - p.lat) / b.dLat) * 80 + 8
    }));
  });

  format(amount: number | undefined): string {
    if (amount == null) return '';
    return new Intl.NumberFormat('sk-SK').format(amount) + ' €';
  }
}
