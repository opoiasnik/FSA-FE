import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ListingDetailCardComponent } from '../../components/listing-detail-card/listing-detail-card.component';
import { ListingSearchFormComponent } from '../../components/listing-search-form/listing-search-form.component';
import { ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-search-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListingSearchFormComponent, ListingDetailCardComponent],
  templateUrl: './listing-search-page.component.html',
  styleUrl: './listing-search-page.component.scss'
})
export class ListingSearchPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly listingService = inject(ListingService);

  readonly lookupForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  readonly loading = signal(false);
  readonly listing = signal<ListingResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly summary = computed(() => {
    const value = this.listing();
    if (!value) {
      return 'Vybraná nehnuteľnosť';
    }

    return `${value.features.propertyType} • ${value.listingType} • ${value.address.city}`;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (!idParam) {
      return;
    }

    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    this.lookupForm.patchValue({ id });
    this.loadListing();
  }

  loadListing(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const id = this.lookupForm.getRawValue().id;
    this.listingService.getById(id).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.loading.set(false);
      },
      error: (error) => {
        this.listing.set(null);
        this.error.set(this.toMessage(error));
        this.loading.set(false);
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
