import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-form.html',
  styleUrl: './listing-form.scss'
})
export class ListingForm {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitting = false;
  @Output() submitted = new EventEmitter<void>();
}
