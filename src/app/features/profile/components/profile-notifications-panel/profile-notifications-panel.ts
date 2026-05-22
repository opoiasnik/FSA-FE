import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type NotificationPreferenceKey =
  | 'messageEmailNotifications'
  | 'viewingEmailNotifications'
  | 'viewingRequestEmailNotifications';

export interface NotificationPref {
  key: NotificationPreferenceKey;
  label: string;
  body: string;
  enabled: boolean;
}

@Component({
  selector: 'app-profile-notifications-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-notifications-panel.html',
  styleUrls: ['./profile-notifications-panel.scss']
})
export class ProfileNotificationsPanel {
  @Input() notifications: NotificationPref[] = [];
  @Input() saving = false;
  @Input() emailVerified = false;

  @Output() toggled = new EventEmitter<NotificationPreferenceKey>();

  toggle(key: NotificationPreferenceKey): void {
    if (this.saving || !this.emailVerified) {
      return;
    }

    this.toggled.emit(key);
  }
}
