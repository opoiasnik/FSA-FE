import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject, signal } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { formatPrice, shortLocation } from '../../models/listing.helpers';
import { ListingResponse } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss',
})
export class ListingCard implements OnChanges, OnDestroy {
  private readonly listingService = inject(ListingService);

  @Input({ required: true }) listing!: ListingResponse;
  @Input() saved = false;

  @Output() cardClick  = new EventEmitter<void>();
  @Output() saveToggle = new EventEmitter<void>();

  readonly coverImageUrl = signal<string | null>(null);
  private objectUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listing']) {
      this.loadCover();
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  onSaveClick(event: Event): void {
    event.stopPropagation();
    this.saveToggle.emit();
  }

  private loadCover(): void {
    this.revokeObjectUrl();
    const contentUrl = this.listing.photos?.[0]?.contentUrl;
    if (!contentUrl) {
      this.coverImageUrl.set(null);
      return;
    }

    this.listingService.loadPhotoObjectUrl(contentUrl).subscribe({
      next: objectUrl => {
        this.revokeObjectUrl();
        this.objectUrl = objectUrl;
        this.coverImageUrl.set(this.objectUrl);
      },
      error: () => this.coverImageUrl.set(null)
    });
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      this.listingService.revokePhotoObjectUrl(this.objectUrl);
      this.objectUrl = null;
    }
  }

  readonly formatPrice   = formatPrice;
  readonly shortLocation = shortLocation;
}
