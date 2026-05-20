import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyState } from '../../../../shared/component/empty-state/empty-state';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ListingSummary } from '../../../listings/models/listing.model';
import { FavouriteListingCard } from '../../components/favourite-listing-card/favourite-listing-card';
import { FavoriteService } from '../../services/favorite.service';
import { FavoriteStore } from '../../services/favorite.store';

type Tab = 'ALL' | 'RENT' | 'SALE';

@Component({
  selector: 'app-favourites-page',
  standalone: true,
  imports: [CommonModule, MessageModule, SkeletonModule, EmptyState, FavouriteListingCard],
  templateUrl: './favourites-page.html',
  styleUrl: './favourites-page.scss'
})
export class FavouritesPage implements OnInit {
  private readonly router = inject(Router);
  private readonly favoriteService = inject(FavoriteService);
  private readonly favoriteStore = inject(FavoriteStore);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tab = signal<Tab>('ALL');

  readonly saved = computed<ListingSummary[]>(() => this.favoriteStore.items().map(f => f.listing));

  readonly filtered = computed(() => {
    const t = this.tab();
    if (t === 'ALL') return this.saved();
    return this.saved().filter(l => l.listingType === t);
  });

  readonly counts = computed(() => {
    const s = this.saved();
    return {
      ALL: s.length,
      RENT: s.filter(l => l.listingType === 'RENT').length,
      SALE: s.filter(l => l.listingType === 'SALE').length
    };
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.favoriteService.getMy().subscribe({
      next: () => { this.favoriteStore.reload(); this.loading.set(false); },
      error: err => { this.error.set(this.toMessage(err)); this.loading.set(false); }
    });
  }

  open(id: number): void {
    void this.router.navigate(['/listings', id]);
  }

  remove(id: number): void {
    this.favoriteStore.toggle(id);
  }

  browse(): void {
    void this.router.navigate(['/listings']);
  }

  private toMessage(error: unknown): string {
    return this.errorHandler.toMessage(error);
  }
}
