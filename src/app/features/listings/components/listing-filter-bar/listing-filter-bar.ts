import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { FilterChip, FilterChipValue, RangeValue } from '../../../../shared/component/filter-chip/filter-chip';
import { EnergyClass } from '../../models/listing.model';

export interface ChipFilters {
  priceMin:         number | null;
  priceMax:         number | null;
  roomCount:        number | null;
  areaMin:          number | null;
  areaMax:          number | null;
  furnished:        boolean | null;
  parkingAvailable: boolean | null;
  balcony:          boolean | null;
  petsAllowed:      boolean | null;
  energyClass:      EnergyClass | null;
}

@Component({
  selector: 'app-listing-filter-bar',
  standalone: true,
  imports: [CommonModule, FilterChip],
  templateUrl: './listing-filter-bar.html',
  styleUrl: './listing-filter-bar.scss',
})
export class ListingFilterBar {
  @Output() search = new EventEmitter<ChipFilters>();

  readonly showChips     = signal(false);
  readonly pendingChange = signal(false);

  readonly priceMin         = signal<number | null>(null);
  readonly priceMax         = signal<number | null>(null);
  readonly roomCount        = signal<number | null>(null);
  readonly areaMin          = signal<number | null>(null);
  readonly areaMax          = signal<number | null>(null);
  readonly furnished        = signal<boolean | null>(null);
  readonly parkingAvailable = signal<boolean | null>(null);
  readonly balcony          = signal<boolean | null>(null);
  readonly petsAllowed      = signal<boolean | null>(null);
  readonly energyClass      = signal<EnergyClass | null>(null);

  readonly priceValue = computed(() => ({ min: this.priceMin(), max: this.priceMax() }));
  readonly areaValue  = computed(() => ({ min: this.areaMin(),  max: this.areaMax()  }));

  readonly roomOptions   = [1, 2, 3, 4, 5];
  readonly energyOptions = ['A', 'B', 'C', 'D'];

  toggleChips(): void { this.showChips.update(v => !v); }

  applyFilters(): void {
    this.pendingChange.set(false);
    this.search.emit(this.snapshot());
  }

  onPriceApply(v: FilterChipValue): void {
    const r = v as RangeValue;
    this.priceMin.set(r.min);
    this.priceMax.set(r.max);
    this.pendingChange.set(true);
  }

  onAreaApply(v: FilterChipValue): void {
    const r = v as RangeValue;
    this.areaMin.set(r.min);
    this.areaMax.set(r.max);
    this.pendingChange.set(true);
  }

  onRoomsApply(v: FilterChipValue):    void { this.roomCount.set(v as number | null);         this.pendingChange.set(true); }
  onFurnishedApply(v: FilterChipValue): void { this.furnished.set(v as boolean | null);        this.pendingChange.set(true); }
  onParkingApply(v: FilterChipValue):   void { this.parkingAvailable.set(v as boolean | null); this.pendingChange.set(true); }
  onBalconyApply(v: FilterChipValue):   void { this.balcony.set(v as boolean | null);          this.pendingChange.set(true); }
  onPetsApply(v: FilterChipValue):      void { this.petsAllowed.set(v as boolean | null);      this.pendingChange.set(true); }
  onEnergyApply(v: FilterChipValue):    void { this.energyClass.set(v as EnergyClass | null);  this.pendingChange.set(true); }

  onPriceClear():     void { this.priceMin.set(null);         this.priceMax.set(null); this.search.emit(this.snapshot()); }
  onAreaClear():      void { this.areaMin.set(null);          this.areaMax.set(null);  this.search.emit(this.snapshot()); }
  onRoomsClear():     void { this.roomCount.set(null);        this.search.emit(this.snapshot()); }
  onFurnishedClear(): void { this.furnished.set(null);        this.search.emit(this.snapshot()); }
  onParkingClear():   void { this.parkingAvailable.set(null); this.search.emit(this.snapshot()); }
  onBalconyClear():   void { this.balcony.set(null);          this.search.emit(this.snapshot()); }
  onPetsClear():      void { this.petsAllowed.set(null);      this.search.emit(this.snapshot()); }
  onEnergyClear():    void { this.energyClass.set(null);      this.search.emit(this.snapshot()); }

  private snapshot(): ChipFilters {
    return {
      priceMin:         this.priceMin(),
      priceMax:         this.priceMax(),
      roomCount:        this.roomCount(),
      areaMin:          this.areaMin(),
      areaMax:          this.areaMax(),
      furnished:        this.furnished(),
      parkingAvailable: this.parkingAvailable(),
      balcony:          this.balcony(),
      petsAllowed:      this.petsAllowed(),
      energyClass:      this.energyClass(),
    };
  }
}
