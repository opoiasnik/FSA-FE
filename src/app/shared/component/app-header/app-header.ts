import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AccessService } from '../../../core/access/access';
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
  private readonly router = inject(Router);
  private readonly access = inject(AccessService);

  readonly user = this.userService.getUserSignal();
  readonly isAuthenticated = computed(() => this.userService.isUserLoggedIn());
  readonly canViewOwnerStudio = this.access.can('viewOwnerStudio');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isOwnerStudioActive = computed(() => this.currentUrl().startsWith('/listings/create'));

  login(): void {
    this.userService.login(window.location.pathname + window.location.search);
  }

  logout(): void {
    this.userService.logout();
  }
}
