import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { UserService } from './core/services/user.service';
import { AppFooter } from './shared/component/app-footer/app-footer';
import { AppHeader } from './shared/component/app-header/app-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MessageModule,
    AppHeader,
    AppFooter
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly isAuthenticated = computed(() => this.userService.isUserLoggedIn());
  readonly isOwner = computed(() => this.userService.hasRole('OWNER'));
  readonly authError = signal<string | null>(null);

  ngOnInit(): void {
    this.userService.tryLogin().catch((error: unknown) => {
      this.authError.set(this.toMessage(error));
    });
  }

  private toMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const maybeHttp = error as { error?: { message?: string }; message?: string; status?: number };
      return maybeHttp.error?.message
        ?? maybeHttp.message
        ?? (maybeHttp.status ? `Request failed with status ${maybeHttp.status}.` : 'Unexpected error.');
    }

    return 'Unexpected error.';
  }
}
