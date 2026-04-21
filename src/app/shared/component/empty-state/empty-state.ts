import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="empty__icon">
        <i class="pi" [ngClass]="icon"></i>
      </div>
      <h3>{{ title }}</h3>
      <p *ngIf="body">{{ body }}</p>
      <button *ngIf="cta" type="button" class="ra-btn" (click)="ctaClick.emit()">{{ cta }}</button>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty {
      padding: 60px 32px;
      text-align: center;
      border-radius: var(--r-xl);
      border: 1px dashed var(--border);
      background: var(--surface-soft);
    }
    .empty__icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--surface);
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      font-size: 22px;
    }
    h3 { margin: 0; font-size: 18px; font-weight: 700; }
    p { margin: 6px 0 18px; color: var(--text-muted); font-size: 14px; }
  `]
})
export class EmptyState {
  @Input() icon = 'pi-inbox';
  @Input() title = '';
  @Input() body = '';
  @Input() cta = '';
  @Output() ctaClick = new EventEmitter<void>();
}
