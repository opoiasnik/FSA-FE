import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ProfileTabId = 'profile' | 'verification' | 'notifications';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-profile-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tabs.html',
  styleUrls: ['./profile-tabs.scss']
})
export class ProfileTabs {
  @Input() tabs: ProfileTab[] = [];
  @Input() active: ProfileTabId = 'profile';

  @Output() activeChange = new EventEmitter<ProfileTabId>();
}
