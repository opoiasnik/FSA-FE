import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { of, switchMap } from 'rxjs';
import { ErrorHandlerService, ErrorResult } from '../../../../core/services/error-handler.service';
import { ListingBasicsStep } from '../../components/listing-basics-step/listing-basics-step';
import { ListingDetailsStep } from '../../components/listing-details-step/listing-details-step';
import { ListingLocationStep } from '../../components/listing-location-step/listing-location-step';
import { ListingPhotoUploader } from '../../components/listing-photo-uploader/listing-photo-uploader';
import { ListingPriceStep } from '../../components/listing-price-step/listing-price-step';
import { ListingReviewStep } from '../../components/listing-review-step/listing-review-step';
import { ListingWizardStep, ListingWizardStepper } from '../../components/listing-wizard-stepper/listing-wizard-stepper';
import { CreateListingRequest, ListingResponse } from '../../models/listing.model';
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
export class ListingCreatePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(MessageService);

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
  readonly loadingListing = signal(false);
  readonly createError = signal<string | null>(null);
  readonly mediaError = signal<string | null>(null);
  readonly publishAttempted = signal(false);
  readonly editListingId = signal<number | null>(null);
  readonly editListing = signal<ListingResponse | null>(null);
  readonly existingPhotoPreviews = signal<string[]>([]);
  readonly existingPhotoIds = signal<number[]>([]);
  readonly completedStepIdsState = signal<WizardStep['id'][]>([]);
  readonly selectedPhotos = signal<File[]>([]);
  readonly photoPreviews = signal<string[]>([]);
  readonly allPhotoPreviews = computed(() => [...this.existingPhotoPreviews(), ...this.photoPreviews()]);
  readonly maxYearBuilt = new Date().getFullYear() + 1;

  readonly activeStep = computed(() => this.steps[this.currentStep()]);
  readonly isEditMode = computed(() => this.editListingId() !== null);
  readonly pageTitle = computed(() => this.isEditMode() ? 'Edit listing' : 'Publish a new listing');
  readonly submitLabel = computed(() => this.isEditMode() ? 'Save changes' : 'Publish');
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  readonly completedStepIds = computed(() => {
    const invalid = this.invalidStepIds();
    const completed = new Set(this.completedStepIdsState());
    this.steps
      .filter((step, index) => index < this.currentStep() && this.isStepValid(step.id))
      .forEach(step => completed.add(step.id));

    return [...completed].filter(stepId => this.isStepValid(stepId) && !invalid.includes(stepId));
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
      return this.hasAnyPhoto();
    }
    if (stepId === 'review') {
      return this.form.valid && this.hasAnyPhoto();
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

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  readonly canProceedSig = computed(() => {
    this.formValue();
    this.formStatus();
    this.existingPhotoPreviews();
    this.selectedPhotos();
    return this.isStepValid(this.activeStep().id);
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearFormErrors());
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    this.editListingId.set(id);
    this.loadListingForEdit(id);
  }

  ngOnDestroy(): void {
    this.existingPhotoPreviews().forEach(url => this.listingService.revokePhotoObjectUrl(url));
    this.photoPreviews().forEach(url => URL.revokeObjectURL(url));
    this.existingPhotoIds.set([]);
  }

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

  private clearFormErrors(): void {
    this.createError.set(null);
    Object.values(this.form.controls).forEach(control => {
      if (!control.errors?.['server']) {
        return;
      }

      const { server, ...remainingErrors } = control.errors;
      control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }

  prev(): void {
    this.currentStep.update(v => Math.max(0, v - 1));
  }

  publish(): void {
    this.publishAttempted.set(true);
    this.mediaError.set(null);

    if (this.form.invalid || !this.hasAnyPhoto()) {
      this.form.markAllAsTouched();
      if (!this.hasAnyPhoto()) {
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
      address: {
        street: v.street,
        city: v.city,
        postalCode: v.postalCode,
        country: v.country,
        district: v.district || undefined,
        region: this.preservedAddressField('region'),
        lat: this.preservedAddressField('lat'),
        lng: this.preservedAddressField('lng'),
      },
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
      },
      photoIdsToKeep: this.isEditMode() ? this.existingPhotoIds() : undefined,
    };

    const editId = this.editListingId();
    const save$ = editId
      ? this.listingService.update(editId, payload)
      : this.listingService.create(payload);

    save$.pipe(
      switchMap(listing => {
        const files = this.selectedPhotos();
        if (!files.length) return of(listing);
        let chain$ = this.listingService.uploadPhoto(listing.id, files[0], this.photoAltText(0));
        for (let i = 1; i < files.length; i++) {
          const file = files[i];
          const idx = i;
          chain$ = chain$.pipe(switchMap(() => this.listingService.uploadPhoto(listing.id, file, this.photoAltText(idx))));
        }
        return chain$.pipe(switchMap(() => of(listing)));
      })
    ).subscribe({
      next: () => {
        this.creating.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Listing updated' : 'Listing published',
          detail: this.isEditMode()
            ? 'Your listing changes were saved.'
            : 'Your listing is now visible to renters.'
        });
        void this.router.navigate(['/owner']);
      },
      error: (error) => {
        this.creating.set(false);
        queueMicrotask(() => {
          const result = this.errorHandler.toResult(error);
          this.publishAttempted.set(true);
          this.applyServerError(result);
          this.toast.add({
            severity: 'error',
            summary: this.isEditMode() ? 'Listing not updated' : 'Listing not published',
            detail: result.message
          });
        });
      }
    });
  }

  private loadListingForEdit(id: number): void {
    this.loadingListing.set(true);
    this.listingService.getById(id).subscribe({
      next: listing => {
        this.editListing.set(listing);
        this.patchForm(listing);
        this.loadExistingPhotoPreviews(listing);
        this.completedStepIdsState.set(['basics', 'location', 'details', 'price', 'media']);
        this.loadingListing.set(false);
      },
      error: error => {
        this.createError.set(this.errorHandler.toMessage(error));
        this.loadingListing.set(false);
      }
    });
  }

  private patchForm(listing: ListingResponse): void {
    this.form.patchValue({
      title: listing.title,
      description: listing.description,
      listingType: listing.listingType,
      propertyType: listing.features.propertyType,
      street: listing.address.street,
      city: listing.address.city,
      district: listing.address.district ?? '',
      postalCode: listing.address.postalCode,
      country: listing.address.country,
      area: listing.features.area ?? null,
      roomCount: listing.features.roomCount ?? null,
      floor: listing.features.floor ?? null,
      yearBuilt: listing.features.yearBuilt ?? null,
      energyClass: listing.features.energyClass ?? '',
      furnished: listing.features.furnished ?? false,
      parkingAvailable: listing.features.parkingAvailable ?? false,
      balcony: listing.features.balcony ?? false,
      elevator: listing.features.elevator ?? false,
      petsAllowed: listing.features.petsAllowed ?? false,
      amount: listing.price.amount,
      currency: listing.price.currency
    });
  }

  private loadExistingPhotoPreviews(listing: ListingResponse): void {
    this.existingPhotoPreviews().forEach(url => this.listingService.revokePhotoObjectUrl(url));
    this.existingPhotoPreviews.set([]);
    this.existingPhotoIds.set([]);
    for (const photo of listing.photos ?? []) {
      const photoId = photo.id;
      this.listingService.loadPhotoObjectUrl(photo.contentUrl).subscribe({
        next: url => {
          this.existingPhotoPreviews.update(urls => [...urls, url]);
          this.existingPhotoIds.update(ids => [...ids, photoId]);
        },
        error: () => {}
      });
    }
  }

  private hasAnyPhoto(): boolean {
    return this.existingPhotoPreviews().length + this.selectedPhotos().length > 0;
  }

  private preservedAddressField<K extends 'region' | 'lat' | 'lng'>(field: K): ListingResponse['address'][K] | undefined {
    const listing = this.editListing();
    if (!listing || !this.isAddressUnchanged(listing)) {
      return undefined;
    }
    return listing.address[field];
  }

  private isAddressUnchanged(listing: ListingResponse): boolean {
    const v = this.form.getRawValue();
    return this.sameAddressValue(v.street, listing.address.street)
      && this.sameAddressValue(v.city, listing.address.city)
      && this.sameAddressValue(v.postalCode, listing.address.postalCode)
      && this.sameAddressValue(v.country, listing.address.country)
      && this.sameAddressValue(v.district, listing.address.district ?? '');
  }

  private sameAddressValue(left: string | null | undefined, right: string | null | undefined): boolean {
    return (left ?? '').trim().toLowerCase() === (right ?? '').trim().toLowerCase();
  }

  private photoAltText(index: number): string {
    const offset = this.existingPhotoPreviews().length;
    return offset + index === 0 ? 'Cover photo' : `Photo ${offset + index + 1}`;
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

  removePhoto(absoluteIndex: number): void {
    const readonlyCount = this.existingPhotoPreviews().length;
    if (absoluteIndex < readonlyCount) {
      const url = this.existingPhotoPreviews()[absoluteIndex];
      this.listingService.revokePhotoObjectUrl(url);
      this.existingPhotoPreviews.update(urls => urls.filter((_, i) => i !== absoluteIndex));
      this.existingPhotoIds.update(ids => ids.filter((_, i) => i !== absoluteIndex));
    } else {
      const newIndex = absoluteIndex - readonlyCount;
      URL.revokeObjectURL(this.photoPreviews()[newIndex]);
      this.selectedPhotos.update(files => files.filter((_, i) => i !== newIndex));
      this.photoPreviews.update(urls => urls.filter((_, i) => i !== newIndex));
    }
    if (this.publishAttempted() && !this.hasAnyPhoto()) {
      this.mediaError.set('Upload at least one listing photo before publishing.');
    }
  }

  reorderPhotos(event: { from: number; to: number }): void {
    const { from, to } = event;
    const readonlyCount = this.existingPhotoPreviews().length;

    if (from < readonlyCount && to < readonlyCount) {
      this.existingPhotoIds.update(ids => {
        const arr = [...ids];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return arr;
      });
      this.existingPhotoPreviews.update(urls => {
        const arr = [...urls];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return arr;
      });
    } else if (from >= readonlyCount && to >= readonlyCount) {
      const newFrom = from - readonlyCount;
      const newTo = to - readonlyCount;
      this.selectedPhotos.update(files => {
        const arr = [...files];
        const [moved] = arr.splice(newFrom, 1);
        arr.splice(newTo, 0, moved);
        return arr;
      });
      this.photoPreviews.update(urls => {
        const arr = [...urls];
        const [moved] = arr.splice(newFrom, 1);
        arr.splice(newTo, 0, moved);
        return arr;
      });
    }
  }

  private focusFirstInvalidStep(): void {
    const index = this.steps.findIndex(step => !this.isStepValid(step.id));
    if (index >= 0) {
      this.currentStep.set(index);
    }
  }

}
