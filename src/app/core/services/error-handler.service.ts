import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorPayload {
  type?: string;
  message?: string;
  field?: string;
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
        message: payload?.message ?? this.fromStatus(error.status),
        field: payload?.field
      };
    }
    if (error && typeof error === 'object') {
      const e = error as { error?: ApiErrorPayload; message?: string; status?: number };
      return {
        message: e.error?.message ?? e.message ?? (e.status ? this.fromStatus(e.status) : 'Unexpected error.'),
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
      return e.error?.message
          ?? e.message
          ?? (e.status ? this.fromStatus(e.status) : 'Unexpected error.');
    }

    return 'Unexpected error.';
  }

  private fromHttpError(error: HttpErrorResponse): string {
    const payload = error.error as ApiErrorPayload | undefined;
    if (payload?.message) {
      return payload.message;
    }
    return this.fromStatus(error.status);
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
