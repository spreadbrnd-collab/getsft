import { Property, Realtor, Inquiry, User } from './types';

export const INITIAL_REALTORS: Realtor[] = [
  {
    id: 'david',
    name: 'David Vandervelde',
    title: 'Elite Architectural Realtor',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    city: 'Vancouver',
    phone: '+1 (604) 555-0192',
    whatsapp: '+16045550192',
    bio: 'Specializing in contemporary West Coast minimalist architecture and concrete estate dwellings. Over fifteen years of curate representation in premium luxury segments.',
    experience: 15,
    languages: ['English', 'German', 'Dutch'],
    specializations: ['Penthouses', 'Architectural Glass Homes', 'Waterfront Estates'],
    template: 'Minimal',
    customDomain: 'davidvandervelde.com'
  },
  {
    id: 'sarah',
    name: 'Sarah Sterling',
    title: 'Managing Director, Sterling Group',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    phone: '+1 (416) 555-4819',
    whatsapp: '+14165554819',
    bio: 'Dedicated to presenting high-end modern penthouses and custom-tailored residential buildings. Helping discerning clients find their private structural masterpieces.',
    experience: 12,
    languages: ['English', 'French', 'Mandarin'],
    specializations: ['Luxury Lofts', 'Urban Penthouses', 'Modern Townhomes'],
    template: 'Luxury',
    customDomain: 'sterlingluxury.ca'
  },
  {
    id: 'julian',
    name: 'Julian Rose',
    title: 'Principal Designer & Broker',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    city: 'Montreal',
    phone: '+1 (514) 555-8327',
    whatsapp: '+15145558327',
    bio: 'Bridging architectural design literacy with real estate advisory. Focusing on mid-century modernist restorations and high-comfort solar passive villas.',
    experience: 8,
    languages: ['English', 'French', 'Spanish'],
    specializations: ['Modernist Villas', 'Solar Passive Estates', 'Historical Restorations'],
    template: 'Modern',
    customDomain: 'julianroseresidences.com'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    property_id: 1500,
    owner_id: 'david',
    title: 'The Cascades Neopolis',
    description: 'The Cascades Neopolis is a world-class luxury residential project located in the Neopolis Layout, Hyderabad. Designed in collaboration with international consultants – UHA (London) for architecture, Coopers Hill (Singapore) for landscape, and Studio HBA (Singapore) for interiors. Spanning over 7.34 acres with five stunning 63-storey towers, redefine Hyderabad’s skyline with WELL v2 Platinum pre-certified wellness and a high-end global concierge by Quintessentially UK.',
    price: 44800000,
    bedrooms: 4,
    bathrooms: 4.5,
    area: 4150,
    propertyType: 'Apartment',
    amenities: [
      'Amphitheater', 'Cricket Pitch', 'Sauna Bath', 'Tennis Court', 'Spa Luxury Pavilion',
      'Swimming Pool & Cabanas', 'Open Gym', 'Water Conservation, Rainwater Harvesting', 'Mini Theatre'
    ],
    address: 'Neopolis, Kokapet, West Hyderabad',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500075',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 194000,
    highlights: [
      'International Design Excellence: Concept Architect UHA London, Landscape Coopers Hill Singapore, Interiors Studio HBA Singapore.',
      'Luxury Concierge by Quintessentially UK: World-class residentes lifestyle desk.',
      'World’s Largest WELL Pre-Certified Residence: Earned WELL v2 Platinum Pre-Certification for premium healthy living standards.',
      'IGBC Platinum Pre-Certified Green Building: Carbon conscious materials and maximum efficiency.',
      'Smart Home Automation: Advanced control across all suites.'
    ],
    builderName: 'GHR Lakshmi Urban Blocks Infra LLP',
    builderDescription: 'GHR Lakshmi Urban Blocks Infra LLP is a leading real estate joint syndicate focused on sustainable, high-rise, wellness-centric master planned spaces incorporating global consultant structures.',
    reraId: 'P02400009538',
    possessionDate: 'Mar, 2030',
    projectSize: '5 Buildings - 1189 units',
    projectAreaCount: '7.34 Acres',
    bhkConfig: '3.5, 4, 4.5 BHK Apartments',
    avgPricePerSft: '₹11.5 K/sq.ft',
    landmarks: {
      school: 'Phoenix Greens School of Learning (CBSE / Cambridge School)',
      metro: 'Raidurg Metro Station',
      hospital: 'Continental Hospitals',
      mall: 'Reliance Smart Point',
      restaurant: 'Cafe Sandwicho'
    }
  },
  {
    property_id: 1501,
    owner_id: 'sarah',
    title: 'Aakriti Miro Skyhomes',
    description: 'A structural masterpiece defining high-efficiency modern luxury in Gachibowli area. Miro homes boast of smart daylight tracking layouts, heavy thermal cladding, and spacious private balcony gardens.',
    price: 18500000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2600,
    propertyType: 'Apartment',
    amenities: ['Terrace Clubroom', 'Fully Equipped Gym', 'EV Charging Bays', 'Billiards Room', 'Central Softwater'],
    address: 'Puppalaguda, near Gachibowli',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500032',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 55000,
    highlights: [
      'Seismic resistant structural build design',
      'Centralized rainwater harvesting models',
      'Over 60% open landscaping coverage'
    ],
    builderName: 'Aakriti Infra Structures',
    builderDescription: 'Pioneering structural developers focused on compact eco-luxury residences in West Hyderabad.',
    reraId: 'P02400003194',
    possessionDate: 'Dec, 2027',
    projectSize: '3 Towers - 540 units',
    projectAreaCount: '4.2 Acres',
    bhkConfig: '2, 3 BHK Apartments',
    avgPricePerSft: '₹7.1 K/sq.ft',
    landmarks: {
      school: 'Oakridge International School',
      metro: 'Raidurg Metro Station',
      hospital: 'AIG Hospitals',
      mall: 'Inorbit Mall',
      restaurant: 'Sheraton Feast Desk'
    }
  },
  {
    property_id: 1502,
    owner_id: 'julian',
    title: 'My Home Avatar Peak',
    description: 'Elevated lifestyle towers in Nanakramguda with sweeping views of the Financial District. Promising exceptional structural finish, integrated sports facilities, and direct proximity to corporate hubs.',
    price: 29500000,
    bedrooms: 3,
    bathrooms: 3.5,
    area: 3120,
    propertyType: 'Apartment',
    amenities: ['Grand Sports Arena', 'Central Sky Pavilion Link', 'Skating Rink', 'Yoga Deck', 'Advanced Safety Port'],
    address: 'Gachibowli Financial District Ext',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500008',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 85000,
    highlights: [
      'Premium sports lounge and double badminton courts',
      'Rooftop master clubhouse with panoramic pool',
      'Centralized high-capacity fresh air cycling system'
    ],
    builderName: 'My Home Group',
    builderDescription: 'One of the most reputed and trusted real estate builders in South India, celebrated for impeccable timeline execution and structural integrity.',
    reraId: 'P02400001556',
    possessionDate: 'Jun, 2028',
    projectSize: '10 Towers - 2400 units',
    projectAreaCount: '16.5 Acres',
    bhkConfig: '3 BHK Apartments',
    avgPricePerSft: '₹9.4 K/sq.ft',
    landmarks: {
      school: 'Silver Oaks International School',
      metro: 'Nanakramguda Metro Station',
      hospital: 'Care Hospitals',
      mall: 'Reliance Fresh Supermarket',
      restaurant: 'Over The Moon Brew Desk'
    }
  },
  {
    property_id: 1503,
    owner_id: 'david',
    title: 'Rajapushpa Provincia Narsingi',
    description: 'A premium gated community designed to give you a grand resort experience every single day. Featuring expansive green pathways, high acoustic separation walls, and grand architectural aesthetic portals.',
    price: 31500000,
    bedrooms: 3,
    bathrooms: 3.5,
    area: 3450,
    propertyType: 'Apartment',
    amenities: ['Resort Style Lake', 'Squash Court', 'Multi-level Club lounges', 'Premium Mini-theater', 'Daycare Center'],
    address: 'Narsingi, West Hyderabad',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500075',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 95000,
    highlights: [
      'Double-height air-conditioned designer lobbies',
      '100% vehicle-free ground levels for complete safety',
      'Organic composting setup and solar street illuminations'
    ],
    builderName: 'Rajapushpa Properties',
    builderDescription: 'Creating upscale urban landmarks with a deep commitment to timely delivery, quality materials, and meticulous design.',
    reraId: 'P02400002821',
    possessionDate: 'Oct, 2027',
    projectSize: '8 Buildings - 1650 units',
    projectAreaCount: '12.8 Acres',
    bhkConfig: '3, 4 BHK Apartments',
    avgPricePerSft: '₹9.1 K/sq.ft',
    landmarks: {
      school: 'Rockwell International School',
      metro: 'Raidurg Metro Station',
      hospital: 'Star Hospitals Narsingi',
      mall: 'Rajapushpa Boutique Mall',
      restaurant: 'The Glass Onion Dine'
    }
  },
  {
    property_id: 1504,
    owner_id: 'sarah',
    title: 'Aparna One Signature',
    description: 'An elite block of smart-enabled skyscrapers where luxury meets cutting edge. Featuring localized voice controls, automated climate regulation systems, and a professional level indoor bowling alley.',
    price: 72500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 5100,
    propertyType: 'Apartment',
    amenities: ['Voice Automated Concierge', 'Bowling Alley', 'Squash Championship Court', 'Interactive Tech Lounge', 'Cold Plunge Room'],
    address: 'Shard Nagar, Gachibowli',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500032',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 210000,
    highlights: [
      'Integrated smart-home server in every unit',
      'Advanced dual-stage water softening plant',
      'Secluded luxury library for residents only'
    ],
    builderName: 'Aparna Constructions',
    builderDescription: 'Pioneers of luxury smart apartments and extensive structural durability, delivering modern excellence in Telangana since 1996.',
    reraId: 'P02400000199',
    possessionDate: 'Immediate Delivery',
    projectSize: '2 Elite Towers - 180 units',
    projectAreaCount: '4.8 Acres',
    bhkConfig: '3, 4 BHK Smart Homes',
    avgPricePerSft: '₹14.2 K/sq.ft',
    landmarks: {
      school: 'Chirec International School',
      metro: 'Hitec City Metro Station',
      hospital: 'Continental Hospitals',
      mall: 'SLN Terminus Mall',
      restaurant: 'Prestige Club Lounge'
    }
  },
  {
    property_id: 1505,
    owner_id: 'julian',
    title: 'Candeur Skyline Tower',
    description: 'A spectacular vertical living development located at the crest of West Hyderabad. This project stands as an iconic design statement, utilizing post-tension floor technology.',
    price: 38500000,
    bedrooms: 4,
    bathrooms: 4,
    area: 3780,
    propertyType: 'Apartment',
    amenities: ['Triple Height Sky Deck', 'Indoor Paddle Court', 'Bespoke Gym', 'Infinity Swimming Loop', 'Kids Digital Library'],
    address: 'Financial District Core',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500032',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 110000,
    highlights: [
      'Exquisite panoramic viewing gallery on the 45th level',
      'Advanced triple stage fresh air filtration system',
      'Fully seismic integrated heavy structural base'
    ],
    builderName: 'Candeur Developers',
    builderDescription: 'A dynamic development group redefining state skyline structures with contemporary aesthetics and sturdy high-rise layouts.',
    reraId: 'P02400004948',
    possessionDate: 'Sep, 2029',
    projectSize: '1 Mega Tower - 320 units',
    projectAreaCount: '3.5 Acres',
    bhkConfig: '3.5, 4 BHK Apartments',
    avgPricePerSft: '₹10.1 K/sq.ft',
    landmarks: {
      school: 'Delhi Public School, Gachibowli',
      metro: 'Raidurg Metro Depot',
      hospital: 'Citizen Hospital',
      mall: 'Financial District Plaza',
      restaurant: 'The Westin Gachibowli'
    }
  },
  {
    property_id: 1506,
    owner_id: 'david',
    title: 'Prestige High Fields Gachibowli',
    description: 'Disney-themed high density community providing a delightful atmosphere for growing families. Emphasizing premium active outdoor gardens and high security boundaries.',
    price: 22000000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2840,
    propertyType: 'Apartment',
    amenities: ['Disney Themed Gardens', 'Badminton Court', 'Open Terrace Lounge', 'Aerobics Gym Room', 'Water fountains'],
    address: 'Nanakramguda Financial District',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500008',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 62000,
    highlights: [
      'Over 75% wide visual landscaped reserves',
      'Professional level multi-purpose sports pavilion',
      'Zero traffic security perimeter on kids walks'
    ],
    builderName: 'Prestige Estates Projects',
    builderDescription: 'A national real estate stalwart renowned for masterfully developed integrated townships across India, bringing impeccable class.',
    reraId: 'P02400000032',
    possessionDate: 'Ready to Move',
    projectSize: '10 Buildings - 2240 units',
    projectAreaCount: '21.8 Acres',
    bhkConfig: '2.5, 3, 4 BHK Apartments',
    avgPricePerSft: '₹7.7 K/sq.ft',
    landmarks: {
      school: 'Keystone International School',
      metro: 'Hitec City Business District',
      hospital: 'Care Hospitals Gachibowli',
      mall: 'Prestige Business Hub',
      restaurant: 'Jonathan’s Kitchen'
    }
  },
  {
    property_id: 1507,
    owner_id: 'sarah',
    title: 'Phoenix Golf Edge Residences',
    description: 'An architectural paradise looking directly into the lush fairways of the professional Boulder Hills Golf course. Enjoy high ceilings, gourmet designer pantries, and an incredible visual outlook.',
    price: 41000000,
    bedrooms: 4,
    bathrooms: 4.5,
    area: 3600,
    propertyType: 'Apartment',
    amenities: ['Direct Golf Course View', 'Skypool on 30th floor', 'Fully furnished units', 'Luxury Billiard hall', 'Central Steam bath'],
    address: 'Nanakramguda Financial Hub',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500032',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 125000,
    highlights: [
      'Double master suites with absolute floor to ceiling glass pane',
      '30th level custom residents sky lounge and pool',
      'Complete home automated remote security and audio controls'
    ],
    builderName: 'Phoenix Group',
    builderDescription: 'Setting state benchmarks for premium office technology parks and ultra high-end luxury residential projects for global executives.',
    reraId: 'P02400001150',
    possessionDate: 'Ready to Move',
    projectSize: '2 Tall Towers - 360 units',
    projectAreaCount: '5.2 Acres',
    bhkConfig: '3, 4 BHK Premium Condos',
    avgPricePerSft: '₹11.3 K/sq.ft',
    landmarks: {
      school: 'The Oakridge School, Gachibowli',
      metro: 'Gachibowli Ring Road Depot',
      hospital: 'Continental Hospitals',
      mall: 'Financial Hub Galleria',
      restaurant: 'The Golf Club Lounge'
    }
  },
  {
    property_id: 1508,
    owner_id: 'julian',
    title: 'GHR Callisto Gachibowli',
    description: 'Premium environment-conscious residences designed with a focus on human energy levels. Featuring personalized study pods, beautiful active sensory pathways, and premium water processing yards.',
    price: 16500000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2450,
    propertyType: 'Apartment',
    amenities: ['Co-Working Study Pods', 'Sensory Reflexology Track', 'Tennis & Basketball Court', 'Vapor Room', 'Rain Harvesting Hub'],
    address: 'Nallagandla near Gachibowli',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500019',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 48000,
    highlights: [
      'Clubhouse integrated high speed co-working bays',
      'Active water purification system and continuous power lines',
      'Sensory landscaped reflexology pathway borders'
    ],
    builderName: 'GHR Infra Blocks LLP',
    builderDescription: 'Innovators of health-conscious luxury living spaces, introducing smart human vitals design into modern high-density models.',
    reraId: 'P02400005511',
    possessionDate: 'May, 2028',
    projectSize: '4 Towers - 720 units',
    projectAreaCount: '6.1 Acres',
    bhkConfig: '2.5, 3 BHK Luxury Apartments',
    avgPricePerSft: '₹6.7 K/sq.ft',
    landmarks: {
      school: 'Delhi Public School, Kokapet',
      metro: 'Raidurg Metro Line',
      hospital: 'Continental Hospital',
      mall: 'Citizen Plaza Kokapet',
      restaurant: 'Cafe Callisto'
    }
  },
  {
    property_id: 1509,
    owner_id: 'sarah',
    title: 'The Auroville Sanctum',
    description: 'Auroville Sanctum sets a new horizon for luxury wellness living, styled with Zen-inspired layouts and a natural central lake. Each home boasts massive corner-to-corner visual sky frames and localized thermodynamic air systems.',
    price: 38900000,
    bedrooms: 4,
    bathrooms: 4,
    area: 3680,
    propertyType: 'Apartment',
    amenities: ['Zen Gardens & Tea Pavilion', 'Natural Jogging Lake', 'Acoustic Co-working Pods', 'Heated Indoor Lap Pool', 'Sub-Station Power Net'],
    address: 'Kokapet Elite Layout',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500075',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 115000,
    highlights: [
      'Zen-themed master architecture by Tokyo-inspired design hubs',
      'Over 80% natural vegetation and private walking lake',
      'Low thermal conductance design with full solar grid backup'
    ],
    builderName: 'Auroville Infrastructure Group',
    builderDescription: 'Creating niche wellness-oriented communities focusing on low-energy, highly sustainable private estates across South India.',
    reraId: 'P02400006711',
    possessionDate: 'Jun, 2029',
    projectSize: '3 Towers - 480 units',
    projectAreaCount: '5.8 Acres',
    bhkConfig: '3, 4 BHK Luxury Suites',
    avgPricePerSft: '₹10.5 K/sq.ft',
    landmarks: {
      school: 'Phoenix Greens School of Learning',
      metro: 'Raidurg Metro Station',
      hospital: 'Continental Hospitals',
      mall: 'Inorbit Mall West',
      restaurant: 'The Sanctuary Bistro'
    }
  },
  {
    property_id: 1510,
    owner_id: 'julian',
    title: 'Vasavi Crown Heights',
    description: 'An elite benchmark of soaring premium residential skyscrapers positioned at the apex of Kokapet. Configured for high visual density of natural daylight, featuring high structural concrete performance and customized sky deck configurations.',
    price: 49800000,
    bedrooms: 4,
    bathrooms: 4.5,
    area: 4420,
    propertyType: 'Apartment',
    amenities: ['Panoramic Sky Deck Lounge', 'Olympic Swimming Pool', 'Advanced Fitness Center', 'High Speed Smart Lifts', '24/7 Security Command Room'],
    address: 'Kokapet Golden Mile Road',
    city: 'Hyderabad',
    province: 'Telangana',
    postalCode: '500075',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 155000,
    highlights: [
      'Unobstructed Golden Mile layout views',
      'State-of-the-art home threat defense & access systems',
      'Double width balconies for open elevated social spaces'
    ],
    builderName: 'Vasavi Group Builders',
    builderDescription: 'One of Hyderabad’s signature infrastructure giants, crafting towering residential high-rises with premier amenity blocks for three decades.',
    reraId: 'P02400008432',
    possessionDate: 'Dec, 2029',
    projectSize: '6 Towers - 980 units',
    projectAreaCount: '9.2 Acres',
    bhkConfig: '3.5, 4, 4.5 BHK Apartments',
    avgPricePerSft: '₹11.2 K/sq.ft',
    landmarks: {
      school: 'Chirec Academy Kokapet',
      metro: 'Kokapet Ring Road Metro Station',
      hospital: 'Continental Landmark Hospital',
      mall: 'Kokapet Sovereign Plaza',
      restaurant: 'The Crown Pavilion'
    }
  },
  {
    property_id: 1284,
    owner_id: 'david',
    title: 'The Obsidian Pavilion',
    description: 'A structural marvel in concrete, steel, and low-iron architectural glass. Suspended perfectly over the rugged cliffs of West Vancouver, offering panoramic views of the Pacific Ocean. Features a heated 25-meter black-granite infinity lap pool, climate-controlled art gallery foyer, triple-glazed acoustics, and bespoke white-oak paneling throughout.',
    price: 8450000,
    bedrooms: 4,
    bathrooms: 5,
    area: 6200,
    propertyType: 'Estate',
    amenities: ['Oceanfront Overlook', 'Infinity Pool', 'Art Gallery Foyer', 'Custom Wine Room', 'Automated Security Net'],
    address: '2980 Marine Drive',
    city: 'Vancouver',
    province: 'British Columbia',
    postalCode: 'V7V 1M4',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ],
    openHouseDate: '2026-07-02T13:00:00.000Z',
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 28000,
    highlights: ['Double-cantilevered structural engineering', 'High-accuracy motorized curtain walls', 'Zero-tolerance raw concrete surfaces', 'Private beach descent trail'],
    builderName: 'West Coast Monolith Corp',
    builderDescription: 'Premium concrete artisans active in the Pacific Northwest since 1994, focusing exclusively on seismic-isolated hillside structures.'
  },
  {
    property_id: 1285,
    owner_id: 'david',
    title: 'Minimalist Canopy Residence',
    description: 'Deep within nature yet featuring industrial lines. This residence balances steel beams with warm Douglas Fir trims. Oversized sliding panels dissolve the barrier between pristine garden landscapes and the interior living lounge.',
    price: 14500,
    bedrooms: 3,
    bathrooms: 3.5,
    area: 4400,
    propertyType: 'Villa',
    amenities: ['Heated Floor slab', 'Passive Solar collection', 'Double Height Lounge', 'Private Forest Trail'],
    address: '442 Cedar Creek Trail',
    city: 'Vancouver',
    province: 'British Columbia',
    postalCode: 'V6R 2K1',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    openHouseDate: '2026-06-28T14:30:00.000Z',
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Rent',
    monthlyRentEstimate: 14500,
    highlights: ['FSC-Certified local Douglas Fir cladding', 'Thermally-insulated structural steel core', 'Smart automated daylight shielding', 'Geothermal groundwater cooling system'],
    builderName: 'Timber & Line Builders',
    builderDescription: 'Award-winning sustainable architectural fabricators specialized in deep forest sensitive structural integrations.'
  },
  {
    property_id: 1286,
    owner_id: 'sarah',
    title: 'The Brutalist Sky Garden',
    description: 'Rising thirty levels above downtown, this penthouse redefines high-density luxury. Double-height exposed concrete pillars anchor a stunning two-level outdoor sky private park with native maple groves.',
    price: 11200000,
    bedrooms: 5,
    bathrooms: 6,
    area: 7800,
    propertyType: 'Penthouse',
    amenities: ['Sky Garden Loft', '24/7 Butler Port', 'Automated Elevator Gate', 'Sauna and Cold Plunge', 'Helipad Access'],
    address: '101 Bay Street Suite 3001',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M5H 2Y2',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    openHouseDate: undefined,
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 42000,
    highlights: ['Aerodynamic high-speed elevator access', 'Independently zoned structural slab system', '360 degree low-iron glass perimeter', 'Fully automated microclimate garden beds'],
    builderName: 'High-Rise Apex Group',
    builderDescription: 'Pioneering structural developers who introduced post-tensioned voided slabs to the Eastern Canadian skies.'
  },
  {
    property_id: 1287,
    owner_id: 'julian',
    title: 'Mid-Century Modernist Restorations',
    description: 'Constructed originally in 1964 by a legendary local master, painstakingly updated. Retains authentic timber ceiling slabs, floor-to-ceiling split modular stone hearths, and original terrazzo grounds.',
    price: 9800,
    bedrooms: 3,
    bathrooms: 2,
    area: 3100,
    propertyType: 'Villa',
    amenities: ['Original Terrazzo', 'Stone Hearth Chimney', 'Eco Cedar shingles', 'Courtyard Garden'],
    address: '883 Rue de la Montagne',
    city: 'Montreal',
    province: 'Quebec',
    postalCode: 'H3G 1Z8',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    openHouseDate: '2026-07-05T12:00:00.000Z',
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Rent',
    monthlyRentEstimate: 9800,
    highlights: ['Painstakingly restored original redwood structural detailing', 'Restored 1964 wet-process terrazzo floors', 'Direct connection with internal atrium courtyard', 'Advanced modern energy envelope integration'],
    builderName: 'Atelier Rose Restorations',
    builderDescription: 'Dedicated to reviving modern architect-designed structures with modern engineering metrics while preserving cultural assets.'
  },
  {
    property_id: 1288,
    owner_id: 'sarah',
    title: 'The Ironwood Townhouse Row',
    description: 'An architectural showcase of vertical wood screening and absolute pure glass facades. Designed to maximize daylight and create private vertical sanctuaries.',
    price: 2450000,
    bedrooms: 2,
    bathrooms: 2.5,
    area: 2200,
    propertyType: 'Townhouse',
    amenities: ['Nordic Oak floors', 'Rooftop Lounge', 'Geothermal Heating System', 'Electric Car Port'],
    address: '12-78 Collier Ave',
    city: 'Toronto',
    province: 'Ontario',
    postalCode: 'M4W 1M1',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    openHouseDate: undefined,
    status: 'Active',
    show_on_profile: true,
    show_on_marketplace: true,
    listingIntent: 'Buy',
    monthlyRentEstimate: 7200,
    highlights: ['Integrated vertical solar capture slats', 'Nordic triple-chamber wood frame build', 'Double-height living space looking into a rock garden', 'Permeable active water filtration site design'],
    builderName: 'Metropolitan Urban Form LLC',
    builderDescription: 'Urban dense living strategists focused on reducing ecological footprints while raising acoustic separation benchmarks.'
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    property_id: 1284,
    property_title: 'The Obsidian Pavilion',
    realtor_id: 'david',
    name: 'Eleanor Vance',
    email: 'eleanor@vancearchitects.com',
    phone: '+1 (778) 555-8912',
    message: 'We want to schedule a private viewing this Friday. Our portfolio adviser has verified liquid credentials for verification.',
    date: '2026-06-19T14:20:00.000Z'
  },
  {
    id: 'inq-2',
    property_id: 1284,
    property_title: 'The Obsidian Pavilion',
    realtor_id: 'david',
    name: 'René Larson',
    email: 'rlarson@equinoxnord.com',
    phone: '+1 (604) 555-3810',
    message: 'Could you share details on the triple glazing manufacturer? We are looking for high sound dampening due to low proximity to the shoreline wind patterns.',
    date: '2026-06-20T01:10:00.000Z'
  },
  {
    id: 'inq-3',
    property_id: 1286,
    property_title: 'The Brutalist Sky Garden',
    realtor_id: 'sarah',
    name: 'Charles Belmont',
    email: 'c.belmont@belmortholdings.co',
    phone: '+1 (416) 555-1038',
    message: 'Interested in the Heliport coordinates and slot scheduling contract. Please send over condo bylaws.',
    date: '2026-06-18T10:05:00.000Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'buyer1',
    name: 'Arthur Pendelton',
    email: 'buyer@getsft.com',
    role: 'buyer',
    savedPropertyIds: [1284, 1287]
  },
  {
    id: 'david',
    name: 'David Vandervelde',
    email: 'david@getsft.com',
    role: 'realtor',
    savedPropertyIds: [],
    realtorProfile: INITIAL_REALTORS[0]
  },
  {
    id: 'sarah',
    name: 'Sarah Sterling',
    email: 'sarah@getsft.com',
    role: 'realtor',
    savedPropertyIds: [],
    realtorProfile: INITIAL_REALTORS[1]
  },
  {
    id: 'julian',
    name: 'Julian Rose',
    email: 'julian@getsft.com',
    role: 'realtor',
    savedPropertyIds: [],
    realtorProfile: INITIAL_REALTORS[2]
  }
];

