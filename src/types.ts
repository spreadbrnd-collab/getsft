export interface Property {
  property_id: number;
  owner_id: string; // The realtor's username or id (e.g., 'david')
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // square feet (SFT)
  propertyType: 'Penthouse' | 'Villa' | 'Estate' | 'Townhouse' | 'Apartment';
  amenities: string[];
  address: string;
  city: string;
  province: string;
  postalCode: string;
  images: string[];
  openHouseDate?: string;
  status: 'Active' | 'Pending' | 'Sold';
  show_on_profile: boolean;
  show_on_marketplace: boolean;
  listingIntent?: 'Buy' | 'Rent'; // Buy or Rent
  monthlyRentEstimate?: number; // Estimated or actual monthly rent
  highlights?: string[]; // Project highlights
  builderName?: string; // Developer / Builder
  builderDescription?: string; // Developer / Builder bio or info
  reraId?: string; // RERA registration number
  possessionDate?: string; // Possession date, e.g. "Mar, 2030"
  projectSize?: string; // e.g. "5 Buildings - 1189 units"
  projectAreaCount?: string; // e.g. "7.34 Acres"
  bhkConfig?: string; // e.g. "3.5, 4, 4.5 BHK Apartments"
  avgPricePerSft?: string; // e.g. "₹11.5 K/sq.ft" or "11.5 K/sft"
  landmarks?: {
    school?: string;
    metro?: string;
    hospital?: string;
    mall?: string;
    restaurant?: string;
  };
}

export interface Realtor {
  id: string; // username e.g. 'david'
  name: string;
  title: string;
  profileImage: string;
  coverImage: string;
  city: string;
  phone: string;
  whatsapp: string;
  bio: string;
  experience: number; // years
  languages: string[];
  specializations: string[];
  template: 'Luxury' | 'Minimal' | 'Modern' | 'Vintage' | 'Oasis' | 'Techno' | 'Bauhaus' | 'Nordic' | 'Neon';
  customDomain?: string;
}

export interface Inquiry {
  id: string;
  property_id: number;
  property_title: string;
  realtor_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status?: 'New' | 'Called' | 'Interested' | 'Not Interested' | 'No Answer';
  remarksHistory?: { date: string; text: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'realtor';
  savedPropertyIds: number[];
  realtorProfile?: Realtor;
}

export type ActiveTab = 
  | 'overview'
  | 'listings'
  | 'leads'
  | 'website'
  | 'templates'
  | 'analytics'
  | 'settings'
  | 'billing';
