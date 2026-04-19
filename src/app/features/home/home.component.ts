import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingResponse } from '../listings/models/listing.model';
import { ListingDetailCardComponent } from '../listings/components/listing-detail-card/listing-detail-card.component';
import { ListingSearchFormComponent } from '../listings/components/listing-search-form/listing-search-form.component';
import { ListingService } from '../listings/services/listing.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ListingSearchFormComponent, ListingDetailCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);

  readonly lookupForm = this.fb.nonNullable.group({
    id: [1, [Validators.required, Validators.min(1)]]
  });

  readonly loadingLookup = signal(false);
  readonly lookedUpListing = signal<ListingResponse | null>(null);
  readonly lookupError = signal<string | null>(null);
  readonly summary = computed(() => {
    const listing = this.lookedUpListing();
    if (!listing) {
      return null;
    }

    return `${listing.features.propertyType} • ${listing.listingType} • ${listing.address.city}`;
  });

  readonly highlights = [
    'Byty, domy a izby na jednom mieste',
    'Priamy JWT flow cez Keycloak',
    'Publikovanie ponuky cez chránený backend endpoint'
  ];

  readonly categories = [
    { title: 'Byty', text: 'Mestské bývanie, garsónky aj väčšie rodinné byty.' },
    { title: 'Domy', text: 'Rodinné domy, novostavby a väčšie nehnuteľnosti.' },
    { title: 'Izby', text: 'Jednoduché bývanie pre študentov alebo jednotlivcov.' }
  ];

  searchById(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.loadingLookup.set(true);
    this.lookupError.set(null);

    const id = this.lookupForm.getRawValue().id;
    this.listingService.getById(id).subscribe({
      next: (listing) => {
        this.lookedUpListing.set(listing);
        this.loadingLookup.set(false);
      },
      error: (error) => {
        this.lookedUpListing.set(null);
        this.lookupError.set(this.toMessage(error));
        this.loadingLookup.set(false);
      }
    });
  }

  openListings(): void {
    const id = this.lookupForm.getRawValue().id;
    void this.router.navigate(['/listings'], { queryParams: { id } });
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
