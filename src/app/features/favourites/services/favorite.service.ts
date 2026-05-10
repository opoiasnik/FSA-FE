import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ListingSummary } from '../../listings/models/listing.model';

export interface FavoriteResponse {
  id: number;
  listing: ListingSummary;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly api  = inject(ApiService);
  private readonly base = '/favorites';

  getMy(): Observable<FavoriteResponse[]> {
    return this.api.get<FavoriteResponse[]>(this.base);
  }

  add(listingId: number): Observable<FavoriteResponse> {
    return this.api.post<FavoriteResponse>(`${this.base}/${listingId}`);
  }

  remove(listingId: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${listingId}`);
  }
}
