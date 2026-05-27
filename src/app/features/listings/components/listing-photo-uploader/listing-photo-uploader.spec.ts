import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { ListingPhotoUploader } from './listing-photo-uploader';

function dragEventWithFiles(files: File[]): DragEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      files,
      dropEffect: 'none',
      effectAllowed: 'all',
      clearData: vi.fn(),
      setData: vi.fn()
    }
  } as unknown as DragEvent;
}

describe('ListingPhotoUploader', () => {
  it('emits dropped files from the dropzone', () => {
    const component = new ListingPhotoUploader();
    const emit = vi.spyOn(component.filesSelected, 'emit');
    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    const event = dragEventWithFiles([file]);

    component.isFileDragOver.set(true);
    component.onFilesDropped(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isFileDragOver()).toBe(false);
    expect(emit).toHaveBeenCalledWith([file]);
  });

  it('does not emit when drop event has no files', () => {
    const component = new ListingPhotoUploader();
    const emit = vi.spyOn(component.filesSelected, 'emit');

    component.onFilesDropped(dragEventWithFiles([]));

    expect(emit).not.toHaveBeenCalled();
  });

  it('sets file drag-over state and copy drop effect', () => {
    const component = new ListingPhotoUploader();
    const event = dragEventWithFiles([]);

    component.onFileDragOver(event);

    expect(component.isFileDragOver()).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('copy');
  });

  it('emits reorder event when preview is dropped on another preview', () => {
    const component = new ListingPhotoUploader();
    const emit = vi.spyOn(component.photosReordered, 'emit');

    component.onDragStart(dragEventWithFiles([]), 0);
    component.onDrop(dragEventWithFiles([]), 2);

    expect(emit).toHaveBeenCalledWith({ from: 0, to: 2 });
    expect(component.dragSrcIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
  });
});
