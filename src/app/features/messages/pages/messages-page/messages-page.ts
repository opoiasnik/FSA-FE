import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { PhotoPlaceholder } from '../../../../shared/component/photo-placeholder/photo-placeholder';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ImageContentService } from '../../../../core/services/image-content.service';
import { ListingSummary } from '../../../listings/models/listing.model';
import { ListingService } from '../../../listings/services/listing.service';
import { ConversationResponse, MessageResponse } from '../../models/message.model';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, MessageModule, Avatar, EmptyState, PhotoPlaceholder],
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
  private photoObjectUrls: string[] = [];
  private avatarObjectUrls: string[] = [];

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly threads = signal<ConversationResponse[]>([]);
  readonly listingPhotoUrls = signal<Record<number, string>>({});
  readonly peerAvatarUrls = signal<Record<number, string>>({});
  readonly selectedId = signal<number | null>(null);
  readonly draft = signal('');

  readonly selected = computed(() => this.threads().find(thread => thread.id === this.selectedId()) ?? null);
  readonly selectedListing = computed(() => this.selected()?.listing ?? null);

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

  send(): void {
    const text = this.draft().trim();
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
        this.draft.set('');
        this.sending.set(false);
      },
      error: err => {
        this.error.set(this.toMessage(err));
        this.sending.set(false);
      }
    });
  }

  openListing(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  trackMessage(_: number, message: MessageResponse): number {
    return message.id;
  }

  formatPrice(listing: ListingSummary): string {
    const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
    return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' EUR' + suffix;
  }

  shortLocation(listing: ListingSummary): string {
    return listing.city;
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

  peerName(conversation: ConversationResponse): string {
    return `${conversation.peer.name} ${conversation.peer.surname ?? ''}`.trim();
  }

  peerRole(conversation: ConversationResponse): string {
    return conversation.peer.role === 'OWNER' ? 'Private owner' : 'User';
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
