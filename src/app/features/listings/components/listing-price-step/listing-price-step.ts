import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-price-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-price-step.html',
  styleUrls: ['./listing-price-step.scss']
})
export class ListingPriceStep {
  @Input({ required: true }) form!: FormGroup;

  isInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
