import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';

export type HomeMode = 'listings' | 'favorites' | 'viewings' | 'messages';

@Component({
  selector: 'app-mode-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mode-tabs.html',
  styleUrl: './mode-tabs.scss'
})
export class ModeTabs {
  private readonly userService = inject(UserService);

  @Input() active: HomeMode = 'listings';
  @Output() readonly activeChange = new EventEmitter<HomeMode>();

  private readonly allTabs: { id: HomeMode; label: string; icon: string; requiresAuth: boolean }[] = [
    { id: 'listings', label: 'Listings', icon: 'pi pi-home', requiresAuth: false },
    { id: 'favorites', label: 'Favorites', icon: 'pi pi-heart', requiresAuth: true },
    { id: 'viewings', label: 'Viewings', icon: 'pi pi-calendar', requiresAuth: true },
    { id: 'messages', label: 'Messages', icon: 'pi pi-comments', requiresAuth: true }
  ];

  readonly tabs = computed(() => {
    const isLoggedIn = this.userService.isUserLoggedIn();
    return this.allTabs.filter(t => !t.requiresAuth || isLoggedIn);
  });

  select(tab: HomeMode): void {
    this.active = tab;
    this.activeChange.emit(tab);
  }
}
