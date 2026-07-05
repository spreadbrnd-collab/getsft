import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, MessageSquare, Calendar, MapPin, Search, Star, 
  Languages, Award, Shield, Compass, BookOpen, Send, Check,
  Sparkles, Filter, Home, Layers, DollarSign, ArrowLeft, ArrowUpRight, Cpu, Zap
} from 'lucide-react';
import { Realtor, Property, Inquiry } from '../types';

interface RealtorProfilePageProps {
  realtor: Realtor;
  properties: Property[];
  onInquirySubmit: (inquiry: Inquiry) => void;
  onBackToMarketplace?: () => void;
  onPropertyClick?: (propertyId: number) => void;
  onTogglePublishMarketplace?: (propertyId: number) => void;
  isPreview?: boolean;
  forceNormalTheme?: boolean;
}

const THEME_CONFIGS: Record<string, {
  bgColor: string;
  textColor: string;
  fontClass: string;
  navClass: string;
  borderClass: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  heroOverlay: string;
  searchBorder: string;
  cardBg: string;
  cardText: string;
  headlineColor: string;
  headingText: string;
  buttonClass: string;
}> = {
  Luxury: {
    bgColor: 'bg-[#FAF6F0]',
    textColor: 'text-[#34241d]',
    fontClass: 'font-serif',
    navClass: 'bg-[#691a1a] text-[#FAF6F0] border-[#dfb265]',
    borderClass: 'border-[#dfb265]',
    accentBg: 'bg-[#dfb265]',
    accentText: 'text-[#120106]',
    badgeBg: 'bg-[#dfb265]',
    badgeText: 'text-[#2c0004]',
    heroOverlay: 'from-[#200a0e]/95 via-[#200a0e]/50 to-transparent',
    searchBorder: 'border-t-4 border-[#691a1a]',
    cardBg: 'bg-white',
    cardText: 'text-[#34241d]',
    headlineColor: 'text-[#691a1a]',
    headingText: '★ Certified Luxury Advisor ★',
    buttonClass: 'bg-[#dfb265] text-[#120106] hover:bg-white hover:text-[#34241d]'
  },
  Vintage: {
    bgColor: 'bg-[#fddfb5]/30',
    textColor: 'text-[#2b251a]',
    fontClass: 'font-serif',
    navClass: 'bg-[#1b3b2b] text-[#fddfb5] border-[#cda250]',
    borderClass: 'border-[#cda250]',
    accentBg: 'bg-[#cda250]',
    accentText: 'text-[#1b3b2b]',
    badgeBg: 'bg-[#cda250]',
    badgeText: 'text-[#1b3b2b]',
    heroOverlay: 'from-[#12231b]/95 via-[#12231b]/45 to-transparent',
    searchBorder: 'border-t-4 border-[#1b3b2b]',
    cardBg: 'bg-[#FAF8F5] border-2 border-[#1b3b2b]/20',
    cardText: 'text-[#2b251a]',
    headlineColor: 'text-[#1b3b2b]',
    headingText: '✦ Imperial Royal Heritage Collection ✦',
    buttonClass: 'bg-[#cda250] text-[#1b3b2b] hover:bg-[#1b3b2b] hover:text-[#f4efe6]'
  },
  Oasis: {
    bgColor: 'bg-[#F2FAF7]',
    textColor: 'text-[#06352F]',
    fontClass: 'font-sans',
    navClass: 'bg-[#0E6C5E] text-[#F2FAF7] border-[#ED9390]',
    borderClass: 'border-[#ED9390]',
    accentBg: 'bg-[#ED9390]',
    accentText: 'text-white',
    badgeBg: 'bg-[#ED9390]',
    badgeText: 'text-[#06352F]',
    heroOverlay: 'from-[#06352F]/95 via-[#06352F]/50 to-transparent',
    searchBorder: 'border-t-4 border-[#0E6C5E]',
    cardBg: 'bg-white shadow-md border-b-4 border-[#ED9390]',
    cardText: 'text-[#06352F]',
    headlineColor: 'text-[#0E6C5E]',
    headingText: '🌴 Premium Beachfront Oasis Division 🌴',
    buttonClass: 'bg-[#ED9390] hover:bg-[#0E6C5E] text-white transition-all'
  },
  Nordic: {
    bgColor: 'bg-[#F4F4F1]',
    textColor: 'text-[#2E3532]',
    fontClass: 'font-sans',
    navClass: 'bg-[#7A8B7B] text-[#F4F4F1] border-[#C2C9C0]',
    borderClass: 'border-[#7A8B7B]',
    accentBg: 'bg-[#7A8B7B]',
    accentText: 'text-white',
    badgeBg: 'bg-[#7A8B7B]',
    badgeText: 'text-white',
    heroOverlay: 'from-[#2E3532]/95 via-[#2E3532]/50 to-transparent',
    searchBorder: 'border-t-4 border-[#7A8B7B]',
    cardBg: 'bg-[#FCFCFC] border border-[#C2C9C0]',
    cardText: 'text-[#2E3532]',
    headlineColor: 'text-[#7A8B7B]',
    headingText: '🌲 Copenhagen Earth & Elements Organic 🌲',
    buttonClass: 'bg-[#7A8B7B] hover:bg-[#2E3532] text-white transition-all'
  }
};

