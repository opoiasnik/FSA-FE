import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorPayload {
  type?: string;
  message?: string;
  errorMessage?: string;
  field?: string;
  params?: string[];
  timestamp?: string;
}

export interface ErrorResult {
  message: string;
  field?: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {

  toResult(error: unknown): ErrorResult {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as ApiErrorPayload | undefined;
      return {
        message: this.fromPayload(payload) ?? this.fromStatus(error.status),
        field: payload?.field
      };
    }
    if (error && typeof error === 'object') {
      const e = error as { error?: ApiErrorPayload; message?: string; status?: number };
      return {
        message: this.fromPayload(e.error) ?? e.message ?? (e.status ? this.fromStatus(e.status) : 'Unexpected error.'),
        field: e.error?.field
      };
    }
    return { message: typeof error === 'string' ? error : 'Unexpected error.' };
  }

  toMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      return this.fromHttpError(error);
    }

    if (error && typeof error === 'object') {
      const e = error as { error?: ApiErrorPayload; message?: string; status?: number };
      return this.fromPayload(e.error)
          ?? e.message
          ?? (e.status ? this.fromStatus(e.status) : 'Unexpected error.');
    }

    return 'Unexpected error.';
  }

  private fromHttpError(error: HttpErrorResponse): string {
    const payload = error.error as ApiErrorPayload | undefined;
    return this.fromPayload(payload) ?? this.fromStatus(error.status);
  }

  private fromPayload(payload: ApiErrorPayload | undefined): string | null {
    if (!payload) {
      return null;
    }

    if (payload.message) {
      return this.humanize(payload.message);
    }

    if (payload.errorMessage) {
      return this.humanize(payload.errorMessage, payload);
    }

    return null;
  }

  private humanize(message: string, payload?: ApiErrorPayload): string {
    switch (message) {
      case 'error-username-invalid-character':
        return 'Username can contain only letters, numbers, dots, underscores, and hyphens.';
      case 'error-user-attribute-required':
        return `${this.fieldLabel(payload?.field ?? payload?.params?.[0])} is required.`;
      case 'error-invalid-email':
      case 'error-email-invalid':
        return 'Enter a valid email address.';
      case 'error-user-exists':
      case 'error-username-exists':
        return 'User with this username already exists.';
      case 'error-email-exists':
        return 'User with this email already exists.';
      default:
        return message.startsWith('error-')
          ? message
              .replace(/^error-/, '')
              .replaceAll('-', ' ')
              .replace(/^\w/, char => char.toUpperCase())
          : message;
    }
  }

  private fieldLabel(field: string | undefined): string {
    switch (field) {
      case 'username': return 'Username';
      case 'email': return 'Email';
      case 'firstName': return 'First name';
      case 'lastName': return 'Last name';
      case 'password': return 'Password';
      default: return 'This field';
    }
  }

  private fromStatus(status: number): string {
    switch (status) {
      case 0:   return 'Server is unreachable. Check your network.';
      case 400: return 'Bad request.';
      case 401: return 'Authentication required.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'Not found.';
      case 409: return 'Conflict — the resource already exists or is in use.';
      case 422: return 'Validation failed.';
      case 500: return 'Server error. Please try again later.';
      default:  return `Request failed with status ${status}.`;
    }
  }
}
