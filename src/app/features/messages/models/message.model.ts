import { ListingSummary } from '../../listings/models/listing.model';

export interface ConversationUser {
  id: number;
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  bio?: string;
  role: 'OWNER' | 'USER';
  avatarUrl?: string;
}

export interface MessageResponse {
  id: number;
  sender: ConversationUser;
  text: string;
  sentAt: string;
  readAt?: string;
  ownMessage: boolean;
}

export interface ConversationResponse {
  id: number;
  listing: ListingSummary;
  peer: ConversationUser;
  createdAt?: string;
  updatedAt: string;
  unreadCount: number;
  preview?: string;
  messages: MessageResponse[];
}

export interface CreateConversationRequest {
  listingId: number;
  initialMessage?: string;
}

export interface SendMessageRequest {
  text: string;
}
