import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom } from 'rxjs';
import { authCodeFlowConfig } from '../config/auth-code-flow.config';
import { UserModel } from '../models/user.model';
import { UserProfileDto } from '../models/user-profile.model';
import { KeycloakTokenService } from '../auth/keycloak-token.service';
import { ApiService } from './api.service';
import { ImageContentService } from './image-content.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userState = signal<UserModel | undefined>(undefined);
  private readonly _avatarUrl = signal<string | null>(null);
  private readonly _phone = signal<string | null>(null);
  private readonly _bio = signal<string | null>(null);
  private readonly _emailVerified = signal(false);
  private readonly _emailVerificationPending = signal(false);
  private avatarObjectUrl: string | null = null;
  readonly avatarUrl = this._avatarUrl.asReadonly();
  readonly phone = this._phone.asReadonly();
  readonly bio = this._bio.asReadonly();
  readonly emailVerified = this._emailVerified.asReadonly();
  readonly emailVerificationPending = this._emailVerificationPending.asReadonly();

  constructor(
    private readonly oauthService: OAuthService,
    private readonly keycloakTokenService: KeycloakTokenService,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly imageContentService: ImageContentService,
  ) {
    this.oauthService.configure(authCodeFlowConfig);
  }

  getUserSignal() {
    return this.userState.asReadonly();
  }

  getUserSnapshot(): UserModel | undefined {
    return this.userState();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  async tryLogin(): Promise<UserModel | undefined> {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.cleanupOidcParams();

    const accessToken = this.oauthService.getAccessToken();
    if (!accessToken) {
      this.userState.set(undefined);
      return undefined;
    }

    const user = this.setUserFromAccessToken(accessToken);
    if (user) {
      await this.loadUserProfile();
    }
    return user;
  }

  async loginWithPassword(username: string, password: string): Promise<UserModel> {
    const token = await this.keycloakTokenService.passwordGrant(username, password);
    await this.keycloakTokenService.storeTokenResponse(token);

    const user = this.setUserFromAccessToken(token.access_token);
    if (!user) {
      throw new Error('Unable to read user claims from access token.');
    }

    await this.loadUserProfile();
    return user;
  }

  login(redirectUrl?: string): void {
    void this.router.navigate(['/login'], {
      queryParams: redirectUrl ? { returnUrl: redirectUrl } : undefined
    });
  }

  updateAvatarUrl(url: string | null): void {
    void this.setAvatarFromContentUrl(url);
  }

  updateProfile(
    name: string,
    surname: string,
    email: string,
    phone: string | null,
    bio: string | null,
    emailVerified?: boolean,
    emailVerificationPending?: boolean,
  ): void {
    this.userState.update(u => u ? { ...u, name, surname, email } : u);
    this._phone.set(phone);
    this._bio.set(bio);
    if (emailVerified !== undefined) {
      this._emailVerified.set(emailVerified);
    }
    if (emailVerificationPending !== undefined) {
      this._emailVerificationPending.set(emailVerificationPending);
    }
  }

  async logout(): Promise<void> {
    const idToken = this.oauthService.getIdToken();

    if (idToken) {
      this.oauthService.logOut();
      this.clearUserState();
      return;
    }

    await this.keycloakTokenService.revoke(this.oauthService.getRefreshToken(), 'refresh_token');
    await this.keycloakTokenService.revoke(this.oauthService.getAccessToken(), 'access_token');
    this.oauthService.logOut(true);
    this.clearUserState();
    void this.router.navigate(['/home']);
  }

  isUserLoggedIn(): boolean {
    const currentUser = this.userState();
    const token = this.oauthService.getAccessToken();
    const expiration = this.oauthService.getAccessTokenExpiration();
    return !!currentUser && !!token && expiration > Date.now();
  }

  hasRole(role: string): boolean {
    return this.userState()?.roles.includes(role) ?? false;
  }

  private clearUserState(): void {
    this.userState.set(undefined);
    this.clearAvatarObjectUrl();
    this._phone.set(null);
    this._bio.set(null);
    this._emailVerified.set(false);
    this._emailVerificationPending.set(false);
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const dto = await firstValueFrom(this.api.get<UserProfileDto>('/user'));
      this.userState.update(u => u ? { ...u, name: dto.name, surname: dto.surname, email: dto.email } : u);
      await this.setAvatarFromContentUrl(dto.avatarUrl);
      this._phone.set(dto.phone);
      this._bio.set(dto.bio);
      this._emailVerified.set(dto.emailVerified);
      this._emailVerificationPending.set(dto.emailVerificationPending);
    } catch {
      // non-critical
    }
  }

  private async setAvatarFromContentUrl(url: string | null | undefined): Promise<void> {
    this.clearAvatarObjectUrl();
    if (!url) {
      return;
    }

    try {
      this.avatarObjectUrl = await firstValueFrom(this.imageContentService.loadObjectUrl(url));
      this._avatarUrl.set(this.avatarObjectUrl);
    } catch {
      this._avatarUrl.set(null);
    }
  }

  private clearAvatarObjectUrl(): void {
    this.imageContentService.revokeObjectUrl(this.avatarObjectUrl);
    this.avatarObjectUrl = null;
    this._avatarUrl.set(null);
  }

  private readAccessTokenClaims(token: string): Record<string, unknown> | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

      return JSON.parse(atob(payload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private setUserFromAccessToken(accessToken: string): UserModel | undefined {
    const accessTokenClaims = this.readAccessTokenClaims(accessToken);
    if (!accessTokenClaims) {
      this.userState.set(undefined);
      return undefined;
    }

    const realmAccess = accessTokenClaims['realm_access'] as { roles?: string[] } | undefined;
    const user: UserModel = {
      id: String(accessTokenClaims['sub'] ?? ''),
      email: String(accessTokenClaims['email'] ?? ''),
      username: String(accessTokenClaims['preferred_username'] ?? ''),
      name: String(accessTokenClaims['given_name'] ?? accessTokenClaims['preferred_username'] ?? ''),
      surname: String(accessTokenClaims['family_name'] ?? ''),
      roles: realmAccess?.roles ?? []
    };

    this.userState.set(user);
    return user;
  }

  private cleanupOidcParams(): void {
    const url = new URL(window.location.href);
    const keys = ['code', 'state', 'session_state', 'iss'];
    let changed = false;

    for (const key of keys) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    const search = url.searchParams.toString();
    const cleanUrl = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}
