import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ListingType, PropertyType } from '../../../features/listings/models/listing.model';

export type PropertyFilter = 'ALL' | PropertyType;
export type DealFilter     = 'ALL' | ListingType;

export interface SearchPillValues {
  q:            string;
  propertyType: PropertyFilter;
  listingType:  DealFilter;
}

@Component({
  selector: 'app-search-pill',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-pill.component.html',
  styleUrl: './search-pill.component.scss',
})
export class SearchPill {
  @Input() showFilters = false;
  @Input() label       = 'Where';
  @Input() placeholder = 'City, district, postal code';
  @Output() search = new EventEmitter<SearchPillValues>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    q:            [''],
    propertyType: ['ALL' as PropertyFilter],
    listingType:  ['ALL' as DealFilter],
  });

  readonly propertyOptions: [PropertyFilter, string][] = [
    ['ALL', 'All'], ['APARTMENT', 'Flat'], ['HOUSE', 'House'], ['ROOM', 'Room'],
  ];

  readonly dealOptions: [DealFilter, string][] = [
    ['ALL', 'All'], ['RENT', 'Rent'], ['SALE', 'Buy'],
  ];

  emit(): void {
    this.search.emit(this.form.getRawValue());
  }
}