const LOCAL_STORAGE_KEY = 'getsft_mvp_state';

interface AppState {
  realtors: Realtor[];
  properties: Property[];
  inquiries: Inquiry[];
  users: User[];
  currentUser: User | null;
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return {
      realtors: INITIAL_REALTORS,
      properties: INITIAL_PROPERTIES,
      inquiries: INITIAL_INQUIRIES,
      users: INITIAL_USERS,
      currentUser: null,
    };
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure essential fields exist
      if (parsed.realtors && parsed.properties && parsed.inquiries && parsed.users) {
        // First self-heal/synchronize all existing properties with initial attributes
        let mergedProperties = parsed.properties.map((p: any) => {
          const matchedInitial = INITIAL_PROPERTIES.find(ip => ip.property_id === p.property_id);
          return {
            ...matchedInitial, // Default to initial structure to ensure modern properties exist
            ...p,
            listingIntent: p.listingIntent || matchedInitial?.listingIntent || (p.price < 100000 ? 'Rent' : 'Buy'),
            show_on_marketplace: p.show_on_marketplace !== undefined ? p.show_on_marketplace : (matchedInitial?.show_on_marketplace !== undefined ? matchedInitial.show_on_marketplace : true),
            show_on_profile: p.show_on_profile !== undefined ? p.show_on_profile : (matchedInitial?.show_on_profile !== undefined ? matchedInitial.show_on_profile : true),
            monthlyRentEstimate: p.monthlyRentEstimate || matchedInitial?.monthlyRentEstimate || Math.round((p.price || 4000000) * 0.0035)
          };
        });

        // Now dynamically append any newly introduced properties from INITIAL_PROPERTIES that do not exist yet in localStorage
        const existingIds = new Set(mergedProperties.map((p: any) => p.property_id));
        const missingFromCache = INITIAL_PROPERTIES.filter(ip => !existingIds.has(ip.property_id));
        if (missingFromCache.length > 0) {
          mergedProperties = [...mergedProperties, ...missingFromCache];
        }

        parsed.properties = mergedProperties;
        
        // Also self-heal realtors listing references
        parsed.realtors = INITIAL_REALTORS.map(r => {
          const existing = parsed.realtors.find((pr: any) => pr.id === r.id);
          return { ...r, ...existing };
        });

        return parsed as AppState;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  }

  // Fallback / Initial
  const initialState: AppState = {
    realtors: INITIAL_REALTORS,
    properties: INITIAL_PROPERTIES,
    inquiries: INITIAL_INQUIRIES,
    users: INITIAL_USERS,
    currentUser: null, // Start as clean guest so users can explicitly join or sign in with their Realtor profile!
  };
  saveState(initialState);
  return initialState;
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}
