import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateListingRequest, ListingResponse } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<unknown> {
    return this.http.get<unknown>(environment.apiBaseUrl).pipe(
      catchError(() => this.http.get<unknown>(`${environment.apiBaseUrl}/all`)),
      catchError(() => this.http.get<unknown>(`${environment.apiBaseUrl}/active`)),
      catchError(() => this.http.get<unknown>(`${environment.apiBaseUrl}/search`))
    );
  }

  getById(id: number): Observable<ListingResponse> {
    return this.http.get<ListingResponse>(`${environment.apiBaseUrl}/${id}`);
  }

  create(payload: CreateListingRequest): Observable<ListingResponse> {
    return this.http.post<ListingResponse>(environment.apiBaseUrl, payload);
  }
}
