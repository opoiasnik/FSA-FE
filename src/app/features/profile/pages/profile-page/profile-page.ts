import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../../core/services/user.service';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { ProfileService } from '../../services/profile.service';

type Tab = 'profile' | 'verification' | 'notifications';

interface NotificationPref {
  key: string;
  label: string;
  body: string;
  channels: { email: boolean; push: boolean };
}

interface VerificationStep {
  label: string;
  status: 'verified' | 'pending' | 'unverified';
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageModule, Avatar],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;

  readonly tab = signal<Tab>('profile');
  readonly user = this.userService.getUserSignal();
  readonly avatarUrl = this.userService.avatarUrl;
  readonly emailVerified = this.userService.emailVerified;
  readonly emailVerificationPending = this.userService.emailVerificationPending;

  readonly showUploadPanel = signal(false);
  readonly uploading = signal(false);
  readonly saving = signal(false);
  readonly sendingEmailCode = signal(false);
  readonly confirmingEmailCode = signal(false);
  readonly emailVerificationRequested = signal(false);
  readonly isDragOver = signal(false);
  readonly verificationCode = signal('');

  readonly form = {
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

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'pi-user' },
    { id: 'verification', label: 'Verification', icon: 'pi-shield' },
    { id: 'notifications', label: 'Notifications', icon: 'pi-bell' }
  ];

  readonly notifications: NotificationPref[] = [
    { key: 'new-match', label: 'New listing matches', body: 'When a listing matches your saved search.', channels: { email: true, push: true } },
    { key: 'message', label: 'New messages', body: 'Chat replies from owners or tenants.', channels: { email: false, push: true } },
    { key: 'viewing', label: 'Viewing reminders', body: '24h before a scheduled viewing.', channels: { email: true, push: true } },
    { key: 'promo', label: 'Tips & product news', body: 'Occasional updates. No spam.', channels: { email: false, push: false } }
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

  switch(tab: Tab): void {
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

  openAvatarUpload(): void {
    this.showUploadPanel.set(true);
  }

  closeUploadPanel(): void {
    this.showUploadPanel.set(false);
    this.isDragOver.set(false);
  }

  triggerFileInput(): void {
    this.closeUploadPanel();
    this.fileInputRef.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.closeUploadPanel();
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  private uploadFile(file: File): void {
    this.uploading.set(true);
    this.profileService.uploadAvatar(file).subscribe({
      next: dto => {
        this.userService.updateAvatarUrl(dto.avatarUrl);
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
      }
    });
  }
}
