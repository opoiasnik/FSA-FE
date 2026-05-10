import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateListingRequest, ListingResponse, ListingSearchParams, ListingSearchResponse, ListingSummary, ListingType, PropertyType } from '../models/listing.model';

export interface FeaturedListingsParams {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly api  = inject(ApiService);
  private readonly base = '/listings';

  getFeatured(params?: FeaturedListingsParams): Observable<ListingSummary[]> {
    return this.api.get<ListingSummary[]>(`${this.base}/featured`, { ...params });
  }

  search(params: ListingSearchParams): Observable<ListingSearchResponse> {
    return this.api.get<ListingSearchResponse>(this.base, {
      ...params,
      page: params.page ?? 0,
      size: params.size ?? 10,
    });
  }

  getMy(): Observable<ListingResponse[]> {
    return this.api.get<ListingResponse[]>(`${this.base}/my`);
  }

  getById(id: number): Observable<ListingResponse> {
    return this.api.get<ListingResponse>(`${this.base}/${id}`);
  }

  create(payload: CreateListingRequest): Observable<ListingResponse> {
    return this.api.post<ListingResponse>(this.base, payload);
  }
}
