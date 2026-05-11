import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

export const SKIP_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

@Injectable()
export class GlobalHttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly formatter: ErrorHandlerService,
    private readonly messageService: MessageService,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (this.shouldToast(req, error)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Request failed',
            detail: this.formatter.toMessage(error),
            life: 5000,
          });
        }

        return throwError(() => error);
      }),
    );
  }

  private shouldToast(req: HttpRequest<unknown>, error: unknown): boolean {
    if (req.context.get(SKIP_GLOBAL_ERROR_TOAST)) {
      return false;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    return error.status === 0 || error.status >= 500;
  }
}
