import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { ConversationResponse, MessageResponse } from '../../models/message.model';

@Component({
  selector: 'app-message-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, Avatar, EmptyState],
  templateUrl: './message-conversation.html',
  styleUrls: ['./message-conversation.scss']
})
export class MessageConversation {
  @Input() conversation: ConversationResponse | null = null;
  @Input() avatarUrls: Record<number, string> = {};
  @Input() sending = false;
  @Output() sent = new EventEmitter<string>();

  readonly draft = signal('');

  send(): void {
    const text = this.draft().trim();
    if (!text || this.sending) return;
    this.sent.emit(text);
    this.draft.set('');
  }

  trackMessage(_: number, message: MessageResponse): number {
    return message.id;
  }

  peerName(conversation: ConversationResponse): string {
    return `${conversation.peer.name} ${conversation.peer.surname ?? ''}`.trim();
  }

  peerRole(conversation: ConversationResponse): string {
    return conversation.peer.role === 'OWNER' ? 'Private owner' : 'User';
  }
}
