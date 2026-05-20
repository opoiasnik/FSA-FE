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
  @Input() completedStepIds: string[] = [];
  @Input() invalidStepIds: string[] = [];

  @Output() stepSelected = new EventEmitter<number>();

  isCompleted(step: ListingWizardStep): boolean {
    return this.completedStepIds.includes(step.id);
  }

  isInvalid(step: ListingWizardStep): boolean {
    return this.invalidStepIds.includes(step.id);
  }
}
