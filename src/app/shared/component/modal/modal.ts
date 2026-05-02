import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  @Input() visible = false;
  @Input() title = '';
  @Input() width = '420px';
  @Input() closeOnBackdrop = true;

  @Output() readonly visibleChange = new EventEmitter<boolean>();
  @Output() readonly closed = new EventEmitter<void>();

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent, backdrop: HTMLElement): void {
    if (this.closeOnBackdrop && event.target === backdrop) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.close();
  }
}
