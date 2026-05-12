export interface UserProfileDto {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  bio: string | null;
  role: string;
  avatarUrl: string | null;
}
