import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ListingSearchPageComponent } from './features/listings/pages/listing-search-page/listing-search-page.component';
import { ListingCreatePageComponent } from './features/listings/pages/listing-create-page/listing-create-page.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { isOwnerGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'listings', component: ListingSearchPageComponent },
  { path: 'listings/create', component: ListingCreatePageComponent, canActivate: [isOwnerGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
