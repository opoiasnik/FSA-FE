import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../../core/services/user.service';
import { Avatar } from '../../../../shared/component/avatar/avatar';

type Tab = 'profile' | 'verification' | 'payments' | 'notifications' | 'security';

interface NotificationPref {
  key: string;
  label: string;
  body: string;
  channels: { email: boolean; push: boolean };
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageModule, Avatar],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage {
  private readonly userService = inject(UserService);

  readonly tab = signal<Tab>('profile');
  readonly user = this.userService.getUserSignal();

  readonly form = {
    firstName: 'Martin',
    lastName: 'Novák',
    email: this.user()?.email ?? 'you@example.com',
    phone: '+421 900 000 000',
    bio: 'Looking for a flat in Bratislava with good public transport.'
  };

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'pi-user' },
    { id: 'verification', label: 'Verification', icon: 'pi-shield' },
    { id: 'payments', label: 'Payments', icon: 'pi-credit-card' },
    { id: 'notifications', label: 'Notifications', icon: 'pi-bell' },
    { id: 'security', label: 'Security', icon: 'pi-lock' }
  ];

  readonly verificationSteps = [
    { label: 'Email address', done: true },
    { label: 'Phone number', done: true },
    { label: 'Government ID', done: false },
    { label: 'Address of residence', done: false }
  ];

  readonly paymentMethods = [
    { brand: 'Visa', last4: '4242', exp: '08 / 28', primary: true },
    { brand: 'Mastercard', last4: '0909', exp: '02 / 27', primary: false }
  ];

  readonly notifications: NotificationPref[] = [
    { key: 'new-match', label: 'New listing matches', body: 'When a listing matches your saved search.', channels: { email: true, push: true } },
    { key: 'message', label: 'New messages', body: 'Chat replies from owners or tenants.', channels: { email: false, push: true } },
    { key: 'viewing', label: 'Viewing reminders', body: '24h before a scheduled viewing.', channels: { email: true, push: true } },
    { key: 'promo', label: 'Tips & product news', body: 'Occasional updates. No spam.', channels: { email: false, push: false } }
  ];

  switch(tab: Tab): void {
    this.tab.set(tab);
  }

  verificationProgress(): number {
    const done = this.verificationSteps.filter(s => s.done).length;
    return Math.round((done / this.verificationSteps.length) * 100);
  }
}
