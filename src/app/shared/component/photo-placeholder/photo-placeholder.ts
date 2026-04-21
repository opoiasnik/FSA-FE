import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-photo-placeholder',
  standalone: true,
  template: `
    <div class="ph" [style.borderRadius.px]="rounded" [style.background]="background()">
      <span class="ph__label">{{ label }}</span>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .ph {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      color: rgba(255,255,255,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ph__label {
      position: absolute;
      bottom: 8px;
      left: 10px;
      font-size: 10px;
    }
  `]
})
export class PhotoPlaceholder {
  private readonly _seed = signal(0);

  @Input() set seed(value: number) { this._seed.set(value); }
  @Input() label = '';
  @Input() rounded = 16;

  readonly background = computed(() => {
    const hues = [8, 22, 42, 140, 200, 260, 320, 350];
    const h = hues[this._seed() % hues.length];
    return `linear-gradient(135deg, oklch(0.82 0.06 ${h}), oklch(0.66 0.08 ${(h + 40) % 360}))`;
  });
}
