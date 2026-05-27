import { describe, expect, it } from 'vitest';
import { ListingResponse } from './listing.model';
import { formatAmount, formatPrice, fullAddress, shortLocation } from './listing.helpers';

describe('listing helpers', () => {
  const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

  const listing: ListingResponse = {
    id: 10,
    title: 'City apartment',
    description: 'Bright apartment near center',
    listingType: 'RENT',
    status: 'ACTIVE',
    createdAt: '2026-05-27T10:00:00Z',
    ownerId: 1,
    address: {
      street: 'Hlavna 1',
      district: 'Old Town',
      city: 'Kosice',
      postalCode: '04001',
      country: 'Slovakia'
    },
    price: {
      amount: 1250,
      currency: 'EUR'
    },
    features: {
      propertyType: 'APARTMENT',
      area: 65
    }
  };

  it('builds full address from street, district and city', () => {
    expect(fullAddress(listing)).toBe('Hlavna 1, Old Town, Kosice');
  });

  it('builds short location from district and city', () => {
    expect(shortLocation(listing)).toBe('Old Town, Kosice');
  });

  it('skips missing address parts cleanly', () => {
    const withoutDistrict = {
      ...listing,
      address: { ...listing.address, district: undefined }
    };

    expect(fullAddress(withoutDistrict)).toBe('Hlavna 1, Kosice');
    expect(shortLocation(withoutDistrict)).toBe('Kosice');
  });

  it('formats rent prices with monthly suffix', () => {
    expect(normalizeSpaces(formatPrice(listing))).toBe('1 250 € / mo');
  });

  it('formats sale prices without monthly suffix', () => {
    expect(normalizeSpaces(formatPrice({ ...listing, listingType: 'SALE' }))).toBe('1 250 €');
  });

  it('formats standalone amounts', () => {
    expect(normalizeSpaces(formatAmount(50000))).toBe('50 000 €');
  });
});
