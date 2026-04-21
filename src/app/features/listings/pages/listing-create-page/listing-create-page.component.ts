import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { CreateListingRequest, ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

interface WizardStep {
  id: 'basics' | 'location' | 'details' | 'price' | 'media' | 'review';
  title: string;
  sub: string;
}

@Component({
  selector: 'app-listing-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageModule, PhotoPlaceholder],
  templateUrl: './listing-create-page.component.html',
  styleUrl: './listing-create-page.component.scss'
})
export class ListingCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);

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
  readonly createdListing = signal<ListingResponse | null>(null);
  readonly createError = signal<string | null>(null);

  readonly activeStep = computed(() => this.steps[this.currentStep()]);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  readonly form = this.fb.nonNullable.group({
    title: ['Sun-flooded two-bedroom in the old town', [Validators.required, Validators.maxLength(80)]],
    description: ['Bright and quiet unit with large windows, freshly painted walls and original parquet floors.', [Validators.required]],
    listingType: ['RENT' as const, [Validators.required]],
    propertyType: ['APARTMENT' as const, [Validators.required]],
    street: ['Šancová 12', [Validators.required]],
    city: ['Bratislava', [Validators.required]],
    district: ['Staré Mesto'],
    postalCode: ['81104', [Validators.required]],
    country: ['Slovakia', [Validators.required]],
    area: [72, [Validators.required, Validators.min(1)]],
    roomCount: [3, [Validators.required, Validators.min(0)]],
    floor: [4],
    energyClass: ['B' as const],
    furnished: [true],
    parkingAvailable: [true],
    balcony: [true],
    elevator: [true],
    petsAllowed: [false],
    amount: [890, [Validators.required, Validators.min(1)]],
    currency: ['EUR', [Validators.required]]
  });

  readonly amenityOptions = [
    { key: 'furnished' as const, label: 'Furnished' },
    { key: 'parkingAvailable' as const, label: 'Parking' },
    { key: 'balcony' as const, label: 'Balcony' },
    { key: 'elevator' as const, label: 'Elevator' },
    { key: 'petsAllowed' as const, label: 'Pets allowed' }
  ];

  goTo(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStep.set(index);
  }

  next(): void {
    if (this.isLastStep()) {
      this.publish();
      return;
    }
    this.currentStep.update(v => v + 1);
  }

  prev(): void {
    this.currentStep.update(v => Math.max(0, v - 1));
  }

  publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.createError.set(null);

    const v = this.form.getRawValue();
    const payload: CreateListingRequest = {
      title: v.title,
      description: v.description,
      listingType: v.listingType,
      address: { street: v.street, city: v.city, postalCode: v.postalCode, country: v.country, district: v.district || undefined },
      price: { amount: Number(v.amount), currency: v.currency },
      features: {
        propertyType: v.propertyType,
        area: v.area ? Number(v.area) : null,
        roomCount: v.roomCount ? Number(v.roomCount) : null,
        floor: v.floor ? Number(v.floor) : null,
        furnished: v.furnished,
        parkingAvailable: v.parkingAvailable,
        balcony: v.balcony,
        elevator: v.elevator,
        petsAllowed: v.petsAllowed,
        energyClass: v.energyClass
      }
    };

    this.listingService.create(payload).subscribe({
      next: (listing) => {
        this.createdListing.set(listing);
        this.creating.set(false);
        void this.router.navigate(['/owner']);
      },
      error: (error) => {
        this.createError.set(this.toMessage(error));
        this.creating.set(false);
      }
    });
  }

  toggleAmenity(key: 'furnished' | 'parkingAvailable' | 'balcony' | 'elevator' | 'petsAllowed'): void {
    const control = this.form.controls[key];
    control.setValue(!control.value);
  }

  private toMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const maybe = error as { error?: { message?: string }; message?: string; status?: number };
      return maybe.error?.message ?? maybe.message ?? (maybe.status ? `Request failed with status ${maybe.status}.` : 'Unexpected error.');
    }
    return 'Unexpected error.';
  }
}
