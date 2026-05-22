import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, signal } from '@angular/core';
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
  readonly activePhotoIndex = signal<number | null>(null);

  get sortedPhotos(): PhotoResponse[] {
    return [...this.photos].sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
  }

  get visiblePhotos(): PhotoResponse[] {
    return this.sortedPhotos.filter(photo => !!this.imageUrls[photo.id]);
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

  openPhoto(index: number): void {
    if (!this.visiblePhotos[index]) {
      return;
    }
    this.activePhotoIndex.set(index);
  }

  closePhoto(): void {
    this.activePhotoIndex.set(null);
  }

  previousPhoto(event?: Event): void {
    event?.stopPropagation();
    this.movePhoto(-1);
  }

  nextPhoto(event?: Event): void {
    event?.stopPropagation();
    this.movePhoto(1);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePhoto();
  }

  @HostListener('document:keydown.arrowleft', ['$event'])
  onArrowLeft(event: KeyboardEvent): void {
    if (this.activePhotoIndex() !== null) {
      event.preventDefault();
      this.previousPhoto();
    }
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  onArrowRight(event: KeyboardEvent): void {
    if (this.activePhotoIndex() !== null) {
      event.preventDefault();
      this.nextPhoto();
    }
  }

  private movePhoto(direction: -1 | 1): void {
    const current = this.activePhotoIndex();
    const photos = this.visiblePhotos;
    if (current === null || photos.length < 2) {
      return;
    }
    this.activePhotoIndex.set((current + direction + photos.length) % photos.length);
  }
}
