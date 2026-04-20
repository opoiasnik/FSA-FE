import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type HomeMode = 'listings' | 'favorites' | 'viewings' | 'messages';

@Component({
  selector: 'app-mode-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mode-tabs.html',
  styleUrl: './mode-tabs.scss'
})
export class ModeTabs {
  @Input() active: HomeMode = 'listings';
  @Output() readonly activeChange = new EventEmitter<HomeMode>();

  readonly tabs: { id: HomeMode; label: string; icon: string }[] = [
    { id: 'listings', label: 'Listings', icon: 'pi pi-home' },
    { id: 'favorites', label: 'Favorites', icon: 'pi pi-heart' },
    { id: 'viewings', label: 'Viewings', icon: 'pi pi-calendar' },
    { id: 'messages', label: 'Messages', icon: 'pi pi-comments' }
  ];

  select(tab: HomeMode): void {
    this.active = tab;
    this.activeChange.emit(tab);
  }
}
