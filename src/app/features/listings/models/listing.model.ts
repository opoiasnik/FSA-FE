export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface PropertyFeatures {
  propertyType: 'APARTMENT' | 'HOUSE' | 'ROOM';
  area?: number | null;
  roomCount?: number | null;
  floor?: number | null;
  furnished?: boolean;
  parkingAvailable?: boolean;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  listingType: 'RENT' | 'SALE';
  address: Address;
  price: Price;
  features: PropertyFeatures;
}

export interface ListingResponse extends CreateListingRequest {
  id: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  ownerId: number;
}
