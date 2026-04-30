import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { Conversation, MockDataService } from '../../../../shared/services/mock-data.service';
import { formatPrice, shortLocation } from '../../../listings/models/listing.helpers';
import { ListingResponse } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, MessageModule, Avatar, EmptyState, PhotoPlaceholder],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss'
})
export class MessagesPage implements OnInit {
  private readonly router = inject(Router);
  private readonly listingService = inject(ListingService);
  private readonly mocks = inject(MockDataService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly listings = signal<ListingResponse[]>([]);
  readonly threads = signal<Conversation[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly draft = signal('');

  readonly selected = computed(() => this.threads().find(t => t.threadId === this.selectedId()) ?? null);

  readonly selectedListing = computed(() => {
    const t = this.selected();
    if (!t) return null;
    return this.listings().find(l => l.id === t.listingId) ?? null;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.listingService.getFeatured().subscribe({
      next: items => {
        this.listings.set(items ?? []);
        const threads = this.mocks.getConversations(items ?? []);
        this.threads.set(threads);
        this.selectedId.set(threads[0]?.threadId ?? null);
        this.loading.set(false);
      },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  send(): void {
    const text = this.draft().trim();
    const t = this.selected();
    if (!text || !t) return;
    t.messages.push({ from: 'me', at: new Date().toISOString(), text });
    t.preview = text;
    t.lastAt = new Date().toISOString();
    this.threads.set([...this.threads()]);
    this.draft.set('');
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  formatPrice = formatPrice;
  shortLocation = shortLocation;

  private toMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const m = error as { error?: { message?: string }; message?: string; status?: number };
      return m.error?.message ?? m.message ?? (m.status ? `Request failed with status ${m.status}.` : 'Unexpected error.');
    }
    return 'Unexpected error.';
  }
}
