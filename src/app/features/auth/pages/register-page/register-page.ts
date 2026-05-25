import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { KeycloakRegistrationService } from '../../../../core/auth/keycloak-registration.service';
import { ErrorHandlerService, ErrorResult } from '../../../../core/services/error-handler.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(MessageService);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    username:  ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    role:      ['USER' as 'USER' | 'OWNER'],
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearServerErrors());
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.registrationService.register(this.form.getRawValue());
      this.success.set(true);
      this.toast.add({
        severity: 'success',
        summary: 'Account created',
        detail: 'You can sign in with your new account.'
      });
      setTimeout(() => void this.router.navigate(['/login']), 2000);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const result = status === 409
        ? { message: 'User with this username or email already exists.', field: 'username' }
        : this.errorHandler.toResult(err);
      this.applyServerError(result);
      this.toast.add({
        severity: 'error',
        summary: 'Registration failed',
        detail: result.message
      });
    } finally {
      this.loading.set(false);
    }
  }

  private applyServerError(result: ErrorResult): void {
    const fieldName = result.field?.split('.').pop();
    const ctrl = fieldName ? this.form.get(fieldName) : null;

    if (!ctrl) {
      this.error.set(result.message);
      return;
    }

    this.error.set(null);
    ctrl.setErrors({ ...(ctrl.errors ?? {}), server: result.message });
    ctrl.markAsTouched();
  }

  private clearServerErrors(): void {
    this.error.set(null);
    Object.values(this.form.controls).forEach(control => {
      if (!control.errors?.['server']) {
        return;
      }

      const { server, ...remainingErrors } = control.errors;
      control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }
}
