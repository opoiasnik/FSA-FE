import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';

@Component({
  selector: 'app-listing-photo-uploader',
  standalone: true,
  imports: [CommonModule, PhotoPlaceholder],
  templateUrl: './listing-photo-uploader.html',
  styleUrls: ['./listing-photo-uploader.scss']
})
export class ListingPhotoUploader {
  @Input() previews: string[] = [];
  @Input() readonlyCount = 0;
  @Input() error: string | null = null;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() photoRemoved = new EventEmitter<number>();

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filesSelected.emit(Array.from(input.files ?? []));
    input.value = '';
  }
}
