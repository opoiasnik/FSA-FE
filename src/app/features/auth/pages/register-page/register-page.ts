import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { KeycloakRegistrationService } from '../../../../core/auth/keycloak-registration.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
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
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registrationService = inject(KeycloakRegistrationService);
  private readonly errorHandler = inject(ErrorHandlerService);

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

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.registrationService.register(this.form.getRawValue());
      this.success.set(true);
      setTimeout(() => void this.router.navigate(['/login']), 2000);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      this.error.set(
        status === 409
          ? 'User with this username or email already exists.'
          : this.errorHandler.toMessage(err),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
