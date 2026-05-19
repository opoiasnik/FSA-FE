import { Routes } from '@angular/router';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { HomePage } from './features/home/pages/home-page/home-page';
import { ListingSearchPage } from './features/listings/pages/listing-search-page/listing-search-page';
import { ListingDetailPage } from './features/listings/pages/listing-detail-page/listing-detail-page';
import { ListingCreatePage } from './features/listings/pages/listing-create-page/listing-create-page';
import { FavouritesPage } from './features/favourites/pages/favourites-page/favourites-page';
import { MessagesPage } from './features/messages/pages/messages-page/messages-page';
import { ProfilePage } from './features/profile/pages/profile-page/profile-page';
import { OwnerDashboardPage } from './features/owner/pages/owner-dashboard-page/owner-dashboard-page';
import { PageNotFound } from './features/page-not-found/page-not-found';
import { ViewingsPage } from './features/viewings/pages/viewings-page/viewings-page';
import { isLoggedInWithToastGuard, isOwnerGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'listings', component: ListingSearchPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'listings/create', component: ListingCreatePage, canActivate: [isOwnerGuard] },
  { path: 'listings/:id', component: ListingDetailPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'favourites', component: FavouritesPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'viewings', component: ViewingsPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'messages', component: MessagesPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'messages/:id', component: MessagesPage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [isLoggedInWithToastGuard] },
  { path: 'owner', component: OwnerDashboardPage, canActivate: [isOwnerGuard] },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFound }
];
