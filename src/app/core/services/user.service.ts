import { Injectable, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from '../config/auth-code-flow.config';
import { UserModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userState = signal<UserModel | undefined>(undefined);

  constructor(private readonly oauthService: OAuthService) {
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
    const accessTokenClaims = this.readAccessTokenClaims(accessToken);
    //console.log('Access Token Claims:', accessTokenClaims);

    if (!accessToken || !accessTokenClaims) {
      this.userState.set(undefined);
      return undefined;
    }

    const realmAccess = accessTokenClaims['realm_access'] as { roles?: string[] } | undefined;
    const user: UserModel = {
      id: String(accessTokenClaims['sub'] ?? ''),
      email: String(accessTokenClaims['email'] ?? ''),
      username: String(accessTokenClaims['preferred_username'] ?? ''),
      name: String(accessTokenClaims['name'] ?? accessTokenClaims['preferred_username'] ?? ''),
      roles: realmAccess?.roles ?? []
    };

    this.userState.set(user);
    return user;
  }

  login(redirectUrl?: string): void {
    this.oauthService.initCodeFlow(redirectUrl);
  }

  logout(): void {
    this.userState.set(undefined);
    void this.oauthService.revokeTokenAndLogout({
      post_logout_redirect_uri: window.location.origin + '/'
    });
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

  getAccessTokenExpiration(): number {
    this.userState();
    return this.oauthService.getAccessTokenExpiration();
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
