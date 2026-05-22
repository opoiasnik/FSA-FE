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
export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

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
  saves?: number;
  messages?: number;
}

export interface PhotoResponse {
  id: number;
  altText?: string;
  contentType?: string;
  originalFilename?: string;
  position?: number;
  contentUrl: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  listingType: ListingType;
  address: Address;
  price: Price;
  features: PropertyFeatures;
}

export interface ListingOwner {
  id?: number;
  name: string;
  surname?: string | null;
  email: string;
  phone?: string | null;
  role: 'OWNER' | 'USER';
  avatarUrl?: string | null;
}

export interface ListingResponse extends CreateListingRequest {
  id: number;
  status: ListingStatus;
  createdAt: string;
  ownerId: number;
  owner?: ListingOwner;
  photos?: PhotoResponse[];
  stats?: ListingStats;
}

export interface ListingSummary {
  id: number;
  title: string;
  listingType: ListingType;
  status?: ListingStatus;
  city: string;
  price: Price;
  coverPhoto?: PhotoResponse;
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

export type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc';
export type EnergyClass = 'A' | 'B' | 'C' | 'D';

export interface ListingSearchParams {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  roomCount?: number;
  areaMin?: number;
  areaMax?: number;
  furnished?: boolean;
  parkingAvailable?: boolean;
  balcony?: boolean;
  petsAllowed?: boolean;
  energyClass?: EnergyClass;
  sortBy?: SortBy;
  page?: number;
  size?: number;
}
