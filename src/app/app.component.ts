import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly user = this.userService.getUserSignal();
  readonly isAuthenticated = computed(() => this.userService.isUserLoggedIn());
  readonly isOwner = computed(() => this.userService.hasRole('OWNER'));
  readonly authError = signal<string | null>(null);

  ngOnInit(): void {
    this.userService.tryLogin().catch((error: unknown) => {
      this.authError.set(this.toMessage(error));
    });
  }

  login(): void {
    this.authError.set(null);
    this.userService.login(window.location.pathname + window.location.search);
  }

  logout(): void {
    this.userService.logout();
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
