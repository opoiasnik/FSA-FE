import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AppFooter } from './shared/component/app-footer/app-footer';
import { AppHeader } from './shared/component/app-header/app-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MessageModule,
    ToastModule,
    AppHeader,
    AppFooter
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly authError = signal<string | null>(null);
}
