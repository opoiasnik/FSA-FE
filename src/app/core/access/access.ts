import { Injectable, computed, inject } from '@angular/core';
import { UserService } from '../services/user.service';

export type AccessAction =
  | 'createListing'
  | 'editListing'
  | 'deleteListing'
  | 'activateListing'
  | 'deactivateListing'
  | 'viewOwnerStudio'
  | 'viewFavorites'
  | 'viewViewings'
  | 'viewMessages'
  | 'manageViewingRequests'
  | 'viewSentViewingRequests'
  | 'saveFavorite'
  | 'bookViewing'
  | 'sendMessage'
  | 'viewProfile'
  | 'viewOwnerNotificationSettings'
  | 'viewUserNotificationSettings'
  | 'viewListingDetails'
  | 'viewListingStats'
  | 'searchListings';

export type AppRole = 'OWNER' | 'USER';

const rolesAccess: Record<AccessAction, Partial<Record<AppRole, boolean>>> = {
  createListing:      { OWNER: true },
  editListing:        { OWNER: true },
  deleteListing:      { OWNER: true },
  activateListing:    { OWNER: true },
  deactivateListing:  { OWNER: true },
  viewOwnerStudio:    { OWNER: true },
  manageViewingRequests: { OWNER: true },
  viewOwnerNotificationSettings: { OWNER: true },

  viewFavorites:      { OWNER: true, USER: true },
  viewViewings:       { OWNER: true, USER: true },
  viewMessages:       { OWNER: true, USER: true },
  viewSentViewingRequests: { OWNER: true, USER: true },
  saveFavorite:       { OWNER: true, USER: true },
  bookViewing:        { OWNER: true, USER: true },
  sendMessage:        { OWNER: true, USER: true },
  viewProfile:        { OWNER: true, USER: true },
  viewUserNotificationSettings: { OWNER: true, USER: true },
  viewListingDetails: { OWNER: true, USER: true },
  viewListingStats:   { OWNER: true, USER: true },
  searchListings:     { OWNER: true, USER: true }
};


export function canAccess(action: AccessAction, role: string | null | undefined): boolean {
  if (!role) return false;
  return rolesAccess[action]?.[role as AppRole] === true;
}

@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly userService = inject(UserService);

  can(action: AccessAction) {
    return computed(() => {
      const user = this.userService.getUserSignal()();
      if (!user) return false;
      return user.roles.some(role => canAccess(action, role));
    });
  }
}
