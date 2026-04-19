import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="not-found">
      <p class="eyebrow">404</p>
      <h1>Stránka neexistuje</h1>
      <a routerLink="/home" class="button accent">Späť na home</a>
    </section>
  `,
  styles: [`
    .not-found {
      padding: 48px;
      border-radius: 28px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }

    .eyebrow {
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.75rem;
      color: var(--accent);
    }
  `]
})
export class PageNotFoundComponent {}
