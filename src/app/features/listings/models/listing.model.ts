export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  district?: string;
  region?: string;
  lat?: number;
  lng?: number;
}

export interface Price {
  amount: number;
  currency: string;
}

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM';
export type ListingType = 'RENT' | 'SALE';
export type ListingStatus = 'ACTIVE' | 'INACTIVE';

export interface PropertyFeatures {
  propertyType: PropertyType;
  area?: number | null;
  roomCount?: number | null;
  floor?: number | null;
  furnished?: boolean;
  parkingAvailable?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  petsAllowed?: boolean;
  energyClass?: 'A' | 'B' | 'C' | 'D';
  yearBuilt?: number;
}

export interface ListingStats {
  views: number;
  saves: number;
  messages: number;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  listingType: ListingType;
  address: Address;
  price: Price;
  features: PropertyFeatures;
}

export interface ListingResponse extends CreateListingRequest {
  id: number;
  status: ListingStatus;
  createdAt: string;
  ownerId: number;
  stats?: ListingStats;
}

export interface PaginationResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListingSearchResponse {
  content: ListingResponse[];
  pagination: PaginationResponse;
}

export interface ListingSearchParams {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  size?: number;
}
