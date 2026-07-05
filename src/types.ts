export interface Property {
  property_id: number;
  owner_id: string; // The realtor's username or id (e.g., 'david')
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // square feet (SFT) / Property Size
  propertyType: 'House' | 'Apartment' | 'Condo' | 'Villa' | 'Townhouse' | 'Land' | 'Commercial' | 'Office' | 'Warehouse' | 'Retail' | 'Penthouse' | 'Estate';
  amenities: string[];
  address: string;
  city: string;
  province: string; // State / Province
  postalCode: string; // Postal / ZIP Code
  images: string[];
  openHouseDate?: string;
  status: 'Available' | 'Sold' | 'Rented' | 'Under Contract' | 'Active' | 'Pending'; // Property Status
  show_on_profile: boolean;
  show_on_marketplace: boolean;
  listingIntent?: 'Buy' | 'Rent'; // Listing Type (For Sale / Buy vs For Rent)
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

  // Basic Information
  currency?: string;
  shortDescription?: string;

  // Location
  country?: string;
  areaCommunity?: string;
  googleMapLocation?: string;
  nearbyLandmarksText?: string;

  // Specifications
  kitchens?: number;
  livingRooms?: number;
  diningRooms?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  propertySize?: number; // In sq. ft.
  lotSize?: number; // In sq. ft. or Acres
  yearBuilt?: number;
  propertyCondition?: 'New' | 'Resale' | 'Under Construction';
  furnishedStatus?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

  // Rental & Investment Information
  monthlyRent?: number;
  weeklyRent?: number;
  yearlyRent?: number;
  securityDeposit?: number;
  leaseDuration?: string;
  availableFrom?: string;

  estMonthlyRentalIncome?: number;
  estAnnualRentalIncome?: number;
  grossRentalYield?: number; // %
  estRoi?: number; // %
  propertyTax?: number;
  hoaMaintenanceFee?: number;
  estMonthlyMaintenance?: number;

  // Media
  coverImage?: string;
  videoTour?: string;
  virtualTour360?: string;
  floorPlanImage?: string;
  pdfBrochureUrl?: string;

  // Additional Details
  nearbySchools?: string;
  nearbyHospitals?: string;
  nearbyPublicTransport?: string;
  nearbyShoppingCentres?: string;
  nearbyParks?: string;

  // International Identifiers
  mlsNumber?: string; // Canada / US MLS Number
  internationalRegId?: string; // International Registration ID / License
  councilTaxBand?: string; // UK Council Tax Band (e.g. Band H)
  tenure?: string; // UK Tenure (e.g. Share of Freehold, Leasehold)
  epcRating?: string; // UK EPC Rating (e.g. EPC Grade B)
  reraPermitNumber?: string; // Dubai RERA Permit Number (e.g. #7184910)
  goldenVisaEligible?: boolean; // Dubai Golden Visa Eligibility
  ownershipType?: string; // Dubai/Global Ownership Type (e.g. Freehold, Leasehold)
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
  agencyName?: string;
  licenseNumber?: string;
  email?: string;
  testimonialText?: string;
  testimonialAuthor?: string;
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
  status?: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Offer Submitted' | 'Closed' | 'Lost' | 'Called' | 'Interested' | 'Not Interested' | 'No Answer';
  budget?: string;
  source?: 'Marketplace' | 'Personal Website' | 'Direct Link';
  notes?: string[];
  remarksHistory?: { date: string; text: string }[];
}

export interface Task {
  id: string;
  realtorId: string;
  leadId?: string;
  leadName?: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed';
}

export interface Booking {
  id: string;
  realtorId: string;
  leadId?: string;
  name: string; // Buyer Name
  email: string;
  phone: string;
  date: string; // e.g., "2026-07-12"
  time: string; // e.g., "3:00 PM"
  meetingType: 'Virtual' | 'Phone Call' | 'Office Visit' | 'Property Showing';
  propertyId?: number;
  propertyTitle?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled';
  appointmentMessage?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'realtor';
  savedPropertyIds: number[];
  realtorProfile?: Realtor;
}

export type ActiveTab = 
  | 'overview'
  | 'listings'
  | 'leads'
  | 'tasks'
  | 'bookings'
  | 'website'
  | 'templates'
  | 'analytics'
  | 'share_kit'
  | 'settings'
  | 'billing';
