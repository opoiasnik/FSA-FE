import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingFormComponent } from '../../components/listing-form/listing-form.component';
import { CreateListingRequest, ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListingFormComponent],
  templateUrl: './listing-create-page.component.html',
  styleUrl: './listing-create-page.component.scss'
})
export class ListingCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly listingService = inject(ListingService);

  readonly createForm = this.fb.nonNullable.group({
    title: ['Loft near historic center', [Validators.required]],
    description: ['Renovated apartment with balcony and furnished interior.', [Validators.required]],
    listingType: ['RENT' as const, [Validators.required]],
    street: ['Main Street 123', [Validators.required]],
    city: ['Bratislava', [Validators.required]],
    postalCode: ['81101', [Validators.required]],
    country: ['Slovakia', [Validators.required]],
    amount: [850, [Validators.required, Validators.min(1)]],
    currency: ['EUR', [Validators.required]],
    propertyType: ['APARTMENT' as const, [Validators.required]],
    area: [65.5],
    roomCount: [2],
    floor: [3],
    furnished: [true],
    parkingAvailable: [false]
  });

  readonly creating = signal(false);
  readonly createdListing = signal<ListingResponse | null>(null);
  readonly createError = signal<string | null>(null);

  createListing(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.createError.set(null);

    const formValue = this.createForm.getRawValue();
    const payload: CreateListingRequest = {
      title: formValue.title,
      description: formValue.description,
      listingType: formValue.listingType,
      address: {
        street: formValue.street,
        city: formValue.city,
        postalCode: formValue.postalCode,
        country: formValue.country
      },
      price: {
        amount: Number(formValue.amount),
        currency: formValue.currency
      },
      features: {
        propertyType: formValue.propertyType,
        area: formValue.area ? Number(formValue.area) : null,
        roomCount: formValue.roomCount ? Number(formValue.roomCount) : null,
        floor: formValue.floor ? Number(formValue.floor) : null,
        furnished: formValue.furnished,
        parkingAvailable: formValue.parkingAvailable
      }
    };

    this.listingService.create(payload).subscribe({
      next: (listing) => {
        this.createdListing.set(listing);
        this.createError.set(null);
        this.creating.set(false);
      },
      error: (error) => {
        this.createdListing.set(null);
        this.createError.set(this.toMessage(error));
        this.creating.set(false);
      }
    });
  }

  private toMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const maybeHttp = error as { error?: { message?: string }; message?: string; status?: number };
      return maybeHttp.error?.message
        ?? maybeHttp.message
        ?? (maybeHttp.status ? `Request failed with status ${maybeHttp.status}.` : 'Unexpected error.');
    }

    return 'Unexpected error.';
  }
}
