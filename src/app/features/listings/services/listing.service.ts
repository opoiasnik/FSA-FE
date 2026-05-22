import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ImageContentService } from '../../../core/services/image-content.service';
import { CreateListingRequest, ListingResponse, ListingSearchParams, ListingSearchResponse, ListingSummary, ListingType, PhotoResponse, PropertyType } from '../models/listing.model';

export interface FeaturedListingsParams {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly api  = inject(ApiService);
  private readonly imageContentService = inject(ImageContentService);
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

  update(id: number, payload: CreateListingRequest): Observable<ListingResponse> {
    return this.api.put<ListingResponse>(`${this.base}/${id}`, payload);
  }

  activate(id: number): Observable<ListingResponse> {
    return this.api.patch<ListingResponse>(`${this.base}/${id}/activate`);
  }

  deactivate(id: number): Observable<ListingResponse> {
    return this.api.patch<ListingResponse>(`${this.base}/${id}/deactivate`);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }

  uploadPhoto(listingId: number, file: File, altText?: string): Observable<PhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }
    return this.api.post<PhotoResponse>(`${this.base}/${listingId}/photos`, formData);
  }

  loadPhotoObjectUrl(contentUrl: string): Observable<string> {
    return this.imageContentService.loadObjectUrl(contentUrl);
  }

  revokePhotoObjectUrl(objectUrl: string | null | undefined): void {
    this.imageContentService.revokeObjectUrl(objectUrl);
  }

  recordView(listingId: number): Observable<void> {
    return this.api.post<void>(`${this.base}/${listingId}/view`, {});
  }
}
