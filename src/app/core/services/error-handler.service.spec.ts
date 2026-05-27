import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  const service = new ErrorHandlerService();

  it('uses backend validation field and maps Keycloak username errors', () => {
    const result = service.toResult(new HttpErrorResponse({
      status: 400,
      error: {
        field: 'username',
        errorMessage: 'error-username-invalid-character',
        params: ['username']
      }
    }));

    expect(result).toEqual({
      field: 'username',
      message: 'Username can contain only letters, numbers, dots, underscores, and hyphens.'
    });
  });

  it('maps required field errors using backend params when field is missing', () => {
    expect(service.toMessage({
      error: {
        errorMessage: 'error-user-attribute-required',
        params: ['email']
      }
    })).toBe('Email is required.');
  });

  it('prefers backend message over status fallback', () => {
    expect(service.toMessage(new HttpErrorResponse({
      status: 409,
      error: { message: 'Listing already exists.' }
    }))).toBe('Listing already exists.');
  });

  it('falls back to readable HTTP status messages', () => {
    expect(service.toMessage(new HttpErrorResponse({ status: 0 })))
      .toBe('Server is unreachable. Check your network.');
    expect(service.toMessage(new HttpErrorResponse({ status: 403 })))
      .toBe('You do not have permission to perform this action.');
    expect(service.toMessage(new HttpErrorResponse({ status: 418 })))
      .toBe('Request failed with status 418.');
  });

  it('humanizes unknown error codes from backend', () => {
    expect(service.toMessage({ error: { errorMessage: 'error-listing-photo-too-large' } }))
      .toBe('Listing photo too large');
  });

  it('handles string and unknown errors', () => {
    expect(service.toMessage('Plain error')).toBe('Plain error');
    expect(service.toResult(null)).toEqual({ message: 'Unexpected error.' });
  });
});
