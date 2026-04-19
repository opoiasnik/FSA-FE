import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-search-form.component.html',
  styleUrl: './listing-search-form.component.scss'
})
export class ListingSearchFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Input() submitLabel = 'Vyhladat';
  @Output() submitted = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Input() secondaryLabel?: string;
}
