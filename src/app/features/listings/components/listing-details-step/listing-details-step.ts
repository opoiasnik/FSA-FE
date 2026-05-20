import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

type AmenityKey = 'furnished' | 'parkingAvailable' | 'balcony' | 'elevator' | 'petsAllowed';

@Component({
  selector: 'app-listing-details-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-details-step.html',
  styleUrls: ['./listing-details-step.scss']
})
export class ListingDetailsStep {
  @Input({ required: true }) form!: FormGroup;
  @Input() maxYearBuilt = new Date().getFullYear() + 1;

  readonly amenityOptions: { key: AmenityKey; label: string }[] = [
    { key: 'furnished', label: 'Furnished' },
    { key: 'parkingAvailable', label: 'Parking' },
    { key: 'balcony', label: 'Balcony' },
    { key: 'elevator', label: 'Elevator' },
    { key: 'petsAllowed', label: 'Pets allowed' }
  ];

  isInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  isAmenityOn(key: AmenityKey): boolean {
    return !!this.form.get(key)?.value;
  }

  toggleAmenity(key: AmenityKey): void {
    const control = this.form.get(key);
    control?.setValue(!control.value);
  }
}
