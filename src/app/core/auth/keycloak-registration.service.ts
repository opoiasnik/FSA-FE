import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type RegistrationRole = 'USER' | 'OWNER';

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

interface AdminTokenResponse {
  access_token: string;
}

interface RealmRole {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakRegistrationService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly realm = this.resolveRealm();
  private readonly keycloakBasePath = this.resolveKeycloakBasePath();

  async register(request: RegisterUserRequest): Promise<void> {
    let adminToken: string | null = null;
    let keycloakId: string | null = null;

    try {
      adminToken = await this.getAdminToken();
      const authHeader = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });
      keycloakId = await this.createUser(request, authHeader);
      await this.assignRealmRole(keycloakId, request.role, authHeader);
    } catch (error) {
      await this.rollback(adminToken, keycloakId);
      throw error;
    }
  }

  private async getAdminToken(): Promise<string> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'admin-cli')
      .set('username', 'admin')
      .set('password', 'admin');

    const token = await firstValueFrom(
      this.http.post<AdminTokenResponse>(
        `${this.keycloakBasePath}/realms/master/protocol/openid-connect/token`,
        body.toString(),
        { headers: this.formHeaders() },
      ),
    );

    return token.access_token;
  }

  private async createUser(request: RegisterUserRequest, authHeader: HttpHeaders): Promise<string> {
    const response = await firstValueFrom(
      this.http.post(
        `${this.keycloakBasePath}/admin/realms/${this.realm}/users`,
        {
          username: request.username,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          enabled: true,
          credentials: [{ type: 'password', value: request.password, temporary: false }],
        },
        { headers: authHeader.set('Content-Type', 'application/json'), observe: 'response' },
      ),
    );

    const location = response.headers.get('location') ?? '';
    return location.substring(location.lastIndexOf('/') + 1);
  }

  private async assignRealmRole(keycloakId: string, role: RegistrationRole, authHeader: HttpHeaders): Promise<void> {
    const roles = await firstValueFrom(
      this.http.get<RealmRole[]>(
        `${this.keycloakBasePath}/admin/realms/${this.realm}/roles`,
        { headers: authHeader },
      ),
    );

    const targetRole = roles.find(item => item.name === role);
    if (!targetRole) {
      throw new Error(`Role "${role}" not found in realm.`);
    }

    await firstValueFrom(
      this.http.post(
        `${this.keycloakBasePath}/admin/realms/${this.realm}/users/${keycloakId}/role-mappings/realm`,
        [targetRole],
        { headers: authHeader.set('Content-Type', 'application/json') },
      ),
    );
  }

  private async rollback(adminToken: string | null, keycloakId: string | null): Promise<void> {
    if (!adminToken || !keycloakId) {
      return;
    }

    try {
      await firstValueFrom(
        this.http.delete(
          `${this.keycloakBasePath}/admin/realms/${this.realm}/users/${keycloakId}`,
          { headers: new HttpHeaders({ Authorization: `Bearer ${adminToken}` }) },
        ),
      );
    } catch {
      // Registration rollback is best-effort; the original error is more useful to the caller.
    }
  }

  private formHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  }

  private resolveRealm(): string {
    const marker = '/realms/';
    const index = environment.auth.issuer.lastIndexOf(marker);
    return index >= 0
      ? environment.auth.issuer.substring(index + marker.length).split('/')[0]
      : 'rental';
  }

  private resolveKeycloakBasePath(): string {
    const marker = '/realms/';
    const index = environment.auth.issuer.lastIndexOf(marker);
    if (index < 0) {
      return '';
    }

    const baseUrl = environment.auth.issuer.substring(0, index);
    try {
      const url = new URL(baseUrl);
      return url.origin === window.location.origin ? url.pathname : '';
    } catch {
      return baseUrl;
    }
  }
}
