import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { AuthRole, RoleSelector } from '../role-selector/role-selector';

export type AuthFormMode = 'login' | 'register';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageModule, RoleSelector],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.scss',
})
export class AuthForm {
  @Input({ required: true }) mode!: AuthFormMode;
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() submitted = new EventEmitter<void>();

  showPassword = false;

  get isRegister(): boolean {
    return this.mode === 'register';
  }

  get submitLabel(): string {
    if (this.loading) {
      return this.isRegister ? 'Creating account...' : 'Signing in...';
    }
    return this.isRegister ? 'Create account' : 'Sign in';
  }

  get roleValue(): AuthRole {
    return (this.form.get('role')?.value ?? 'USER') as AuthRole;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && c.touched;
  }

  errorMessage(field: string): string | null {
    const c = this.form.get(field);
    if (!c || !this.isInvalid(field)) {
      return null;
    }

    if (c.errors?.['server']) {
      return c.errors['server'];
    }
    if (c.errors?.['required']) {
      return 'This field is required.';
    }
    if (c.errors?.['email']) {
      return 'Enter a valid email address.';
    }
    if (c.errors?.['minlength']) {
      return `Use at least ${c.errors['minlength'].requiredLength} characters.`;
    }
    if (c.errors?.['pattern']) {
      return 'Use only letters, numbers, dots, underscores, and hyphens.';
    }

    return null;
  }

  setRole(role: AuthRole): void {
    this.form.get('role')?.setValue(role);
  }
}
