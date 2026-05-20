import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';

@Component({
  selector: 'app-listing-review-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageModule, PhotoPlaceholder],
  templateUrl: './listing-review-step.html',
  styleUrls: ['./listing-review-step.scss']
})
export class ListingReviewStep {
  @Input({ required: true }) form!: FormGroup;
  @Input() photoPreviews: string[] = [];
}
