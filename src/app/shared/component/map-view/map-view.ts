import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  ComponentRef,
  Component,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  createComponent,
  inject
} from '@angular/core';
import * as L from 'leaflet';
import { MapPreview } from './map-preview/map-preview';

export interface MapPin {
  id: number;
  lat: number;
  lng: number;
  price?: number;
  currency?: string;
  title?: string;
  city?: string;
  imageUrl?: string;
  listingType?: 'RENT' | 'SALE';
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss'
})
export class MapView implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  @Input() pins: MapPin[] = [];
  @Input() selectedId: number | null = null;
  @Input() showPrices = true;
  @Output() pinSelect = new EventEmitter<number>();

  private readonly zone = inject(NgZone);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private previewRefs: ComponentRef<MapPreview>[] = [];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.mapEl.nativeElement, {
        center: [48.7, 19.7],
        zoom: 7,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.renderPins();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['pins'] || changes['selectedId'])) {
      this.renderPins();
    }
  }

  ngOnDestroy(): void {
    this.destroyPreviews();
    this.map?.remove();
  }

  private renderPins(): void {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();
    this.destroyPreviews();

    const valid = this.pins.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (valid.length === 0) return;

    valid.forEach(pin => {
      const icon = L.divIcon({
        html: this.createPinElement(pin),
        className: 'map-pin-wrap',
        iconSize: [60, 28],
        iconAnchor: [30, 14]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(this.markersLayer!);

      if (this.hasPreviewData(pin)) {
        const ref = createComponent(MapPreview, { environmentInjector: this.environmentInjector });
        ref.setInput('pin', pin);
        this.appRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();
        this.previewRefs.push(ref);

        marker.bindTooltip(ref.location.nativeElement, {
          direction: 'top',
          offset: [0, -10],
          opacity: 1,
          className: 'map-preview-tooltip'
        });
      }

      marker.on('click', () => this.zone.run(() => this.pinSelect.emit(pin.id)));
    });

    const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng] as L.LatLngTuple));
    this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  private createPinElement(pin: MapPin): HTMLElement {
    const el = document.createElement('div');
    el.className = 'map-pin' + (pin.id === this.selectedId ? ' map-pin--selected' : '');
    el.textContent = this.showPrices && pin.price != null ? this.formatPrice(pin.price, pin.currency) : '•';
    return el;
  }

  private hasPreviewData(pin: MapPin): boolean {
    return !!(pin.title || pin.imageUrl || pin.price != null);
  }

  private destroyPreviews(): void {
    this.previewRefs.forEach(ref => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    });
    this.previewRefs = [];
  }

  private formatPrice(amount: number, currency?: string): string {
    const cur = currency === 'USD' ? '$' : '€';
    return new Intl.NumberFormat('sk-SK').format(amount) + ' ' + cur;
  }
}
