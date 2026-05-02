import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ViewingRequestResponse, ViewingService } from '../../services/viewing.service';

@Component({
  selector: 'app-viewings-page',
  standalone: true,
  imports: [CommonModule, DatePipe, MessageModule, SkeletonModule],
  templateUrl: './viewings-page.html',
  styleUrl: './viewings-page.scss'
})
export class ViewingsPage implements OnInit {
  private readonly router = inject(Router);
  private readonly viewingService = inject(ViewingService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<ViewingRequestResponse[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.viewingService.getMy().subscribe({
      next: items => { this.items.set(items ?? []); this.loading.set(false); },
      error: err => { this.error.set(this.errorHandler.toMessage(err)); this.loading.set(false); }
    });
  }

  cancel(id: number): void {
    this.viewingService.cancel(id).subscribe({
      next: updated => this.items.update(list => list.map(v => v.id === id ? updated : v)),
      error: err => this.error.set(this.errorHandler.toMessage(err))
    });
  }

  open(listingId: number): void {
    void this.router.navigate(['/listings', listingId]);
  }
}