const CYBER_THEME_CONFIGS: Record<string, {
  bgColor: string;
  textColor: string;
  navClass: string;
  borderClass: string;
  glowShadow: string;
  neonAccent: string;
  neonAlt: string;
  secondaryText: string;
  panelBg: string;
  headingText: string;
  badgeClass: string;
  gradientText: string;
  buttonClass: string;
  gridOpacity: string;
}> = {
  Modern: {
    bgColor: 'bg-[#0a051b]',
    textColor: 'text-[#ffd3fb]',
    navClass: 'bg-[#12071a]/85 text-[#ffd3fb] border-fuchsia-500/30',
    borderClass: 'border-fuchsia-500/30',
    glowShadow: 'shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    neonAccent: 'cyan-400',
    neonAlt: 'fuchsia-500',
    secondaryText: 'text-[#cbd5e1]',
    panelBg: 'bg-[#12072a]/95',
    headingText: '★ CYBERPUNK AURORA SUNSET INTERACTIVE ★',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40',
    gradientText: 'from-fuchsia-400 via-purple-500 to-cyan-400',
    buttonClass: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:from-cyan-500 hover:to-fuchsia-600',
    gridOpacity: 'opacity-45'
  },
  Neon: {
    bgColor: 'bg-[#010902]',
    textColor: 'text-[#dafebc]',
    navClass: 'bg-[#051508]/85 text-[#dbfebd] border-emerald-400/40',
    borderClass: 'border-emerald-500/35',
    glowShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.22)]',
    neonAccent: 'emerald-400',
    neonAlt: 'lime-400',
    secondaryText: 'text-[#a6dfae]',
    panelBg: 'bg-[#04200a]/95',
    headingText: '☢ COSMIC GRID INTERACTIVE DETECTOR ☢',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono',
    gradientText: 'from-emerald-400 via-green-500 to-lime-300',
    buttonClass: 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-500 hover:to-emerald-600',
    gridOpacity: 'opacity-75'
  }
};

const COMIC_THEME_CONFIGS: Record<string, {
  bgColor: string;
  textColor: string;
  navClass: string;
  cardBg: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  headingText: string;
  buttonClass: string;
}> = {
  Minimal: {
    bgColor: 'bg-[#FEFCA3]',
    textColor: 'text-black',
    navClass: 'bg-[#fb7185] text-black border-2 border-black border-b-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]',
    cardBg: 'bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]',
    accentBg: 'bg-yellow-400',
    accentText: 'text-black',
    badgeBg: 'bg-pink-400',
    badgeText: 'text-black',
    headingText: '⚡ VIBRANT RETRO POP COMIC ⚡',
    buttonClass: 'bg-yellow-400 text-black border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none'
  },
  Techno: {
    bgColor: 'bg-neutral-900',
    textColor: 'text-white',
    navClass: 'bg-neutral-950 text-white border-2 border-red-600 border-b-6 shadow-[4px_4px_0_0_rgba(220,38,38,0.5)]',
    cardBg: 'bg-neutral-800 border-4 border-red-600 shadow-[6px_6px_0_0_rgba(220,38,38,1)] text-white',
    accentBg: 'bg-red-600',
    accentText: 'text-white',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    headingText: '🔌 INDUSTRIAL DIGITAL MATRIX WIFI 🔌',
    buttonClass: 'bg-red-600 text-white border-2 border-white shadow-[3px_3px_0_0_rgba(255,100,100,1)] hover:bg-white hover:text-black'
  },
  Bauhaus: {
    bgColor: 'bg-[#F1ECE3]',
    textColor: 'text-neutral-900',
    navClass: 'bg-[#2B4C7E] text-white border-2 border-black border-b-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]',
    cardBg: 'bg-white border-4 border-neutral-900 shadow-[6px_6px_0_0_rgba(239,68,68,1)]', // Red blocky drop shadows
    accentBg: 'bg-[#EF4444]',
    accentText: 'text-white',
    badgeBg: 'bg-[#FBBF24]', // Yellow block
    badgeText: 'text-black',
    headingText: '📐 SWISS STRUCTURED GEOMETRY LAWS 📐',
    buttonClass: 'bg-[#EF4444] text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#FBBF24] hover:text-black'
  }
};

