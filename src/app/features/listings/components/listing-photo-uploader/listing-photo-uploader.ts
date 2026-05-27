import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Output() photosReordered = new EventEmitter<{ from: number; to: number }>();

  readonly isFileDragOver = signal(false);
  readonly dragSrcIndex = signal<number | null>(null);
  readonly dragOverIndex = signal<number | null>(null);

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filesSelected.emit(Array.from(input.files ?? []));
    input.value = '';
  }

  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isFileDragOver.set(true);
  }

  onFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileDragOver.set(false);
  }

  onFilesDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFileDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      this.filesSelected.emit(files);
    }
  }

  onDragStart(event: DragEvent, index: number): void {
    this.dragSrcIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.clearData();
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragSrcIndex() !== null) {
      this.dragOverIndex.set(index);
    }
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const src = this.dragSrcIndex();
    if (src !== null && src !== targetIndex) {
      this.photosReordered.emit({ from: src, to: targetIndex });
    }
    this.dragSrcIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.dragSrcIndex.set(null);
    this.dragOverIndex.set(null);
  }
}
