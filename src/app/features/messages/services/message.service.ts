import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ConversationResponse, CreateConversationRequest, MessageResponse, SendMessageRequest } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly api = inject(ApiService);
  private readonly base = '/conversations';

  getConversations(): Observable<ConversationResponse[]> {
    return this.api.get<ConversationResponse[]>(this.base);
  }

  openConversation(payload: CreateConversationRequest): Observable<ConversationResponse> {
    return this.api.post<ConversationResponse>(this.base, payload);
  }

  getConversation(id: number): Observable<ConversationResponse> {
    return this.api.get<ConversationResponse>(`${this.base}/${id}`);
  }

  sendMessage(conversationId: number, payload: SendMessageRequest): Observable<MessageResponse> {
    return this.api.post<MessageResponse>(`${this.base}/${conversationId}/messages`, payload);
  }

  markRead(conversationId: number): Observable<ConversationResponse> {
    return this.api.patch<ConversationResponse>(`${this.base}/${conversationId}/read`);
  }
}
