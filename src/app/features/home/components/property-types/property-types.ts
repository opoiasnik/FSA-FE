import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface PropertyTypeCard {
  id: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-property-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-types.html',
  styleUrl: './property-types.scss'
})
export class PropertyTypes {
  readonly title = 'Browse by property type';
  readonly subtitle = 'See apartments, houses and rooms for rent or sale.';

  readonly cards: PropertyTypeCard[] = [
    { id: 'apartments', label: 'Apartments', description: 'City flats and studios', icon: 'pi pi-building' },
    { id: 'houses', label: 'Houses', description: 'Family homes and villas', icon: 'pi pi-home' },
    { id: 'rooms', label: 'Rooms', description: 'Single rooms in shared housing', icon: 'pi pi-bed' }
  ];
}
