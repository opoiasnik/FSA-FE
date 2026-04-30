import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateListingRequest, ListingResponse, ListingSearchParams, ListingSearchResponse, ListingType, PropertyType } from '../models/listing.model';

export interface FeaturedListingsParams {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly http = inject(HttpClient);

  getFeatured(params?: FeaturedListingsParams): Observable<ListingResponse[]> {
    let httpParams = new HttpParams();
    if (params?.city) httpParams = httpParams.set('city', params.city);
    if (params?.listingType) httpParams = httpParams.set('listingType', params.listingType);
    if (params?.propertyType) httpParams = httpParams.set('propertyType', params.propertyType);
    return this.http.get<ListingResponse[]>(`${environment.apiBaseUrl}/featured`, { params: httpParams });
  }

  search(params: ListingSearchParams): Observable<ListingSearchResponse> {
    let httpParams = new HttpParams();
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.listingType) httpParams = httpParams.set('listingType', params.listingType);
    if (params.propertyType) httpParams = httpParams.set('propertyType', params.propertyType);
    if (params.priceMin != null) httpParams = httpParams.set('priceMin', params.priceMin);
    if (params.priceMax != null) httpParams = httpParams.set('priceMax', params.priceMax);
    httpParams = httpParams.set('page', params.page ?? 0);
    httpParams = httpParams.set('size', params.size ?? 10);
    return this.http.get<ListingSearchResponse>(environment.apiBaseUrl, { params: httpParams });
  }

  getById(id: number): Observable<ListingResponse> {
    return this.http.get<ListingResponse>(`${environment.apiBaseUrl}/${id}`);
  }

  create(payload: CreateListingRequest): Observable<ListingResponse> {
    return this.http.post<ListingResponse>(environment.apiBaseUrl, payload);
  }
}
