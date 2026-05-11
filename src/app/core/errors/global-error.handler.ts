import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../services/error-handler.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private readonly formatter: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly zone: NgZone,
  ) {}

  handleError(error: unknown): void {
    console.error(error);

    this.zone.run(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected error',
        detail: this.formatter.toMessage(error),
        life: 5000,
      });
    });
  }
}
