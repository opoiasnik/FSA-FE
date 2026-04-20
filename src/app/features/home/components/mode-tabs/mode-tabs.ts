import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type HomeMode = 'homes' | 'experiences' | 'services';

@Component({
  selector: 'app-mode-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mode-tabs.html',
  styleUrl: './mode-tabs.scss'
})
export class ModeTabs {
  @Input() active: HomeMode = 'homes';
  @Output() readonly activeChange = new EventEmitter<HomeMode>();

  readonly tabs: { id: HomeMode; label: string; icon: string }[] = [
    { id: 'homes', label: 'Homes', icon: 'pi pi-home' },
    { id: 'experiences', label: 'Experiences', icon: 'pi pi-map' },
    { id: 'services', label: 'Services', icon: 'pi pi-briefcase' }
  ];

  select(tab: HomeMode): void {
    this.active = tab;
    this.activeChange.emit(tab);
  }
}
