import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface OwnerStats {
  activeListings: number;
  savedByUsers: number;
  pendingViewingRequests: number;
  totalViews: number;
  viewsTrend: number[];
}

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private readonly api = inject(ApiService);

  getStats(): Observable<OwnerStats> {
    return this.api.get<OwnerStats>('/owner/stats');
  }
}
