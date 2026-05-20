import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-location-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-location-step.html',
  styleUrls: ['./listing-location-step.scss']
})
export class ListingLocationStep {
  @Input({ required: true }) form!: FormGroup;

  isInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
