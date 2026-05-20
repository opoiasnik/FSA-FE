import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';
import { UserModel } from '../../../../core/models/user.model';
import { Avatar } from '../../../../shared/component/avatar/avatar';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, Avatar],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.scss']
})
export class ProfileHeader {
  @Input() user?: UserModel;
  @Input() avatarUrl: string | null = null;
  @Input() memberSince = '';
  @Input() uploading = false;

  @Output() fileSelected = new EventEmitter<File>();

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;

  readonly showUploadPanel = signal(false);
  readonly isDragOver = signal(false);

  openAvatarUpload(): void {
    this.showUploadPanel.set(true);
  }

  closeUploadPanel(): void {
    this.showUploadPanel.set(false);
    this.isDragOver.set(false);
  }

  triggerFileInput(): void {
    this.closeUploadPanel();
    this.fileInputRef.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.closeUploadPanel();
      this.fileSelected.emit(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }
}
