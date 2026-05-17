import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserProfileDto } from '../../../core/models/user-profile.model';

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface UpdateNotificationPreferencesRequest {
  messageEmailNotifications: boolean;
  viewingEmailNotifications: boolean;
  viewingRequestEmailNotifications: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  updateProfile(request: UpdateProfileRequest): Observable<UserProfileDto> {
    return this.api.patch<UserProfileDto>('/user', request);
  }

  uploadAvatar(file: File): Observable<UserProfileDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<UserProfileDto>('/user/avatar', formData);
  }

  requestEmailVerification(): Observable<void> {
    return this.api.post<void>('/user/email-verification', {});
  }

  confirmEmailVerification(code: string): Observable<UserProfileDto> {
    return this.api.post<UserProfileDto>('/user/email-verification/confirm', { code });
  }

  updateNotificationPreferences(request: UpdateNotificationPreferencesRequest): Observable<UserProfileDto> {
    return this.api.patch<UserProfileDto>('/user/notification-preferences', request);
  }
}
