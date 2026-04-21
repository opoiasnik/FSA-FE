import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="not-found">
      <div class="not-found__code">404</div>
      <h1>This page took a wrong turn</h1>
      <p>The listing you're looking for may have been delisted or the link is broken.</p>
      <div class="not-found__actions">
        <a routerLink="/home" class="ra-btn">Back to home</a>
        <a routerLink="/listings" class="ra-btn ra-btn--ghost">Browse listings</a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .not-found {
      max-width: 540px;
      margin: 60px auto;
      padding: 56px 40px;
      text-align: center;
      border-radius: var(--r-xl);
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
    }
    .not-found__code {
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--accent);
      margin-bottom: 12px;
    }
    h1 { margin: 0 0 10px; font-size: 24px; font-weight: 700; }
    p { margin: 0 0 28px; color: var(--text-muted); font-size: 14px; }
    .not-found__actions { display: inline-flex; gap: 10px; }
  `]
})
export class PageNotFoundComponent {}
