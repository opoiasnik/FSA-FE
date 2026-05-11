import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PasswordGrantTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  scope?: string;
}

type TokenTypeHint = 'access_token' | 'refresh_token';

interface OAuthTokenStorage {
  storeAccessTokenResponse(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    grantedScopes: string,
  ): void;
  processIdToken(idToken: string, accessToken: string, skipNonceCheck?: boolean): Promise<unknown>;
  storeIdToken(idToken: unknown): void;
}

@Injectable({ providedIn: 'root' })
export class KeycloakTokenService {
  private readonly tokenUrl = `${environment.auth.issuer}/protocol/openid-connect/token`;
  private readonly revokeUrl = `${environment.auth.issuer}/protocol/openid-connect/revoke`;

  constructor(
    private readonly http: HttpClient,
    private readonly oauthService: OAuthService,
  ) {}

  async passwordGrant(username: string, password: string): Promise<PasswordGrantTokenResponse> {
    return firstValueFrom(
      this.http.post<PasswordGrantTokenResponse>(
        this.tokenUrl,
        this.withClientCredentials({
          grant_type: 'password',
          username,
          password,
          scope: environment.auth.scope,
        }).toString(),
        { headers: this.formHeaders() },
      ),
    );
  }

  async storeTokenResponse(token: PasswordGrantTokenResponse): Promise<void> {
    const oauth = this.oauthService as unknown as OAuthTokenStorage;

    oauth.storeAccessTokenResponse(
      token.access_token,
      token.refresh_token ?? '',
      token.expires_in,
      token.scope ?? environment.auth.scope,
    );

    if (!token.id_token) {
      return;
    }

    const idToken = await oauth.processIdToken(token.id_token, token.access_token, true);
    oauth.storeIdToken(idToken);
  }

  async revoke(token: string, tokenTypeHint: TokenTypeHint): Promise<void> {
    if (!token) {
      return;
    }

    try {
      await firstValueFrom(
        this.http.post(
          this.revokeUrl,
          this.withClientCredentials({ token, token_type_hint: tokenTypeHint }).toString(),
          { headers: this.formHeaders() },
        ),
      );
    } catch {
      // Logout must still clear client state if the token was already invalid.
    }
  }

  private withClientCredentials(params: Record<string, string>): HttpParams {
    let body = new HttpParams().set('client_id', environment.auth.clientId);

    for (const [key, value] of Object.entries(params)) {
      body = body.set(key, value);
    }

    const auth = environment.auth as { clientSecret?: string };
    return auth.clientSecret ? body.set('client_secret', auth.clientSecret) : body;
  }

  private formHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  }
}
