import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthForm } from '../../components/auth-form/auth-form';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLayout, AuthForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.getRawValue();

    try {
      await this.userService.loginWithPassword(username, password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
      await this.router.navigateByUrl(returnUrl);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      this.error.set(
        status === 400 || status === 401
          ? 'Invalid username or password.'
          : 'Login failed. Please try again.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
