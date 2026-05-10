import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ListingSummary } from '../../listings/models/listing.model';

export type ViewingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ViewingUser {
  id?: number;
  name: string;
  email: string;
  role: 'OWNER' | 'USER';
}

export interface ViewingRequestResponse {
  id: number;
  listing: ListingSummary;
  requester?: ViewingUser;
  owner?: ViewingUser;
  status: ViewingStatus;
  requestedDate: string;
  note?: string;
}

export interface CreateViewingRequest {
  listingId: number;
  requestedDate: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class ViewingService {
  private readonly api  = inject(ApiService);
  private readonly base = '/viewings';

  create(payload: CreateViewingRequest): Observable<ViewingRequestResponse> {
    return this.api.post<ViewingRequestResponse>(this.base, payload);
  }

  getMy(): Observable<ViewingRequestResponse[]> {
    return this.api.get<ViewingRequestResponse[]>(`${this.base}/my`);
  }

  getOwner(): Observable<ViewingRequestResponse[]> {
    return this.api.get<ViewingRequestResponse[]>(`${this.base}/owner`);
  }

  approve(id: number): Observable<ViewingRequestResponse> {
    return this.api.patch<ViewingRequestResponse>(`${this.base}/${id}/approve`);
  }

  reject(id: number): Observable<ViewingRequestResponse> {
    return this.api.patch<ViewingRequestResponse>(`${this.base}/${id}/reject`);
  }

  cancel(id: number): Observable<ViewingRequestResponse> {
    return this.api.patch<ViewingRequestResponse>(`${this.base}/${id}/cancel`);
  }
}
