import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ListingSummary } from '../../listings/models/listing.model';

export interface FavoriteResponse {
  id: number;
  listing: ListingSummary;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/favorites';

  getMy(): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(this.baseUrl);
  }

  add(listingId: number): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(`${this.baseUrl}/${listingId}`, {});
  }

  remove(listingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${listingId}`);
  }
}
