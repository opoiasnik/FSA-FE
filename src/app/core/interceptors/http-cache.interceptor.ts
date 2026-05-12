import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const TTL_MS = 2 * 60 * 1000; // 2 minutes

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  private readonly cache = new Map<string, CacheEntry>();

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cached = this.cache.get(req.urlWithParams);
    if (cached && Date.now() < cached.expiresAt) {
      return of(cached.response.clone());
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.urlWithParams, {
            response: event.clone(),
            expiresAt: Date.now() + TTL_MS
          });
        }
      })
    );
  }
}
