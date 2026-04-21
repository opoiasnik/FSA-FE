import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [style.width.px]="size" [style.height.px]="size">
      <div class="avatar__circle"
           [style.width.px]="size"
           [style.height.px]="size"
           [style.background]="color()"
           [style.fontSize.px]="size * 0.38">
        {{ initials() }}
      </div>
      <span *ngIf="verified" class="avatar__check"
            [style.width.px]="badgeSize()"
            [style.height.px]="badgeSize()">
        <i class="pi pi-check" [style.fontSize.px]="size * 0.2"></i>
      </span>
    </div>
  `,
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
    }
  `]
})
export class Avatar {
  private readonly _name = signal('?');

  @Input() set name(value: string) { this._name.set(value || '?'); }
  @Input() size = 36;
  @Input() hue = 220;
  @Input() verified = false;

  readonly initials = computed(() =>
    this._name()
      .split(' ')
      .slice(0, 2)
      .map(s => s.charAt(0))
      .join('')
      .toUpperCase()
  );

  readonly color = computed(() => `oklch(0.72 0.1 ${this.hue})`);

  badgeSize(): number {
    return Math.max(14, this.size * 0.4);
  }
}
