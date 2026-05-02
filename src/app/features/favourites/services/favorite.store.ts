import { Injectable, computed, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FavoriteResponse, FavoriteService } from './favorite.service';

@Injectable({ providedIn: 'root' })
export class FavoriteStore {
  private readonly favoriteService = inject(FavoriteService);
  private readonly userService = inject(UserService);

  private readonly _items = signal<FavoriteResponse[]>([]);
  private readonly _loaded = signal(false);

  readonly items = this._items.asReadonly();
  readonly favoriteListingIds = computed(() => new Set(this._items().map(f => f.listing.id)));

  loadIfNeeded(): void {
    if (this._loaded() || !this.userService.isUserLoggedIn()) return;
    this.favoriteService.getMy().subscribe({
      next: items => { this._items.set(items); this._loaded.set(true); },
      error: () => this._loaded.set(true)
    });
  }

  reload(): void {
    this._loaded.set(false);
    this.loadIfNeeded();
  }

  isFavorite(listingId: number): boolean {
    return this.favoriteListingIds().has(listingId);
  }

  toggle(listingId: number): void {
    if (this.isFavorite(listingId)) {
      this.favoriteService.remove(listingId).subscribe({
        next: () => this._items.update(list => list.filter(f => f.listing.id !== listingId))
      });
    } else {
      this.favoriteService.add(listingId).subscribe({
        next: created => this._items.update(list => [...list, created])
      });
    }
  }
}
