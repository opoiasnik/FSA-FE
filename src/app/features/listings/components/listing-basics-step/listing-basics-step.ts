import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-basics-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-basics-step.html',
  styleUrls: ['./listing-basics-step.scss']
})
export class ListingBasicsStep {
  @Input({ required: true }) form!: FormGroup;

  isInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
