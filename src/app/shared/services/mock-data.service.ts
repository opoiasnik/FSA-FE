import { Injectable } from '@angular/core';
import { ListingResponse } from '../../features/listings/models/listing.model';

/**
 * Temporary data source for screens whose BE endpoints don't exist yet
 * (favourites, messages, viewings, owner dashboard stats, owner profiles).
 * Replace per-method calls with real HTTP services as BE catches up.
 */

export interface OwnerProfile {
  id: number;
  name: string;
  role: string;
  verified: boolean;
  premium: boolean;
  rating: number;
  responseRate: number;
  avatarHue: number;
}

export interface MessageItem {
  from: 'me' | 'peer';
  at: string;
  text: string;
}

export interface Conversation {
  threadId: string;
  listingId: number;
  peer: OwnerProfile;
  lastAt: string;
  unread: number;
  preview: string;
  messages: MessageItem[];
}

export interface ViewingEntry {
  id: string;
  listingId: number;
  when: string;
  who: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface OwnerStats {
  activeListings: number;
  totalViews: number;
  savedByUsers: number;
  openConversations: number;
  viewsTrend: number[];
}

export interface SavedSearch {
  id: string;
  label: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly owners: OwnerProfile[] = [
    { id: 1, name: 'Zuzana Krajčíová', role: 'Private owner', verified: true, premium: false, rating: 4.9, responseRate: 98, avatarHue: 340 },
    { id: 2, name: 'Adam Horváth', role: 'Agent · Homebase.sk', verified: true, premium: true, rating: 4.8, responseRate: 96, avatarHue: 12 },
    { id: 3, name: 'Pavol Novák', role: 'Private owner', verified: false, premium: false, rating: 4.6, responseRate: 72, avatarHue: 210 },
    { id: 4, name: 'Lenka Dobrá', role: 'Agency · Urbania', verified: true, premium: true, rating: 5.0, responseRate: 100, avatarHue: 140 }
  ];

  private readonly ownerStats: OwnerStats = {
    activeListings: 3,
    totalViews: 1843,
    savedByUsers: 74,
    openConversations: 5,
    viewsTrend: [42, 55, 61, 58, 70, 82, 91, 86, 95, 110, 128, 142, 138, 156]
  };

  private readonly savedSearches: SavedSearch[] = [
    { id: 'ss1', label: '2-izbový, Bratislava, do 1 100 €', count: 14 },
    { id: 'ss2', label: 'Dom, Košice, do 280 000 €', count: 6 }
  ];

  getOwners(): OwnerProfile[] {
    return this.owners;
  }

  getOwner(id: number): OwnerProfile | undefined {
    return this.owners.find(o => o.id === id);
  }

  getOwnerStats(): OwnerStats {
    return this.ownerStats;
  }

  getSavedSearches(): SavedSearch[] {
    return this.savedSearches;
  }

  getConversations(listings: ListingResponse[]): Conversation[] {
    const byIndex = (i: number) => listings[i % Math.max(1, listings.length)];
    return [
      {
        threadId: 't1',
        listingId: byIndex(0)?.id ?? 1,
        peer: this.owners[1],
        lastAt: '2026-04-20T09:41:00Z',
        unread: 2,
        preview: 'Yes — the flat is available from May 15. Would a visit on Friday 17:00 work for you?',
        messages: [
          { from: 'peer', at: '2026-04-18T16:04:00Z', text: 'Hi Martin, thanks for your interest in the riverside loft.' },
          { from: 'me', at: '2026-04-18T18:11:00Z', text: 'Hi Adam — is the flat still available in May? I could move in mid-month.' },
          { from: 'peer', at: '2026-04-20T09:40:00Z', text: 'Yes — the flat is available from May 15.' },
          { from: 'peer', at: '2026-04-20T09:41:00Z', text: 'Would a visit on Friday 17:00 work for you?' }
        ]
      },
      {
        threadId: 't2',
        listingId: byIndex(1)?.id ?? 2,
        peer: this.owners[0],
        lastAt: '2026-04-19T11:12:00Z',
        unread: 0,
        preview: 'The deposit is one month — two months if you bring a dog.',
        messages: [
          { from: 'me', at: '2026-04-19T10:00:00Z', text: 'What is the deposit on this one?' },
          { from: 'peer', at: '2026-04-19T11:12:00Z', text: 'The deposit is one month — two months if you bring a dog.' }
        ]
      },
      {
        threadId: 't3',
        listingId: byIndex(2)?.id ?? 3,
        peer: this.owners[3],
        lastAt: '2026-04-17T14:20:00Z',
        unread: 0,
        preview: 'We can offer a 6-month minimum. Keys handover in person only.',
        messages: [
          { from: 'peer', at: '2026-04-17T14:20:00Z', text: 'We can offer a 6-month minimum. Keys handover in person only.' }
        ]
      }
    ];
  }

  getViewings(listings: ListingResponse[]): ViewingEntry[] {
    const byIndex = (i: number) => listings[i % Math.max(1, listings.length)];
    return [
      { id: 'v1', listingId: byIndex(0)?.id ?? 1, when: 'Fri · Apr 24 · 17:00', who: 'Adam Horváth', status: 'confirmed' },
      { id: 'v2', listingId: byIndex(1)?.id ?? 2, when: 'Mon · Apr 27 · 11:30', who: 'Zuzana Krajčíová', status: 'pending' },
      { id: 'v3', listingId: byIndex(2)?.id ?? 3, when: 'Wed · Apr 29 · 09:00', who: 'Lenka Dobrá', status: 'confirmed' }
    ];
  }

  /** Client-side favourites until BE endpoint exists. */
  private readonly favouriteIds = new Set<number>();

  getFavouriteIds(): Set<number> {
    return new Set(this.favouriteIds);
  }

  toggleFavourite(id: number): boolean {
    if (this.favouriteIds.has(id)) {
      this.favouriteIds.delete(id);
      return false;
    }
    this.favouriteIds.add(id);
    return true;
  }

  isFavourite(id: number): boolean {
    return this.favouriteIds.has(id);
  }
}
