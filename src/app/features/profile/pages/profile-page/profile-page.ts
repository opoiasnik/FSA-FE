import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AccessService } from '../../../../core/access/access';
import { UserService } from '../../../../core/services/user.service';
import { ProfileHeader } from '../../components/profile-header/profile-header';
import { NotificationPref, NotificationPreferenceKey, ProfileNotificationsPanel } from '../../components/profile-notifications-panel/profile-notifications-panel';
import { ProfileFormModel, ProfilePersonalForm } from '../../components/profile-personal-form/profile-personal-form';
import { ProfileTab, ProfileTabId, ProfileTabs } from '../../components/profile-tabs/profile-tabs';
import { ProfileVerificationPanel, VerificationStep } from '../../components/profile-verification-panel/profile-verification-panel';
import { ProfileService } from '../../services/profile.service';

interface NotificationDefinition {
  key: NotificationPreferenceKey;
  label: string;
  body: string;
  audience?: 'owner' | 'user';
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ProfileHeader, ProfileTabs, ProfilePersonalForm, ProfileVerificationPanel, ProfileNotificationsPanel],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly access = inject(AccessService);
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);

  readonly tab = signal<ProfileTabId>('profile');
  readonly user = this.userService.getUserSignal();
  readonly avatarUrl = this.userService.avatarUrl;
  readonly emailVerified = this.userService.emailVerified;
  readonly emailVerificationPending = this.userService.emailVerificationPending;
  private readonly canViewOwnerNotificationSettings = this.access.can('viewOwnerNotificationSettings');
  private readonly canViewUserNotificationSettings = this.access.can('viewUserNotificationSettings');

  readonly uploading = signal(false);
  readonly saving = signal(false);
  readonly sendingEmailCode = signal(false);
  readonly confirmingEmailCode = signal(false);
  readonly savingNotificationPreferences = signal(false);
  readonly emailVerificationRequested = signal(false);
  readonly verificationCode = signal('');

  readonly form: ProfileFormModel = {
    name: '',
    surname: '',
    email: '',
    phone: '',
    bio: ''
  };

  private originalForm = { name: '', surname: '', email: '', phone: '', bio: '' };

  memberSince(): string {
    const createdAt = this.userService.createdAt();
    if (!createdAt) {
      return '';
    }
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
      .format(new Date(createdAt));
  }

  get isDirty(): boolean {
    return this.form.name    !== this.originalForm.name
        || this.form.surname !== this.originalForm.surname
        || this.form.email   !== this.originalForm.email
        || this.form.phone   !== this.originalForm.phone
        || this.form.bio     !== this.originalForm.bio;
  }

  readonly tabs: ProfileTab[] = [
    { id: 'profile', label: 'Profile', icon: 'pi-user' },
    { id: 'verification', label: 'Verification', icon: 'pi-shield' },
    { id: 'notifications', label: 'Notifications', icon: 'pi-bell' }
  ];

  private readonly notifications: NotificationDefinition[] = [
    { key: 'messageEmailNotifications', label: 'New messages', body: 'Email me when another user sends a chat message.' },
    { key: 'viewingEmailNotifications', label: 'Viewing request status', body: 'Email me when an owner approves or rejects my viewing request.', audience: 'user' },
    { key: 'viewingRequestEmailNotifications', label: 'New viewing requests', body: 'Email me when someone requests a viewing for my listing.', audience: 'owner' }
  ];

  ngOnInit(): void {
    const u = this.user();
    this.form.name    = u?.name    ?? '';
    this.form.surname = u?.surname ?? '';
    this.form.email   = u?.email   ?? '';
    this.form.phone   = this.userService.phone() ?? '';
    this.form.bio     = this.userService.bio()   ?? '';
    this.originalForm = { name: this.form.name, surname: this.form.surname, email: this.form.email, phone: this.form.phone, bio: this.form.bio };
  }

  switch(tab: ProfileTabId): void {
    this.tab.set(tab);
  }

  saveProfile(): void {
    this.saving.set(true);
    this.profileService.updateProfile({
      name: this.form.name,
      surname: this.form.surname,
      email: this.form.email,
      phone: this.form.phone || undefined,
      bio: this.form.bio || undefined
    }).subscribe({
      next: dto => {
        this.userService.updateProfile(
          dto.name,
          dto.surname,
          dto.email,
          dto.phone,
          dto.bio,
          dto.emailVerified,
          dto.emailVerificationPending,
        );
        this.form.name    = dto.name;
        this.form.surname = dto.surname ?? '';
        this.form.email   = dto.email;
        this.form.phone   = dto.phone   ?? '';
        this.form.bio     = dto.bio     ?? '';
        this.originalForm = { name: this.form.name, surname: this.form.surname, email: this.form.email, phone: this.form.phone, bio: this.form.bio };
        this.emailVerificationRequested.set(false);
        this.verificationCode.set('');
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  verificationProgress(): number {
    const steps = this.verificationSteps();
    const done = steps.filter(s => s.status === 'verified').length;
    return Math.round((done / steps.length) * 100);
  }

  verificationSteps(): VerificationStep[] {
    const status = this.emailVerified()
      ? 'verified'
      : this.emailVerificationPending() || this.emailVerificationRequested()
        ? 'pending'
        : 'unverified';

    return [
      { label: 'Email address', status }
    ];
  }

  requestEmailVerification(): void {
    this.sendingEmailCode.set(true);
    this.profileService.requestEmailVerification().subscribe({
      next: () => {
        this.sendingEmailCode.set(false);
        this.emailVerificationRequested.set(true);
        this.userService.updateProfile(
          this.form.name,
          this.form.surname,
          this.form.email,
          this.form.phone || null,
          this.form.bio || null,
          false,
          true,
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Verification email sent',
          detail: 'Enter the code from your email to verify the address.'
        });
      },
      error: () => {
        this.sendingEmailCode.set(false);
      }
    });
  }

  confirmEmailVerification(): void {
    const code = this.verificationCode().trim();
    if (!code) {
      return;
    }

    this.confirmingEmailCode.set(true);
    this.profileService.confirmEmailVerification(code).subscribe({
      next: dto => {
        this.userService.updateProfile(
          dto.name,
          dto.surname,
          dto.email,
          dto.phone,
          dto.bio,
          dto.emailVerified,
          dto.emailVerificationPending,
        );
        this.confirmingEmailCode.set(false);
        this.emailVerificationRequested.set(false);
        this.verificationCode.set('');
        this.messageService.add({
          severity: 'success',
          summary: 'Email verified',
          detail: 'Your email address is now verified.'
        });
      },
      error: () => {
        this.confirmingEmailCode.set(false);
      }
    });
  }

  notificationValue(key: NotificationPreferenceKey): boolean {
    switch (key) {
      case 'messageEmailNotifications':
        return this.userService.messageEmailNotifications();
      case 'viewingEmailNotifications':
        return this.userService.viewingEmailNotifications();
      case 'viewingRequestEmailNotifications':
        return this.userService.viewingRequestEmailNotifications();
    }
  }

  visibleNotifications(): NotificationPref[] {
    return this.notifications
      .filter(n => {
        if (!n.audience) {
          return true;
        }

        return n.audience === 'owner'
          ? this.canViewOwnerNotificationSettings()
          : this.canViewUserNotificationSettings();
      })
      .map(n => ({ ...n, enabled: this.notificationValue(n.key) }));
  }

  toggleNotificationPreference(key: NotificationPreferenceKey): void {
    const next = {
      messageEmailNotifications: this.userService.messageEmailNotifications(),
      viewingEmailNotifications: this.userService.viewingEmailNotifications(),
      viewingRequestEmailNotifications: this.userService.viewingRequestEmailNotifications()
    };

    next[key] = !next[key];
    this.savingNotificationPreferences.set(true);
    this.profileService.updateNotificationPreferences(next).subscribe({
      next: dto => {
        this.userService.updateNotificationPreferences(
          dto.messageEmailNotifications,
          dto.viewingEmailNotifications,
          dto.viewingRequestEmailNotifications,
        );
        this.savingNotificationPreferences.set(false);
      },
      error: () => {
        this.savingNotificationPreferences.set(false);
      }
    });
  }

  uploadFile(file: File): void {
    this.uploading.set(true);
    this.profileService.uploadAvatar(file).subscribe({
      next: dto => {
        this.userService.updateFromProfile(dto);
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
      }
    });
  }
}
