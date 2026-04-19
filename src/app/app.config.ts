import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DefaultOAuthInterceptor, OAuthModule } from 'angular-oauth2-oidc';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      OAuthModule.forRoot({
        resourceServer: {
          sendAccessToken: true,
          allowedUrls: ['/api']
        }
      })
    ),
    { provide: HTTP_INTERCEPTORS, useClass: DefaultOAuthInterceptor, multi: true }
  ]
};
