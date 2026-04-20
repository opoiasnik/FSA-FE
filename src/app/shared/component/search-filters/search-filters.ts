import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';

export type PropertyType = 'ALL' | 'APARTMENT' | 'HOUSE' | 'ROOM';
export type ListingType = 'ALL' | 'RENT' | 'SALE';

export interface SearchFiltersState {
  searchText: string;
  propertyType: PropertyType;
  listingType: ListingType;
}

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule
  ],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss'
})
export class SearchFilters {
  @Input() searchText = '';
  @Input() propertyType: PropertyType = 'ALL';
  @Input() listingType: ListingType = 'ALL';

  @Output() readonly searchTextChange = new EventEmitter<string>();
  @Output() readonly propertyTypeChange = new EventEmitter<PropertyType>();
  @Output() readonly listingTypeChange = new EventEmitter<ListingType>();
  @Output() readonly search = new EventEmitter<void>();

  readonly propertyTypeOptions = [
    { label: 'Any type', value: 'ALL' },
    { label: 'Apartment', value: 'APARTMENT' },
    { label: 'House', value: 'HOUSE' },
    { label: 'Room', value: 'ROOM' }
  ];

  readonly listingTypeOptions = [
    { label: 'Any deal', value: 'ALL' },
    { label: 'Rent', value: 'RENT' },
    { label: 'Sale', value: 'SALE' }
  ];

  onSearchText(value: string): void {
    this.searchTextChange.emit(value);
  }

  onPropertyType(value: PropertyType): void {
    this.propertyTypeChange.emit(value);
  }

  onListingType(value: ListingType): void {
    this.listingTypeChange.emit(value);
  }

  onSearch(): void {
    this.search.emit();
  }
}
