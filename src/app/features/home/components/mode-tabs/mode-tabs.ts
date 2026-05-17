import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { AccessAction, AccessService } from '../../../../core/access/access';

export type HomeMode = 'listings' | 'favorites' | 'viewings' | 'messages';

@Component({
  selector: 'app-mode-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mode-tabs.html',
  styleUrl: './mode-tabs.scss'
})
export class ModeTabs {
  private readonly access = inject(AccessService);

  @Input() active: HomeMode = 'listings';
  @Output() readonly activeChange = new EventEmitter<HomeMode>();

  private readonly allTabs: { id: HomeMode; label: string; icon: string; access?: AccessAction }[] = [
    { id: 'listings', label: 'Listings', icon: 'pi pi-home' },
    { id: 'favorites', label: 'Favorites', icon: 'pi pi-heart', access: 'viewFavorites' },
    { id: 'viewings', label: 'Viewings', icon: 'pi pi-calendar', access: 'viewViewings' },
    { id: 'messages', label: 'Messages', icon: 'pi pi-comments', access: 'viewMessages' }
  ];

  private readonly canViewFavorites = this.access.can('viewFavorites');
  private readonly canViewViewings = this.access.can('viewViewings');
  private readonly canViewMessages = this.access.can('viewMessages');

  readonly tabs = computed(() => {
    return this.allTabs.filter(tab => {
      switch (tab.access) {
        case 'viewFavorites':
          return this.canViewFavorites();
        case 'viewViewings':
          return this.canViewViewings();
        case 'viewMessages':
          return this.canViewMessages();
        default:
          return true;
      }
    });
  });

  select(tab: HomeMode): void {
    this.active = tab;
    this.activeChange.emit(tab);
  }
}
