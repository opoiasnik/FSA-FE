import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { ConversationResponse } from '../../models/message.model';

@Component({
  selector: 'app-message-thread-list',
  standalone: true,
  imports: [CommonModule, DatePipe, Avatar, EmptyState],
  templateUrl: './message-thread-list.html',
  styleUrls: ['./message-thread-list.scss']
})
export class MessageThreadList {
  @Input() threads: ConversationResponse[] = [];
  @Input() selectedId: number | null = null;
  @Input() avatarUrls: Record<number, string> = {};
  @Output() selected = new EventEmitter<number>();

  peerName(conversation: ConversationResponse): string {
    return `${conversation.peer.name} ${conversation.peer.surname ?? ''}`.trim();
  }
}
