import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/viewings';

  create(payload: CreateViewingRequest): Observable<ViewingRequestResponse> {
    return this.http.post<ViewingRequestResponse>(this.baseUrl, payload);
  }

  getMy(): Observable<ViewingRequestResponse[]> {
    return this.http.get<ViewingRequestResponse[]>(`${this.baseUrl}/my`);
  }

  getOwner(): Observable<ViewingRequestResponse[]> {
    return this.http.get<ViewingRequestResponse[]>(`${this.baseUrl}/owner`);
  }

  approve(id: number): Observable<ViewingRequestResponse> {
    return this.http.patch<ViewingRequestResponse>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<ViewingRequestResponse> {
    return this.http.patch<ViewingRequestResponse>(`${this.baseUrl}/${id}/reject`, {});
  }

  cancel(id: number): Observable<ViewingRequestResponse> {
    return this.http.patch<ViewingRequestResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
