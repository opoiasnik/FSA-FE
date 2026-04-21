import { ListingResponse } from './listing.model';

export function fullAddress(listing: ListingResponse): string {
  const a = listing.address;
  return [a.street, a.district, a.city].filter(Boolean).join(', ');
}

export function shortLocation(listing: ListingResponse): string {
  const a = listing.address;
  return [a.district, a.city].filter(Boolean).join(', ');
}

export function formatPrice(listing: ListingResponse): string {
  const suffix = listing.listingType === 'RENT' ? ' / mo' : '';
  return new Intl.NumberFormat('sk-SK').format(listing.price.amount) + ' €' + suffix;
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('sk-SK').format(amount) + ' €';
}
