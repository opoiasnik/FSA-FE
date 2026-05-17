export interface UserProfileDto {
  id: number;
  name: string;
  surname: string;
  email: string;
  createdAt: string;
  phone: string | null;
  bio: string | null;
  role: string;
  emailVerified: boolean;
  emailVerificationPending: boolean;
  messageEmailNotifications: boolean;
  viewingEmailNotifications: boolean;
  viewingRequestEmailNotifications: boolean;
  avatarUrl: string | null;
}
