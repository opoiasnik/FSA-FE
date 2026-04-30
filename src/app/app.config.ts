import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';
import { importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DefaultOAuthInterceptor, OAuthModule } from 'angular-oauth2-oidc';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { UserService } from './core/services/user.service';

function initializeAuth(userService: UserService): () => Promise<unknown> {
  return () => userService.tryLogin().catch(() => undefined);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura
      }
    }),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      OAuthModule.forRoot({
        resourceServer: {
          sendAccessToken: true,
          allowedUrls: ['/api']
        }
      })
    ),
    { provide: HTTP_INTERCEPTORS, useClass: DefaultOAuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [UserService],
      multi: true
    },
    MessageService
  ]
};
