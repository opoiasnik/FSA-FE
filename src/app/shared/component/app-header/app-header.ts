import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    Avatar
  ],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss'
})
export class AppHeader {
  private readonly userService = inject(UserService);

  readonly user = this.userService.getUserSignal();
  readonly isAuthenticated = computed(() => this.userService.isUserLoggedIn());
  readonly isOwner = computed(() => this.userService.hasRole('OWNER'));

  login(): void {
    this.userService.login(window.location.pathname + window.location.search);
  }

  logout(): void {
    this.userService.logout();
  }
}
