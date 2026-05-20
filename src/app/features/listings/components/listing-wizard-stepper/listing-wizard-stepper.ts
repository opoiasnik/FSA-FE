import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ListingWizardStep {
  id: string;
  title: string;
  sub: string;
}

@Component({
  selector: 'app-listing-wizard-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-wizard-stepper.html',
  styleUrls: ['./listing-wizard-stepper.scss']
})
export class ListingWizardStepper {
  @Input() steps: ListingWizardStep[] = [];
  @Input() currentStep = 0;

  @Output() stepSelected = new EventEmitter<number>();
}
