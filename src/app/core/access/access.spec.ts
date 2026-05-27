import { describe, expect, it } from 'vitest';
import { AccessAction, canAccess } from './access';

describe('canAccess', () => {
  const ownerOnlyActions: AccessAction[] = [
    'createListing',
    'editListing',
    'deleteListing',
    'activateListing',
    'deactivateListing',
    'viewOwnerStudio',
    'manageViewingRequests',
    'viewOwnerNotificationSettings'
  ];

  const authenticatedActions: AccessAction[] = [
    'viewFavorites',
    'viewViewings',
    'viewMessages',
    'viewSentViewingRequests',
    'saveFavorite',
    'bookViewing',
    'sendMessage',
    'viewProfile',
    'viewUserNotificationSettings',
    'viewListingDetails',
    'viewListingStats',
    'searchListings'
  ];

  it.each(ownerOnlyActions)('allows OWNER to %s', action => {
    expect(canAccess(action, 'OWNER')).toBe(true);
  });

  it.each(ownerOnlyActions)('denies USER access to owner action %s', action => {
    expect(canAccess(action, 'USER')).toBe(false);
  });

  it.each(authenticatedActions)('allows USER and OWNER to %s', action => {
    expect(canAccess(action, 'USER')).toBe(true);
    expect(canAccess(action, 'OWNER')).toBe(true);
  });

  it('denies missing or unknown roles', () => {
    expect(canAccess('searchListings', null)).toBe(false);
    expect(canAccess('searchListings', undefined)).toBe(false);
    expect(canAccess('searchListings', 'ADMIN')).toBe(false);
  });
});
