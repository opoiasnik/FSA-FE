import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.scss'
})
export class ListingFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitting = false;
  @Output() submitted = new EventEmitter<void>();
}
