import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { MessageService as ToastService } from 'primeng/api';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ImageContentService } from '../../../../core/services/image-content.service';
import { ListingService } from '../../../listings/services/listing.service';
import { MessageConversation } from '../../components/message-conversation/message-conversation';
import { MessageListingPreview } from '../../components/message-listing-preview/message-listing-preview';
import { MessageThreadList } from '../../components/message-thread-list/message-thread-list';
import { ConversationResponse } from '../../models/message.model';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, MessageModule, MessageThreadList, MessageConversation, MessageListingPreview],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss'
})
export class MessagesPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly listingService = inject(ListingService);
  private readonly imageContentService = inject(ImageContentService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly toast = inject(ToastService);
  private photoObjectUrls: string[] = [];
  private avatarObjectUrls: string[] = [];

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly threads = signal<ConversationResponse[]>([]);
  readonly listingPhotoUrls = signal<Record<number, string>>({});
  readonly peerAvatarUrls = signal<Record<number, string>>({});
  readonly selectedId = signal<number | null>(null);

  readonly selected = computed(() => this.threads().find(thread => thread.id === this.selectedId()) ?? null);
  readonly selectedListing = computed(() => this.selected()?.listing ?? null);
  readonly selectedListingPhotoUrl = computed(() => {
    const listing = this.selectedListing();
    return listing ? this.listingPhotoUrls()[listing.id] ?? null : null;
  });

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.revokeListingPhotoObjectUrls();
    this.revokePeerAvatarObjectUrls();
  }

  loadConversations(): void {
    this.loading.set(true);
    this.error.set(null);
    this.messageService.getConversations().subscribe({
      next: conversations => {
        const threads = conversations ?? [];
        this.threads.set(threads);
        this.selectedId.set(this.resolveSelectedId(threads));
        this.loadListingPhotoContents(threads);
        this.loadPeerAvatarContents(threads);
        this.loading.set(false);
        this.markSelectedRead();
      },
      error: err => {
        this.error.set(this.toMessage(err));
        this.loading.set(false);
      }
    });
  }

  select(id: number): void {
    this.selectedId.set(id);
    void this.router.navigate(['/messages', id]);
    this.markSelectedRead();
  }

  send(text: string): void {
    const thread = this.selected();
    if (!text || !thread || this.sending()) return;

    this.sending.set(true);
    this.messageService.sendMessage(thread.id, { text }).subscribe({
      next: message => {
        const updated: ConversationResponse = {
          ...thread,
          messages: [...thread.messages, message],
          preview: message.text,
          updatedAt: message.sentAt
        };
        this.threads.set(this.threads()
          .map(item => item.id === updated.id ? updated : item)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        this.selectedId.set(updated.id);
        this.sending.set(false);
        this.toast.add({
          severity: 'success',
          summary: 'Message sent',
          detail: 'Your message was added to the conversation.'
        });
      },
      error: err => {
        const detail = this.toMessage(err);
        this.error.set(detail);
        this.toast.add({
          severity: 'error',
          summary: 'Message not sent',
          detail
        });
        this.sending.set(false);
      }
    });
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  private loadListingPhotoContents(conversations: ConversationResponse[]): void {
    this.revokeListingPhotoObjectUrls();
    this.listingPhotoUrls.set({});

    for (const conversation of conversations) {
      const listing = conversation.listing;
      const contentUrl = listing.coverPhoto?.contentUrl;
      if (!contentUrl) continue;

      this.listingService.loadPhotoObjectUrl(contentUrl).subscribe({
        next: objectUrl => {
          this.photoObjectUrls.push(objectUrl);
          this.listingPhotoUrls.update(urls => ({ ...urls, [listing.id]: objectUrl }));
        },
        error: () => {}
      });
    }
  }

  private revokeListingPhotoObjectUrls(): void {
    this.photoObjectUrls.forEach(url => this.listingService.revokePhotoObjectUrl(url));
    this.photoObjectUrls = [];
  }

  private loadPeerAvatarContents(conversations: ConversationResponse[]): void {
    this.revokePeerAvatarObjectUrls();
    this.peerAvatarUrls.set({});

    for (const conversation of conversations) {
      const avatarUrl = conversation.peer.avatarUrl;
      if (!avatarUrl) continue;

      this.imageContentService.loadObjectUrl(avatarUrl).subscribe({
        next: objectUrl => {
          this.avatarObjectUrls.push(objectUrl);
          this.peerAvatarUrls.update(urls => ({ ...urls, [conversation.peer.id]: objectUrl }));
        },
        error: () => {}
      });
    }
  }

  private revokePeerAvatarObjectUrls(): void {
    this.avatarObjectUrls.forEach(url => this.imageContentService.revokeObjectUrl(url));
    this.avatarObjectUrls = [];
  }

  private resolveSelectedId(threads: ConversationResponse[]): number | null {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isFinite(routeId) && threads.some(thread => thread.id === routeId)) {
      return routeId;
    }
    return threads[0]?.id ?? null;
  }

  private markSelectedRead(): void {
    const id = this.selectedId();
    if (!id) return;

    this.messageService.markRead(id).subscribe({
      next: conversation => {
        this.threads.set(this.threads().map(thread => thread.id === id ? conversation : thread));
      },
      error: () => {}
    });
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
