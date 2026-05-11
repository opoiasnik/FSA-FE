import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthForm } from '../../components/auth-form/auth-form';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLayout, AuthForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly http: HttpClient;
  private readonly realm       = 'rental';

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    username:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    role:      ['USER' as 'USER' | 'OWNER'],
  });

  constructor(
    private readonly fb:     FormBuilder,
    private readonly router: Router,
    handler:                 HttpBackend,
  ) {
    this.http = new HttpClient(handler);
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { firstName, lastName, username, email, password, role } = this.form.getRawValue();
    let adminToken: string | null = null;
    let keycloakId: string | null = null;

    try {
      const tokenParams = new HttpParams()
        .set('grant_type', 'password')
        .set('client_id', 'admin-cli')
        .set('username', 'admin')
        .set('password', 'admin');

      const tokenRes = await firstValueFrom(
        this.http.post<{ access_token: string }>(
          '/realms/master/protocol/openid-connect/token',
          tokenParams.toString(),
          { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
        ),
      );
      adminToken = tokenRes.access_token;

      const authHeader = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });

      const createRes = await firstValueFrom(
        this.http.post(
          `/admin/realms/${this.realm}/users`,
          {
            username,
            firstName,
            lastName,
            email,
            enabled: true,
            credentials: [{ type: 'password', value: password, temporary: false }],
          },
          { headers: authHeader.set('Content-Type', 'application/json'), observe: 'response' },
        ),
      );

      const location = createRes.headers.get('location') ?? '';
      keycloakId = location.substring(location.lastIndexOf('/') + 1);

      const roles = await firstValueFrom(
        this.http.get<{ id: string; name: string }[]>(
          `/admin/realms/${this.realm}/roles`,
          { headers: authHeader },
        ),
      );

      const targetRole = roles.find(r => r.name === role);
      if (!targetRole) throw new Error(`Role "${role}" not found in realm`);

      await firstValueFrom(
        this.http.post(
          `/admin/realms/${this.realm}/users/${keycloakId}/role-mappings/realm`,
          [targetRole],
          { headers: authHeader.set('Content-Type', 'application/json') },
        ),
      );

      this.success.set(true);
      setTimeout(() => void this.router.navigate(['/login']), 2000);
    } catch (err: unknown) {
      await this.rollback(adminToken, keycloakId);
      const status = (err as { status?: number })?.status;
      this.error.set(
        status === 409 ? 'User with this username or email already exists.' : 'Registration failed. Please try again.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async rollback(adminToken: string | null, keycloakId: string | null): Promise<void> {
    if (!adminToken || !keycloakId) return;
    try {
      await firstValueFrom(
        this.http.delete(
          `/admin/realms/${this.realm}/users/${keycloakId}`,
          { headers: new HttpHeaders({ Authorization: `Bearer ${adminToken}` }) },
        ),
      );
    } catch {}
  }
}
