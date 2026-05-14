import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ImageContentService {
  private readonly api = inject(ApiService);

  loadObjectUrl(contentUrl: string): Observable<string> {
    return this.api.getBlob(contentUrl).pipe(
      map(blob => URL.createObjectURL(blob)),
    );
  }

  revokeObjectUrl(objectUrl: string | null | undefined): void {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
