import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home-page/home-page';
import { ListingSearchPageComponent } from './features/listings/pages/listing-search-page/listing-search-page.component';
import { ListingDetailPage } from './features/listings/pages/listing-detail-page/listing-detail-page';
import { ListingCreatePageComponent } from './features/listings/pages/listing-create-page/listing-create-page.component';
import { FavouritesPage } from './features/favourites/pages/favourites-page/favourites-page';
import { MessagesPage } from './features/messages/pages/messages-page/messages-page';
import { ProfilePage } from './features/profile/pages/profile-page/profile-page';
import { OwnerDashboardPage } from './features/owner/pages/owner-dashboard-page/owner-dashboard-page';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { isOwnerGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'listings', component: ListingSearchPageComponent },
  { path: 'listings/create', component: ListingCreatePageComponent, canActivate: [isOwnerGuard] },
  { path: 'listings/:id', component: ListingDetailPage },
  { path: 'favourites', component: FavouritesPage },
  { path: 'messages', component: MessagesPage },
  { path: 'profile', component: ProfilePage },
  { path: 'owner', component: OwnerDashboardPage, canActivate: [isOwnerGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
