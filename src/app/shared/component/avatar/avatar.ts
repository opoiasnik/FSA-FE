import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styles: [`
    :host { display: inline-block; }

    .avatar { position: relative; flex-shrink: 0; }

    .avatar__circle {
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .avatar__img {
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    .avatar__check {
      position: absolute;
      bottom: -2px;
      right: -2px;
      border-radius: 50%;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--surface);
      z-index: 2;
    }

    .avatar__overlay {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.18s ease;
      z-index: 1;
    }

    .avatar--editable { cursor: pointer; }
    .avatar--editable:hover .avatar__overlay { opacity: 1; }
  `]
})
export class Avatar {
  private readonly _name = signal('?');
  private readonly _imageUrl = signal<string | null>(null);
  private readonly _hue = signal(220);
  private readonly _imgError = signal(false);

  @Input() set name(value: string) { this._name.set(value || '?'); }
  @Input() set imageUrl(value: string | null | undefined) {
    this._imageUrl.set(value ?? null);
    this._imgError.set(false);
  }
  @Input() set hue(value: number) { this._hue.set(value); }

  @Input() size = 36;
  @Input() verified = false;
  @Input() editable = false;

  @Output() readonly edit = new EventEmitter<void>();

  readonly initials = computed(() =>
    this._name()
      .split(' ')
      .slice(0, 2)
      .map(s => s.charAt(0))
      .join('')
      .toUpperCase()
  );

  readonly color = computed(() => `oklch(0.72 0.1 ${this._hue()})`);

  readonly resolvedImageUrl = computed<string | null>(() =>
    this._imgError() ? null : this._imageUrl()
  );

  onAvatarClick(): void {
    if (this.editable) {
      this.edit.emit();
    }
  }

  onImageError(): void {
    this._imgError.set(true);
  }

  badgeSize(): number {
    return Math.max(14, this.size * 0.4);
  }
}
