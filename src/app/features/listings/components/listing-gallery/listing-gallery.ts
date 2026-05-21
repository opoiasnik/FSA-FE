import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { PhotoResponse } from '../../models/listing.model';

@Component({
  selector: 'app-listing-gallery',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './listing-gallery.html',
  styleUrls: ['./listing-gallery.scss']
})
export class ListingGallery {
  @Input() photos: PhotoResponse[] = [];
  @Input() imageUrls: Record<number, string> = {};
  @Input({ required: true }) listingId = 0;
  @Input({ required: true }) title = '';

  get sortedPhotos(): PhotoResponse[] {
    return [...this.photos].sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
  }

  get coverPhoto(): PhotoResponse | undefined {
    return this.sortedPhotos[0];
  }

  get thumbnailPhotos(): PhotoResponse[] {
    return this.sortedPhotos.slice(1);
  }

  trackPhoto(_: number, photo: PhotoResponse): number {
    return photo.id;
  }
}