export default function RealtorProfilePage({
  realtor,
  properties,
  onInquirySubmit,
  onBackToMarketplace,
  onPropertyClick,
  onTogglePublishMarketplace,
  isPreview = false,
  forceNormalTheme = false,
}: RealtorProfilePageProps) {
  // Website property search filters
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('20000000');
  const [bedrooms, setBedrooms] = useState('All');

  // Contact form submission state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState(`Hello ${realtor.name}, I would like to schedule a private advisory consultation session with you.`);
  const [consultationBooked, setConsultationBooked] = useState(false);

  // Real-time page views tracking
  useEffect(() => {
    if (realtor?.id) {
      try {
        const storedViews = localStorage.getItem('getsft_page_views') || '{}';
        const viewsObj = JSON.parse(storedViews);
        // Track per-realtor page views (no starting baseline, starts at 0 and increments)
        viewsObj[realtor.id] = (viewsObj[realtor.id] || 0) + 1;
        localStorage.setItem('getsft_page_views', JSON.stringify(viewsObj));
      } catch (e) {
        console.error("Error setting page view count:", e);
      }
    }
  }, [realtor?.id]);

  // Filter listings owned by this realtor and visibility on My Website == true
  const realtorProperties = useMemo(() => {
    return properties.filter(
      (p) => p.owner_id === realtor.id && p.show_on_profile === true
    );
  }, [properties, realtor.id]);

  // Filter listings based on current user searches on the realtor site
  const filteredProperties = useMemo(() => {
    return realtorProperties.filter((p) => {
      const matchCity = searchCity ? p.city.toLowerCase().includes(searchCity.toLowerCase()) : true;
      const matchType = searchType !== 'All' ? p.propertyType === searchType : true;
      const matchMinPrice = p.price >= parseFloat(minPrice || '0');
      const matchMaxPrice = p.price <= parseFloat(maxPrice || '99999999');
      const matchBeds = bedrooms !== 'All' ? p.bedrooms >= parseInt(bedrooms) : true;
      return matchCity && matchType && matchMinPrice && matchMaxPrice && matchBeds;
    });
  }, [realtorProperties, searchCity, searchType, minPrice, maxPrice, bedrooms]);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) return;

    const generalInquiry: Inquiry = {
      id: `inq-gen-${Date.now()}`,
      property_id: 0, 
      property_title: 'General Consultation request',
      realtor_id: realtor.id,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
      date: new Date().toISOString(),
    };

    onInquirySubmit(generalInquiry);
    setConsultationBooked(true);
  };

  // -------------------------------------------------------------
  // TEMPLATE 1: LUXURY (Regal Maroon, Venetian Gold, and Rich Sand)
  // -------------------------------------------------------------
  const renderLuxuryTemplate = () => {
    const tName = (realtor.template && ['Luxury', 'Vintage', 'Oasis', 'Nordic'].includes(realtor.template)) ? realtor.template : 'Luxury';
    const cfg = THEME_CONFIGS[tName];

    return (
      <div className={`min-h-screen ${cfg.bgColor} ${cfg.textColor} ${cfg.fontClass} transition-colors duration-300`}>
        {/* Hero Cover Header */}
        <div className={`relative h-[480px] w-full overflow-hidden bg-stone-900 border-b-4 ${cfg.borderClass}`}>
          <img
            src={realtor.coverImage}
            alt="Luxury Architecture Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-75 object-center"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${cfg.heroOverlay}`}></div>
          
          <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-end gap-8 justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl shrink-0 ${cfg.borderClass} bg-stone-100`}>
                <img
                  src={realtor.profileImage}
                  alt={realtor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <span className={`font-mono text-xs tracking-widest uppercase block mb-1 font-bold ${cfg.headlineColor}`}>
                  {cfg.headingText}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#fcf8f2] drop-shadow">
                  {realtor.name}
                </h1>
                <p className="text-xs md:text-sm tracking-wide text-[#e9dfd0] max-w-lg mt-2">
                  {realtor.title} • Specializing in legacy holdings and off-market architecture.
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start mt-3 text-sm opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>Exclusive Brokerage Division • {realtor.city}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
              <a
                href={isPreview ? '#' : `tel:${realtor.phone}`}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded shadow-md border ${cfg.buttonClass} ${cfg.borderClass}`}
              >
                <Phone className="w-4 h-4" />
                Audio Direct
              </a>
              <a
                href={isPreview ? '#' : `https://wa.me/${realtor.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 px-5 py-3 bg-transparent text-xs font-mono font-bold uppercase tracking-wider transition-all rounded border border-white hover:bg-white/10`}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Secure
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Listings side */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Elegant Search Panel */}
            <section className={`p-8 border-b-2 border-x rounded-lg shadow-md space-y-6 bg-white ${cfg.searchBorder} border-stone-200/60`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold tracking-tight uppercase flex items-center gap-2 ${cfg.headlineColor}`}>
                  <Filter className="w-5 h-5" />
                  Curated Catalog Search
                </h3>
                <span className={`text-[10px] font-mono tracking-widest uppercase ${cfg.headlineColor}`}>Private Inventory</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-500 font-bold mb-1">Preferred Location</label>
                  <input
                    type="text"
                    placeholder="Type preferred location..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded text-stone-800 outline-none focus:border-stone-500 ${cfg.bgColor} ${cfg.borderClass}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-500 font-bold mb-1">Architecture Class</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded text-stone-800 outline-none focus:border-stone-500 ${cfg.bgColor} ${cfg.borderClass}`}
                  >
                    <option value="All">All types</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Estate">Estate</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-500 font-bold mb-1">Beds Capacity</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded text-stone-800 outline-none focus:border-stone-500 ${cfg.bgColor} ${cfg.borderClass}`}
                  >
                    <option value="All">Any Capacity</option>
                    <option value="2">2+ Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200/50 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-1">Min Premium ($)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded text-stone-800 outline-none ${cfg.bgColor} ${cfg.borderClass}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded text-stone-800 outline-none ${cfg.bgColor} ${cfg.borderClass}`}
                  />
                </div>
              </div>
            </section>

            {/* Exclusive Representations Portfolio */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#dfb265] pb-4">
                <div>
                  <span className="text-xs uppercase font-mono text-[#dfb265] tracking-widest block font-bold">Showcase of Estates</span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold text-[#691a1a] mt-1 italic tracking-tight">
                    Private Masterpiece Collection
                  </h2>
                </div>
                <span className="text-xs text-stone-500 font-sans tracking-wide mt-2 md:mt-0">
                  {filteredProperties.length} elite holdings curated by Agent
                </span>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="text-center py-24 bg-white border border-[#e1d2bf] rounded-lg">
                  <p className="text-lg italic text-stone-600 font-serif">Deeply regret, but no matching representations fit these parameters.</p>
                  <button
                    onClick={() => {
                      setSearchCity('');
                      setSearchType('All');
                      setMinPrice('0');
                      setMaxPrice('20000000');
                      setBedrooms('All');
                    }}
                    className="text-xs font-mono text-[#691a1a] font-bold underline mt-4 tracking-wider uppercase hover:opacity-85"
                  >
                    Reset filtering parameters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredProperties.map((p) => (
                    <div
                      key={p.property_id}
                      onClick={() => onPropertyClick && onPropertyClick(p.property_id)}
                      className="bg-white border hover:border-[#dfb265] group flex flex-col cursor-pointer hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden flex-1"
                    >
                      <div className="relative aspect-3/2 overflow-hidden bg-stone-100">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-[#691a1a] text-[#FAF6F0] text-[10px] uppercase font-mono tracking-widest py-1 px-3 rounded shadow">
                          {p.propertyType}
                        </div>
                        {p.openHouseDate && (
                          <div className="absolute bottom-4 left-4 bg-[#FAF6F0] text-stone-900 text-[10px] font-mono tracking-wider px-2.5 py-1 uppercase border border-[#dfb265] shadow">
                            Advisory Op: {new Date(p.openHouseDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-[#691a1a] group-hover:underline">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-widest font-sans font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-[#dfb265]" />
                            {p.address}, {p.city}
                          </div>
                          <p className="text-[13.5px] text-stone-600 mt-2 font-sans line-clamp-3 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#f5ece0] flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xl text-[#34241d] font-sans">
                              ${p.price.toLocaleString()}
                            </span>
                            
                            <div className="flex items-center gap-2 text-[12px] font-mono tracking-widest text-[#dfb265] font-bold uppercase bg-[#FAF6F0] px-3 py-1.5 rounded">
                              <span>{p.bedrooms} Beds</span>
                              <span className="opacity-50">•</span>
                              <span>{p.bathrooms} Baths</span>
                              <span className="opacity-50">•</span>
                              <span>{p.area} SFT</span>
                            </div>
                          </div>
                          {onTogglePublishMarketplace && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePublishMarketplace(p.property_id);
                              }}
                              className={`w-full py-2.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                                p.show_on_marketplace
                                  ? 'bg-[#691a1a] text-[#FAF6F0] border-[#691a1a] hover:bg-stone-800'
                                  : 'bg-[#FAF6F0] text-[#691a1a] border-[#dfb265] hover:bg-[#dfb265] hover:text-[#FAF6F0]'
                              }`}
                              title={p.show_on_marketplace ? 'Remove from main SFT Platform' : 'Publish directly to SFT Platform'}
                            >
                              {p.show_on_marketplace ? '★ Published on SFT' : '☆ Publish on SFT'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Agent Details and Direct Booker */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <section className="bg-white p-8 border-t-4 border-[#691a1a] border-[#e1d2bf] border rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-bold text-[#691a1a] tracking-wider uppercase border-b-2 border-[#dfb265] pb-2">
                Adviser Bio & Intel
              </h3>
              <p className="text-sm font-serif italic leading-relaxed text-stone-700">
                "{realtor.bio}"
              </p>
              
              <div className="space-y-4 pt-4 border-t border-[#FAF6F0] text-xs font-sans">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#dfb265] shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono tracking-wide uppercase text-stone-400 font-bold block">Tenure Group</span>
                    <p className="text-stone-800 font-medium">Over {realtor.experience} years luxury brokerage</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-[#dfb265] shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono tracking-wide uppercase text-stone-400 font-bold block">Linguistic Skills</span>
                    <p className="text-stone-800 font-medium">{realtor.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#dfb265] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono tracking-wide uppercase text-stone-400 font-bold block">Elite Focus & Coverage</span>
                    <p className="text-stone-600 mt-1 leading-relaxed">{realtor.specializations.join(' • ')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonial block */}
            <section className="bg-[#691a1a] p-8 border border-[#dfb265] rounded-l shadow-lg text-[#FAF6F0] space-y-4 pb-6">
              <span className="text-[10px] tracking-widest font-mono uppercase text-[#dfb265] block font-bold">★ Endorsement Archive ★</span>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="border-l-2 border-[#dfb265] pl-4 italic text-sm text-[#e9dfd0]">
                "Advising our family group on deep estate holdings was done with absolute supreme privacy, tact, and flawless timing. Highly endorsed."
              </blockquote>
              <cite className="block text-[9px] font-mono text-[#dfb265] uppercase tracking-widest text-right">
                — Royal Estate Trust
              </cite>
            </section>

            {/* Consultation Secure booking */}
            <section className="bg-white p-8 border-t-4 border-[#691a1a] border-[#e1d2bf] border rounded-lg shadow-md space-y-4">
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#dfb265] block font-bold">Secure Communication Gateway</span>
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">Curate Private Consultation</h3>

              {!consultationBooked ? (
                <form onSubmit={handleConsultationSubmit} className="space-y-4 font-sans text-xs">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#e1d2bf] rounded text-stone-800 focus:border-[#691a1a] outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Secure Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#e1d2bf] rounded text-stone-800 focus:border-[#691a1a] outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Contact Telephone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#e1d2bf] rounded text-stone-800 focus:border-[#691a1a] outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#e1d2bf] rounded text-stone-800 focus:border-[#691a1a] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#691a1a] hover:bg-[#521410] text-[#FAF6F0] font-mono uppercase tracking-widest font-bold border border-[#dfb265] transition-all rounded shadow cursor-pointer text-center"
                  >
                    Transmit Secure Criteria
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-sans font-bold text-stone-900">Transmission Logged</h4>
                  <p className="text-xs text-stone-500 mt-2 max-w-xs mx-auto">
                    Your luxury brief has been transmitted securely. The advisor will respond shortly in your inbox.
                  </p>
                  <button
                    onClick={() => setConsultationBooked(false)}
                    className="mt-4 text-xs text-[#691a1a] underline font-bold"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TEMPLATE 2: RETRO POP / NEO-BRUTALIST (Comic, Bold Colors, Playful & Electric)
  // -------------------------------------------------------------
  const renderRetroPopTemplate = () => {
    const tName = (realtor.template && ['Minimal', 'Techno', 'Bauhaus'].includes(realtor.template)) ? realtor.template : 'Minimal';
    const cfg = COMIC_THEME_CONFIGS[tName];
    
    // We define a list of vibrant colors for property cards
    const popColors = ['bg-[#fdbc58]', 'bg-[#ffc6d9]', 'bg-[#98f5e1]', 'bg-[#b6e3ff]', 'bg-[#cbf3d2]'];

    return (
      <div className={`min-h-screen ${cfg.bgColor} ${cfg.textColor} font-mono p-4 md:p-8 space-y-8 select-none`}>
        {/* Hero Brutalist block */}
        <div className={`${cfg.cardBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 relative overflow-hidden`}>
          <div className="absolute top-2 right-2 animate-bounce">
            <Sparkles className="w-12 h-12 text-[#fde047] fill-[#fde047]" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Profil Avatar Card */}
            <div className="flex justify-center">
              <div className="relative border-4 border-black p-2 bg-white rotate-[-3deg] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] w-56 h-56 shrink-0 group hover:rotate-[3deg] transition-all">
                <img
                  src={realtor.profileImage}
                  alt={realtor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover border-2 border-black"
                />
                <span className={`absolute bottom-2.5 right-2 px-2 py-1 uppercase text-[9px] font-black tracking-widest border-2 border-black ${cfg.badgeBg} ${cfg.badgeText}`}>
                  ONLINE NOW!
                </span>
              </div>
            </div>

            {/* Profile description */}
            <div className="lg:col-span-2 space-y-4 text-center lg:text-left text-[#0f172a]">
              <span className="text-xs uppercase bg-[#fb7185] px-3.5 py-1.5 border-2 border-black inline-block font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {realtor.title}
              </span>
              <h1 className="text-3xl md:text-5.5xl font-black tracking-tight leading-none uppercase select-none drop-shadow">
                HELLO, I'M {realtor.name}!
              </h1>
              <p className="text-xs md:text-sm bg-white/60 p-4 border-3 border-black text-neutral-800 font-bold leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {realtor.bio || "Crafting bold real estate opportunities with direct transparent pricing and spectacular listings!"}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start">
                <a
                  href={isPreview ? '#' : `tel:${realtor.phone}`}
                  className="px-6 py-3.5 bg-[#4ade80] hover:bg-[#22c55e] text-black border-3 border-black font-extrabold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> CALL TELEPHONE
                </a>
                <a
                  href={isPreview ? '#' : `https://wa.me/${realtor.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-black border-3 border-black font-extrabold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> CHAT WHATSAPP
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout (Brutalist layout split) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main search and grid */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Neon Brutalist Filter */}
            <section className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <span className="bg-[#f43f5e] text-white border-2 border-black text-xs font-black tracking-widest px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                FILTER CODES GO HERE!
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black text-xs">
                <div>
                  <label className="block text-[11px] mb-1">PREFERRED LOCATION:</label>
                  <input
                    type="text"
                    placeholder="Type preferred location..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full p-2.5 bg-neutral-100 border-2 border-black rounded-none outline-none focus:bg-[#b6e3ff]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1">TYPE OF PROPERTY:</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full p-2.5 bg-neutral-100 border-2 border-black rounded-none outline-none focus:bg-[#ffc6d9]"
                  >
                    <option value="All">All Architecture</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Estate">Estate</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] mb-1">BED CAPACITY:</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full p-2.5 bg-neutral-100 border-2 border-black rounded-none outline-none"
                  >
                    <option value="All">Any Capacity</option>
                    <option value="2">2+ Bed units</option>
                    <option value="3">3+ Bed units</option>
                    <option value="4">4+ Bed units</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Brutalist List Columns of Properties */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-4 border-black pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-950">
                  ⚡ SPECTACULAR PROPERTY DIRECTORY!
                </h2>
                <span className="bg-[#fb7185] border-2 border-black text-xs font-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {filteredProperties.length} UNITS
                </span>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="bg-[#cbd5e1] border-4 border-black p-10 text-center font-bold">
                  ⚠️ SORRY PAL! NO ARCHITECTURE MATCHES DECLARED SPECS!
                  <button
                    onClick={() => {
                      setSearchCity('');
                      setSearchType('All');
                      setMinPrice('0');
                      setMaxPrice('20000000');
                      setBedrooms('All');
                    }}
                    className="block mx-auto mt-4 px-4 py-2 bg-yellow-400 border-2 border-black uppercase tracking-widest hover:bg-yellow-350"
                  >
                    RESET PARAMS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredProperties.map((p, index) => {
                    const cardColor = popColors[index % popColors.length];
                    return (
                      <div
                        key={p.property_id}
                        onClick={() => onPropertyClick && onPropertyClick(p.property_id)}
                        className={`${cardColor} border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col justify-between`}
                      >
                        <div>
                          <div className="relative border-4 border-black h-48 overflow-hidden bg-neutral-100">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black text-[#fcf033] border-2 border-black text-[9px] font-black tracking-widest uppercase py-1 px-2.5">
                              {p.propertyType}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-black line-clamp-1 hover:underline">
                              {p.title}
                            </h3>
                            <div className="text-[10px] uppercase font-black tracking-widest bg-white border border-black px-2 py-1 inline-block">
                              📍 Loc: {p.address}, {p.city}
                            </div>
                            <p className="text-[13.5px] font-bold font-sans text-neutral-800 line-clamp-3">
                              {p.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-black flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-xl bg-white border-2 border-black px-3 py-1 block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#10b981]">
                              ${p.price.toLocaleString()}
                            </span>
                            
                            <div className="bg-[#fb7185] border-2 border-black uppercase text-[12px] px-2.5 py-1.5 font-bold flex flex-wrap gap-1">
                              <span>{p.bedrooms} Beds</span>
                              <span>•</span>
                              <span>{p.bathrooms} Baths</span>
                            </div>
                          </div>
                          {onTogglePublishMarketplace && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePublishMarketplace(p.property_id);
                              }}
                              className={`w-full py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer text-center bg-white text-black hover:bg-[#38bdf8] ${
                                p.show_on_marketplace ? 'bg-[#38bdf8]' : 'bg-white'
                              }`}
                            >
                              {p.show_on_marketplace ? '★ LIVE ON SFT' : '☆ PUBLISH ON SFT'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="space-y-6">
            {/* Experience and Specs */}
            <section className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <span className="bg-[#38bdf8] border-2 border-black text-neutral-900 border-black text-xs font-black tracking-widest px-3 py-1 inline-block">
                ★ CERTIFICATE & INTEL
              </span>
              <p className="font-black text-xs uppercase text-neutral-500">EXPERIENCE RANK:</p>
              <div className="text-sm font-bold bg-[#cbf3d2] p-3 border-2 border-black">
                💥 {realtor.experience}+ years elite representations license.
              </div>
              
              <div className="space-y-3 font-bold text-xs">
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block mb-1">Languages spoken:</span>
                  <p className="text-[#fb7185] font-black">{realtor.languages.join(' • ')}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block mb-1">Target Specializations:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {realtor.specializations.map((spec) => (
                      <span key={spec} className="bg-neutral-100 border border-black text-[9px] px-2 py-1 font-black">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            {realtor.testimonialText && (
              <section className="bg-[#ffc6d9] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 font-bold">
                <span className="bg-[#34d399] border-2 border-black text-xs font-black tracking-widest px-2.5 py-1 inline-block">
                  🌟 CLIENT TESTIMONIAL
                </span>
                <p className="text-xs italic leading-relaxed text-neutral-800">
                  "{realtor.testimonialText}"
                </p>
                {realtor.testimonialAuthor && (
                  <div className="text-[10px] text-right text-stone-600 block">— {realtor.testimonialAuthor}</div>
                )}
              </section>
            )}

            {/* Quick booking Brutalist Block */}
            <section className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <span className="bg-[#f0abfc] border-2 border-black text-xs font-black tracking-widest px-3 py-1 inline-block">
                ⚡ MAKE BOOKING!
              </span>
              <h3 className="text-lg font-black uppercase text-black">Transmit private advisory request</h3>

              {!consultationBooked ? (
                <form onSubmit={handleConsultationSubmit} className="space-y-4 font-bold text-xs">
                  <div>
                    <label className="block text-[10px] mb-1">YOUR NAME:</label>
                    <input
                      type="text"
                      required
                      placeholder="Insert name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-2 bg-neutral-100 border-2 border-black outline-none focus:bg-[#ffc6d9]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1">EMAIL CODES:</label>
                    <input
                      type="email"
                      required
                      placeholder="Insert email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-2 bg-neutral-100 border-2 border-black outline-none focus:bg-[#b6e3ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1">PHONE NUMBER:</label>
                    <input
                      type="tel"
                      required
                      placeholder="Insert phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-2 bg-neutral-100 border-2 border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1">DIRECTIVE MEMO:</label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-2 bg-neutral-100 border-2 border-black outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-black hover:bg-neutral-900 text-[#fcf033] border-2 border-black font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center cursor-pointer"
                  >
                    🚀 EXECUTE TRANSMISSION!
                  </button>
                </form>
              ) : (
                <div className="text-center bg-[#4ade80] border-4 border-black p-4">
                  <h4 className="font-black text-xs">OK! TRANSMITTED OUT!</h4>
                  <p className="text-[10px] mt-2 text-neutral-800 leading-tight">
                    Coordinates uploaded to Agent {realtor.name} console system. We will contact your coordinates shortly.
                  </p>
                  <button
                    onClick={() => setConsultationBooked(false)}
                    className="mt-4 text-[10px] underline font-black uppercase tracking-wider block mx-auto"
                  >
                    RESET FORM
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TEMPLATE 3: MODERN (Hyper-Tech Sunset Cyber, Neon, Fuchsia & Turquoise)
  // -------------------------------------------------------------
  const renderModernCyberTemplate = () => {
    const tName = (realtor.template && ['Modern', 'Neon'].includes(realtor.template)) ? realtor.template : 'Modern';
    const cfg = CYBER_THEME_CONFIGS[tName];

    return (
      <div className={`min-h-screen ${cfg.bgColor} ${cfg.textColor} font-sans transition-all duration-300 relative overflow-hidden`}>
        {/* Futuristic glowing grid elements in background */}
        <div className={`absolute inset-0 bg-[linear-gradient(to_right,#0c0823_1px,transparent_1px),linear-gradient(to_bottom,#0c0823_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none ${cfg.gridOpacity}`}></div>
        
        {/* Hyper-Modern Neon Banner */}
        <div className={`relative h-[460px] w-full overflow-hidden bg-neutral-950 border-b ${cfg.borderClass} shadow-inner`}>
          <img
            src={realtor.coverImage}
            alt="Futuristic Architecture Showcase"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-50 object-center"
          />
          {/* Cyber magenta & ocean-blue ambient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${cfg.bgColor} via-black/40 to-transparent`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-transparent to-cyan-950/20"></div>

          <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-end gap-8 justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className={`relative w-32 h-32 md:w-38 md:h-38 rounded-[24px] overflow-hidden border-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] shrink-0 bg-stone-900 p-1`}>
                <img
                  src={realtor.profileImage}
                  alt={realtor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>
              <div className="space-y-1">
                <div className={`flex items-center gap-1 border px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest rounded-md w-fit mx-auto md:mx-0 ${cfg.badgeClass}`}>
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" /> Fully Digitized Advisor
                </div>
                <h1 className={`text-3xl md:text-5xl font-black bg-gradient-to-r ${cfg.gradientText} bg-clip-text text-transparent tracking-tight uppercase`}>
                  {realtor.name}
                </h1>
                <p className="text-xs md:text-sm text-cyan-300 font-mono tracking-wide mt-1">
                  {realtor.title} • Synced to SFT Network nodes.
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start mt-3 text-xs font-mono text-[#b3b0d4]">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Network Grid Region: {realtor.city}</span>
                </div>
              </div>
            </div>

            {/* Neon floating actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end font-mono">
              <a
                href={isPreview ? '#' : `tel:${realtor.phone}`}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest border rounded-xl transition-all shadow-md ${cfg.buttonClass}`}
              >
                <Phone className="w-4 h-4 animate-pulse" />
                Line Connect
              </a>
              <a
                href={isPreview ? '#' : `https://wa.me/${realtor.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest border border-stone-800 rounded-xl transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                D-Link secure
              </a>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Listings Showcase */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Holographic Search Terminal */}
            <section className="bg-indigo-950/20 backdrop-blur-md p-6 rounded-[24px] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <h3 className="text-cyan-400 text-sm font-mono tracking-widest uppercase flex items-center gap-2">
                  <Search className="w-4 h-4 text-fuchsia-400" />
                  Terminal Listing Ingest Filter
                </h3>
                <span className="text-[9px] font-mono text-fuchsia-400 tracking-wider">SECURE GRID INDEX</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-neutral-300">
                <div>
                  <label className="block text-[10px] uppercase text-cyan-400 mb-1">PREFERRED LOCATION MATRIX:</label>
                  <input
                    type="text"
                    placeholder="Type preferred location..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#170a31] border border-cyan-500/20 rounded-xl text-cyan-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-cyan-400 mb-1">FACILITY LEVEL:</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#170a31] border border-cyan-500/20 rounded-xl text-cyan-100 focus:border-cyan-400 outline-none"
                  >
                    <option value="All">All Properties</option>
                    <option value="Penthouse">Penthouse Node</option>
                    <option value="Villa">Villa Node</option>
                    <option value="Estate">Estate Node</option>
                    <option value="Townhouse">Townhouse Node</option>
                    <option value="Apartment">Apartment Node</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-cyan-400 mb-1">CAPACITY SIZE:</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#170a31] border border-cyan-500/20 rounded-xl text-cyan-100 focus:border-cyan-400 outline-none"
                  >
                    <option value="All">Any Size Capacity</option>
                    <option value="2">2+ Bed Matrix</option>
                    <option value="3">3+ Bed Matrix</option>
                    <option value="4">4+ Bed Matrix</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Glowing Neon listings */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-fuchsia-500/30 pb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase block">ARCHITECTURAL DATA INDEX</span>
                  <h2 className="text-2xl md:text-3.5xl font-black text-cyan-300 mt-1 uppercase">
                    ACTIVE PROPERTY FREQUENCIES
                  </h2>
                </div>
                <span className="text-xs text-fuchsia-400 font-mono tracking-widest mt-2 md:mt-0 uppercase">
                  SYS INDEX // {filteredProperties.length} SPECTRA DETECTED
                </span>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-indigo-950/10 border border-dashed border-cyan-500/30 rounded-2xl">
                  <p className="text-base text-cyan-400 font-mono">Matrix Alert: Zero active architectural frequencies detected.</p>
                  <button
                    onClick={() => {
                      setSearchCity('');
                      setSearchType('All');
                      setMinPrice('0');
                      setMaxPrice('20000000');
                      setBedrooms('All');
                    }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white font-mono text-xs uppercase tracking-widest rounded transition-all shadow-md"
                  >
                    Reset System Parameters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredProperties.map((p) => (
                    <div
                      key={p.property_id}
                      onClick={() => onPropertyClick && onPropertyClick(p.property_id)}
                      className="bg-[#100727]/90 border border-fuchsia-500/30 hover:border-cyan-400 group flex flex-col cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 rounded-[20px] overflow-hidden justify-between"
                    >
                      <div className="relative aspect-3/2 overflow-hidden bg-neutral-900 border-b border-fuchsia-500/30">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute top-4 left-4 bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-500/40 text-[9px] font-mono uppercase tracking-widest py-1.5 px-3 rounded">
                          {p.propertyType}
                        </div>
                        {p.openHouseDate && (
                          <div className="absolute bottom-4 left-4 bg-cyan-950/90 border border-cyan-500/40 text-[#00f7df] text-[9px] font-mono tracking-wider px-2.5 py-1.5 uppercase rounded">
                            BROADCAST OPEN: {new Date(p.openHouseDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 group-hover:underline uppercase">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#cbd5e1] uppercase">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            {p.address}, {p.city}
                          </div>
                          <p className="text-[13.5px] text-[#ced3ec] mt-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-indigo-950/50 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xl text-cyan-300 font-mono tracking-tight">
                              ${p.price.toLocaleString()}
                            </span>
                            
                            <div className="flex items-center gap-2 text-[12px] font-mono tracking-widest text-fuchsia-300 uppercase bg-[#200e47] border border-fuchsia-500/20 px-3 py-1.5 rounded-md">
                              <span>{p.bedrooms} Beds</span>
                              <span className="opacity-40">|</span>
                              <span>{p.bathrooms} Baths</span>
                            </div>
                          </div>
                          {onTogglePublishMarketplace && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePublishMarketplace(p.property_id);
                              }}
                              className={`w-full py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer border shadow-[0_0_15px_rgba(6,182,212,0.1)] text-center ${
                                p.show_on_marketplace
                                  ? 'bg-fuchsia-950/80 hover:bg-fuchsia-600 text-fuchsia-200 border-fuchsia-500/50 shadow-[0_0_15px_rgba(240,46,170,0.3)]'
                                  : 'bg-cyan-950/80 hover:bg-cyan-500 text-cyan-400 hover:text-[#070314] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              }`}
                            >
                              {p.show_on_marketplace ? '★ LIVE ON SFT' : '☆ PUBLISH ON SFT'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cyber Sidebar Console */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit font-mono text-xs">
            
            {/* Intel Terminal */}
            <section className="bg-indigo-950/20 backdrop-blur-md p-6 rounded-[24px] border border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.1)] space-y-4">
              <h3 className="text-sm font-bold text-fuchsia-400 tracking-wider uppercase border-b border-fuchsia-500/30 pb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-cyan-400" />
                CONSOLE BIO REPORT
              </h3>
              <p className="text-cyan-100 font-sans italic leading-relaxed">
                "{realtor.bio}"
              </p>

              <div className="space-y-4 pt-4 border-t border-fuchsia-500/20 leading-tight">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase text-cyan-400 block mb-0.5">SERVICE TENURE</span>
                    <p className="text-[#aeb6e2]">Sync Group Level — Over {realtor.experience} years luxury matrix</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase text-cyan-400 block mb-0.5">COMM CODES</span>
                    <p className="text-[#aeb6e2]">{realtor.languages.join(' , ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase text-cyan-400 block mb-0.5">MATRIX TARGETS</span>
                    <p className="text-cyan-200 mt-1 leading-relaxed text-[10px]">{realtor.specializations.join(' • ')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Review */}
            <section className="bg-[#120727]/90 border border-fuchsia-500/30 p-6 rounded-[20px] shadow-lg text-[#ffd3fb] space-y-3">
              <span className="text-[9px] tracking-widest text-fuchsia-400 uppercase block font-bold">★ CREDENTIAL ARCHIVE ★</span>
              <div className="flex items-center gap-1 text-cyan-400">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                ))}
              </div>
              <blockquote className="border-l border-fuchsia-500/55 pl-4 italic text-[11px] leading-relaxed">
                "System representation of our digital estate compounds was executed with 100% privacy, encryption, and speed."
              </blockquote>
              <cite className="block text-[8px] text-cyan-400 uppercase tracking-widest mt-2 text-right">
                — Hologram Estate Trust
              </cite>
            </section>

            {/* Inquire secure portal contact form */}
            <section className="bg-[#12072a]/95 p-6 rounded-[24px] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-4">
              <span className="text-[10px] uppercase text-cyan-400 tracking-wider block font-bold">SYSTEM PACKET TRANSMITTER</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Inquire Secure Wave link</h3>

              {!consultationBooked ? (
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="NAME INGEST..."
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#180e35] border border-cyan-500/20 text-cyan-100 placeholder-indigo-300 focus:border-cyan-400 outline-none rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="EMAIL SOURCE IDENT..."
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#180e35] border border-cyan-500/20 text-cyan-100 placeholder-indigo-300 focus:border-cyan-400 outline-none rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="TELEPHONY MATRIX..."
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#180e35] border border-cyan-500/20 text-cyan-100 placeholder-indigo-300 focus:border-cyan-400 outline-none rounded-xl"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-[#180e35] border border-cyan-500/20 text-cyan-100 placeholder-indigo-300 focus:border-cyan-400 outline-none resize-none rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white font-mono uppercase tracking-widest font-black rounded-xl border border-cyan-400/40 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all text-center"
                  >
                    ⚡ INITIATE BEAM STREAM
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center mb-3 border border-cyan-500/45 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    <Check className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-xs uppercase text-cyan-300 tracking-wider">BEAM STREAM COMPLETE</h4>
                  <p className="text-[10px] text-[#cbd5e1] mt-2 leading-relaxed">
                    Packet synced to node database stream. Advisor {realtor.name} system is notified.
                  </p>
                  <button
                    onClick={() => setConsultationBooked(false)}
                    className="mt-4 text-[10px] text-fuchsia-400 underline font-extrabold uppercase"
                  >
                    Initiate new stream
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  // Switch structure renderer based on active template selector
  // If not in preview AND forceNormalTheme is true, force standard elegant professional Nordic template instead of customized theme
  const activeTemplate = (isPreview || !forceNormalTheme) ? (realtor.template || 'Minimal') : 'Nordic';
  if (['Luxury', 'Vintage', 'Oasis', 'Nordic'].includes(activeTemplate)) {
    return renderLuxuryTemplate();
  } else if (['Modern', 'Neon'].includes(activeTemplate)) {
    return renderModernCyberTemplate();
  } else {
    // Falls back to Retro Pop Neo-Brutalist styles (Minimal, Techno, Bauhaus)
    return renderRetroPopTemplate();
  }
}
