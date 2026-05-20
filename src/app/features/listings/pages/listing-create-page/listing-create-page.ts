import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { forkJoin, of, switchMap } from 'rxjs';
import { ErrorHandlerService, ErrorResult } from '../../../../core/services/error-handler.service';
import { ListingBasicsStep } from '../../components/listing-basics-step/listing-basics-step';
import { ListingDetailsStep } from '../../components/listing-details-step/listing-details-step';
import { ListingLocationStep } from '../../components/listing-location-step/listing-location-step';
import { ListingPhotoUploader } from '../../components/listing-photo-uploader/listing-photo-uploader';
import { ListingPriceStep } from '../../components/listing-price-step/listing-price-step';
import { ListingReviewStep } from '../../components/listing-review-step/listing-review-step';
import { ListingWizardStep, ListingWizardStepper } from '../../components/listing-wizard-stepper/listing-wizard-stepper';
import { CreateListingRequest } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

interface WizardStep extends ListingWizardStep {
  id: 'basics' | 'location' | 'details' | 'price' | 'media' | 'review';
}

@Component({
  selector: 'app-listing-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    ListingBasicsStep,
    ListingLocationStep,
    ListingDetailsStep,
    ListingPriceStep,
    ListingPhotoUploader,
    ListingReviewStep,
    ListingWizardStepper
  ],
  templateUrl: './listing-create-page.html',
  styleUrl: './listing-create-page.scss'
})
export class ListingCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly steps: WizardStep[] = [
    { id: 'basics', title: 'Basics', sub: 'Title, description, deal type' },
    { id: 'location', title: 'Location', sub: 'Where is your property?' },
    { id: 'details', title: 'Details', sub: 'Area, rooms, amenities' },
    { id: 'price', title: 'Price', sub: 'Monthly rent or selling price' },
    { id: 'media', title: 'Photos', sub: 'Upload 5–20 images' },
    { id: 'review', title: 'Review', sub: 'Preview and publish' }
  ];

  readonly currentStep = signal(0);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly mediaError = signal<string | null>(null);
  readonly publishAttempted = signal(false);
  readonly completedStepIdsState = signal<WizardStep['id'][]>([]);
  readonly selectedPhotos = signal<File[]>([]);
  readonly photoPreviews = signal<string[]>([]);
  readonly maxYearBuilt = new Date().getFullYear() + 1;

  readonly activeStep = computed(() => this.steps[this.currentStep()]);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  readonly completedStepIds = computed(() => {
    const invalid = this.invalidStepIds();
    return this.completedStepIdsState().filter(stepId => this.isStepValid(stepId) && !invalid.includes(stepId));
  });
  readonly invalidStepIds = computed(() =>
    this.publishAttempted()
      ? this.steps
          .filter(step => step.id !== 'review' && !this.isStepValid(step.id))
          .map(step => step.id)
      : []
  );

  private readonly stepRequiredFields: Record<WizardStep['id'], string[]> = {
    basics: ['title', 'description'],
    location: ['street', 'city', 'postalCode', 'country'],
    details: ['area', 'roomCount'],
    price: ['amount', 'currency'],
    media: [],
    review: []
  };

  private readonly fieldStepMap: Record<string, WizardStep['id']> = {
    title: 'basics',
    description: 'basics',
    listingType: 'basics',
    propertyType: 'basics',
    address: 'location',
    street: 'location',
    city: 'location',
    district: 'location',
    postalCode: 'location',
    country: 'location',
    area: 'details',
    roomCount: 'details',
    floor: 'details',
    yearBuilt: 'details',
    energyClass: 'details',
    furnished: 'details',
    parkingAvailable: 'details',
    balcony: 'details',
    elevator: 'details',
    petsAllowed: 'details',
    amount: 'price',
    currency: 'price',
    price: 'price'
  };

  isStepValid(stepId: WizardStep['id']): boolean {
    if (stepId === 'media') {
      return this.selectedPhotos().length > 0;
    }
    if (stepId === 'review') {
      return this.form.valid && this.selectedPhotos().length > 0;
    }

    const fields = this.stepRequiredFields[stepId];
    return fields.every(name => {
      const ctrl = this.form.get(name);
      return ctrl ? ctrl.valid : true;
    });
  }

  canProceed(): boolean {
    return this.isStepValid(this.activeStep().id);
  }

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required]],
    listingType: ['RENT' as 'RENT' | 'SALE', [Validators.required]],
    propertyType: ['APARTMENT' as 'APARTMENT' | 'HOUSE' | 'ROOM', [Validators.required]],
    street: ['', [Validators.required]],
    city: ['', [Validators.required]],
    district: [''],
    postalCode: ['', [Validators.required]],
    country: ['Slovakia', [Validators.required]],
    area: [null as number | null, [Validators.required, Validators.min(1)]],
    roomCount: [null as number | null, [Validators.required, Validators.min(0)]],
    floor: [null as number | null],
    yearBuilt: [null as number | null, [Validators.min(1800), Validators.max(this.maxYearBuilt)]],
    energyClass: ['' as '' | 'A' | 'B' | 'C' | 'D'],
    furnished: [false],
    parkingAvailable: [false],
    balcony: [false],
    elevator: [false],
    petsAllowed: [false],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    currency: ['EUR', [Validators.required]]
  });

  goTo(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    if (index > this.currentStep()) {
      for (let i = this.currentStep(); i < index; i++) {
        if (!this.isStepValid(this.steps[i].id)) {
          this.markStepFieldsTouched(this.steps[i].id);
          this.applyStepError(this.steps[i].id);
          this.currentStep.set(i);
          return;
        }
        this.markStepCompleted(this.steps[i].id);
      }
    }
    this.currentStep.set(index);
  }

  next(): void {
    if (!this.canProceed()) {
      this.markStepFieldsTouched(this.activeStep().id);
      this.applyStepError(this.activeStep().id);
      return;
    }
    if (this.isLastStep()) {
      this.publish();
      return;
    }
    this.markStepCompleted(this.activeStep().id);
    this.currentStep.update(v => v + 1);
  }

  private markStepFieldsTouched(stepId: WizardStep['id']): void {
    this.stepRequiredFields[stepId].forEach(name => this.form.get(name)?.markAsTouched());
  }

  private markStepCompleted(stepId: WizardStep['id']): void {
    this.completedStepIdsState.update(stepIds =>
      stepIds.includes(stepId) ? stepIds : [...stepIds, stepId]
    );
  }

  private applyStepError(stepId: WizardStep['id']): void {
    if (stepId === 'media') {
      this.publishAttempted.set(true);
      this.mediaError.set('Upload at least one listing photo before publishing.');
      this.createError.set('Upload at least one listing photo before publishing.');
      return;
    }

    this.createError.set('Please fix the highlighted fields before continuing.');
  }

  prev(): void {
    this.currentStep.update(v => Math.max(0, v - 1));
  }

  publish(): void {
    this.publishAttempted.set(true);
    this.mediaError.set(null);

    if (this.form.invalid || this.selectedPhotos().length === 0) {
      this.form.markAllAsTouched();
      if (this.selectedPhotos().length === 0) {
        this.mediaError.set('Upload at least one listing photo before publishing.');
      }
      this.focusFirstInvalidStep();
      this.createError.set('Please fix the highlighted steps before publishing.');
      return;
    }

    this.creating.set(true);
    this.createError.set(null);
    this.steps.forEach(step => this.markStepCompleted(step.id));

    const v = this.form.getRawValue();
    const payload: CreateListingRequest = {
      title: v.title,
      description: v.description,
      listingType: v.listingType,
      address: { street: v.street, city: v.city, postalCode: v.postalCode, country: v.country, district: v.district || undefined },
      price: { amount: Number(v.amount), currency: v.currency },
      features: {
        propertyType: v.propertyType,
        area: v.area != null ? Number(v.area) : null,
        roomCount: v.roomCount != null ? Number(v.roomCount) : null,
        floor: v.floor != null ? Number(v.floor) : null,
        furnished: v.furnished,
        parkingAvailable: v.parkingAvailable,
        balcony: v.balcony,
        elevator: v.elevator,
        petsAllowed: v.petsAllowed,
        energyClass: v.energyClass || undefined,
        yearBuilt: v.yearBuilt != null ? Number(v.yearBuilt) : undefined
      }
    };

    this.listingService.create(payload).pipe(
      switchMap(listing => {
        const uploads = this.selectedPhotos().map((file, index) =>
          this.listingService.uploadPhoto(listing.id, file, index === 0 ? 'Cover photo' : `Photo ${index + 1}`)
        );
        return uploads.length ? forkJoin(uploads).pipe(switchMap(() => of(listing))) : of(listing);
      })
    ).subscribe({
      next: () => {
        this.creating.set(false);
        void this.router.navigate(['/owner']);
      },
      error: (error) => {
        const result = this.errorHandler.toResult(error);
        this.publishAttempted.set(true);
        this.applyServerError(result);
        this.creating.set(false);
      }
    });
  }

  private applyServerError(result: ErrorResult): void {
    const fieldName = this.resolveServerField(result);
    if (!fieldName) {
      this.createError.set(result.message);
      return;
    }

    this.createError.set(null);
    const ctrl = this.form.get(fieldName);
    if (ctrl) {
      ctrl.setErrors({ ...(ctrl.errors ?? {}), server: result.message });
      ctrl.markAsTouched();
    }

    this.markStepFieldsTouched(this.fieldStepMap[fieldName]);
    queueMicrotask(() => this.focusStepForField(fieldName));
  }

  private resolveServerField(result: ErrorResult): string | null {
    const field = result.field?.split('.').pop();
    if (field && this.form.get(field)) {
      return field;
    }
    if (result.field === 'address' || this.isAddressError(result.message)) {
      return 'street';
    }
    return null;
  }

  private isAddressError(message: string): boolean {
    const normalized = message.toLowerCase();
    return normalized.includes('address') || normalized.includes('street') || normalized.includes('postal');
  }

  private focusStepForField(fieldName: string): void {
    const stepId = this.fieldStepMap[fieldName];
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex >= 0) {
      this.currentStep.set(stepIndex);
    }
  }

  addPhotos(files: File[]): void {
    const newFiles = files.filter(file => file.type.startsWith('image/'));

    const remaining = 20 - this.selectedPhotos().length;
    const toAdd = newFiles.slice(0, remaining);

    this.selectedPhotos.update(files => [...files, ...toAdd]);
    this.photoPreviews.update(urls => [...urls, ...toAdd.map(f => URL.createObjectURL(f))]);
    if (toAdd.length) {
      this.mediaError.set(null);
      if (this.createError() === 'Upload at least one listing photo before publishing.') {
        this.createError.set(null);
      }
    }
  }

  removePhoto(index: number): void {
    const previews = this.photoPreviews();
    URL.revokeObjectURL(previews[index]);
    this.selectedPhotos.update(files => files.filter((_, i) => i !== index));
    this.photoPreviews.update(urls => urls.filter((_, i) => i !== index));
    if (this.publishAttempted() && this.selectedPhotos().length === 0) {
      this.mediaError.set('Upload at least one listing photo before publishing.');
    }
  }

  private focusFirstInvalidStep(): void {
    const index = this.steps.findIndex(step => !this.isStepValid(step.id));
    if (index >= 0) {
      this.currentStep.set(index);
    }
  }

}
