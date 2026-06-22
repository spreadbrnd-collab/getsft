import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Heart, ChevronRight, MessageSquare, ArrowRight, ShieldCheck, 
  Sparkles, Award, Star, Compass, Layout, Smartphone, Globe, Landmark, BadgeCheck,
  UserCheck, LogIn, ExternalLink, RefreshCw
} from 'lucide-react';

import { Realtor, Property, Inquiry, User } from './types';
import { loadState, saveState } from './mockData';
import AuthModal from './components/AuthModal';
import LeadInquiryModal from './components/LeadInquiryModal';
import RealtorDashboard from './components/RealtorDashboard';
import RealtorProfilePage from './components/RealtorProfilePage';
import BuyerWishlist from './components/BuyerWishlist';
import PropertyDetailPage from './components/PropertyDetailPage';

type AppView = 'marketplace' | 'dashboard' | 'realtor-site' | 'buyer-portal' | 'agents-showcase';

export default function App() {
  // Global React States initialized from persistent loadState
  const [appState, setAppState] = useState(() => loadState());
  const [currentView, setCurrentView] = useState<AppView>('marketplace');
  const [selectedRealtorId, setSelectedRealtorId] = useState<string>('david');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  
  // Dialog Open Toggles
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authFormRole, setAuthFormRole] = useState<'buyer' | 'realtor'>('buyer');
  const [isLeadInquiryOpen, setIsLeadInquiryOpen] = useState(false);
  const [activeInquiryProperty, setActiveInquiryProperty] = useState<Property | null>(null);

  // Modern Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // Home search filter states
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterBeds, setFilterBeds] = useState('Any');
  const [filterIntent, setFilterIntent] = useState<'All' | 'Buy' | 'Rent'>('All');

  // Filters state with logos & advanced checkboxes
  const [filterMinBaths, setFilterMinBaths] = useState('Any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Active searched parameters trigger (locks on Search button press)
  const [searchTrigger, setSearchTrigger] = useState(false);

  // Sync state to local storage on any state updates
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Handle header blur backdrop while scrolling
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter properties where show_on_marketplace === true
  const marketplaceProperties = useMemo(() => {
    return appState.properties.filter((p) => p.show_on_marketplace === true);
  }, [appState.properties]);

  // Compute live searched listings
  const searchedProperties = useMemo(() => {
    return marketplaceProperties.filter((p) => {
      // Live dynamic listingIntent toggle (Buy / Rent)
      const matchIntent = filterIntent !== 'All' ? (p.listingIntent === filterIntent) : true;
      
      if (!matchIntent) return false;

      // Other constraints are locked behind searchTrigger or applied immediately if modified
      if (!searchTrigger) return true;

      const matchCity = filterCity ? p.city.toLowerCase().includes(filterCity.toLowerCase()) : true;
      const matchType = filterType !== 'All' ? p.propertyType === filterType : true;
      const matchMinPrice = filterMinPrice ? p.price >= parseFloat(filterMinPrice) : true;
      const matchMaxPrice = filterMaxPrice ? p.price <= parseFloat(filterMaxPrice) : true;
      const matchBeds = filterBeds !== 'Any' ? p.bedrooms >= parseInt(filterBeds) : true;
      const matchBaths = filterMinBaths !== 'Any' ? p.bathrooms >= parseInt(filterMinBaths) : true;
      const matchAmenities = selectedAmenities.length > 0 
        ? selectedAmenities.every((amenity) => p.amenities.includes(amenity))
        : true;

      return matchCity && matchType && matchMinPrice && matchMaxPrice && matchBeds && matchBaths && matchAmenities;
    });
  }, [marketplaceProperties, searchTrigger, filterCity, filterType, filterMinPrice, filterMaxPrice, filterBeds, filterIntent, filterMinBaths, selectedAmenities]);

  // Quick helper to determine active realtor for detail views
  const activeRealtor = useMemo(() => {
    return appState.realtors.find((r) => r.id === selectedRealtorId) || appState.realtors[0];
  }, [appState.realtors, selectedRealtorId]);

  // Add/remove wishlist heart mechanics
  const handleToggleWishlist = (propertyId: number) => {
    if (!appState.currentUser) {
      setAuthFormRole('buyer');
      setIsAuthOpen(true);
      return;
    }

    const updatedUsers = appState.users.map((u) => {
      if (u.email.toLowerCase() === appState.currentUser?.email.toLowerCase()) {
        const alreadySaved = u.savedPropertyIds.includes(propertyId);
        const nextSaved = alreadySaved
          ? u.savedPropertyIds.filter((id) => id !== propertyId)
          : [...u.savedPropertyIds, propertyId];
        return { ...u, savedPropertyIds: nextSaved };
      }
      return u;
    });

    const refreshedCurrentUser = updatedUsers.find(
      (u) => u.email.toLowerCase() === appState.currentUser?.email.toLowerCase()
    ) || null;

    setAppState((prev) => ({
      ...prev,
      users: updatedUsers,
      currentUser: refreshedCurrentUser
    }));
  };

  const isSavedInWishlist = (propertyId: number) => {
    if (!appState.currentUser) return false;
    return appState.currentUser.savedPropertyIds.includes(propertyId);
  };

  // Submit new inquiry lead
  const handleInquirySubmitted = (newInquiry: Inquiry) => {
    setAppState((prev) => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries]
    }));
  };

  const handleUpdateInquiries = (updatedInquiries: Inquiry[]) => {
    setAppState((prev) => ({
      ...prev,
      inquiries: updatedInquiries
    }));
  };

  const handleInitInquiry = (property: Property) => {
    setActiveInquiryProperty(property);
    setIsLeadInquiryOpen(true);
  };

  // Handle successful login or signup from AuthModal
  const handleAuthSuccess = (authenticatedUser: User) => {
    // If realtor, make sure their profile is linked in realtors array
    let updatedRealtors = [...appState.realtors];
    if (authenticatedUser.role === 'realtor' && authenticatedUser.realtorProfile) {
      const exists = appState.realtors.some((r) => r.id === authenticatedUser.id);
      if (!exists) {
        updatedRealtors = [authenticatedUser.realtorProfile, ...updatedRealtors];
      }
    }

    setAppState((prev) => {
      // Keep other system parts consistent
      const userList = prev.users.some(u => u.email.toLowerCase() === authenticatedUser.email.toLowerCase())
        ? prev.users.map(u => u.email.toLowerCase() === authenticatedUser.email.toLowerCase() ? authenticatedUser : u)
        : [...prev.users, authenticatedUser];

      return {
        ...prev,
        realtors: updatedRealtors,
        users: userList,
        currentUser: authenticatedUser
      };
    });

    // Automatically route depending on role to improve visual response
    if (authenticatedUser.role === 'realtor') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('buyer-portal');
    }
  };

  // Realtor specific updates in state from dashboard
  const handleUpdateProperties = (nextProperties: Property[]) => {
    setAppState((prev) => ({
      ...prev,
      properties: nextProperties
    }));
  };

  const handleToggleMarketplaceVisibility = (propertyId: number) => {
    const updatedProperties = appState.properties.map((p) => {
      if (p.property_id === propertyId) {
        const nextState = !p.show_on_marketplace;
        showToast(nextState 
          ? `🎉 "${p.title}" successfully published on getSFT homepage!`
          : `Removed "${p.title}" from getSFT homepage.`
        );
        return { ...p, show_on_marketplace: nextState };
      }
      return p;
    });

    setAppState((prev) => {
      const nextState = { ...prev, properties: updatedProperties };
      saveState(nextState);
      return nextState;
    });
  };

  const handleUpdateRealtorProfile = (nextProfile: Realtor) => {
    const updatedRealtors = appState.realtors.map((r) => r.id === nextProfile.id ? nextProfile : r);
    const updatedUsers = appState.users.map((u) => {
      if (u.id === nextProfile.id) {
        return { ...u, realtorProfile: nextProfile };
      }
      return u;
    });

    const refreshedCurrentUser = appState.currentUser ? (nextProfile.id === appState.currentUser.id ? { ...appState.currentUser, realtorProfile: nextProfile } : appState.currentUser) : null;

    setAppState((prev) => ({
      ...prev,
      realtors: updatedRealtors,
      users: updatedUsers,
      currentUser: refreshedCurrentUser
    }));
  };

  const handleLogout = () => {
    setAppState((prev) => ({
      ...prev,
      currentUser: null
    }));
    setCurrentView('marketplace');
  };

  const handleResetFilters = () => {
    setFilterCity('');
    setFilterType('All');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterBeds('Any');
    setFilterMinBaths('Any');
    setFilterIntent('All');
    setSelectedAmenities([]);
    setSearchTrigger(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-teal-700/25 selection:text-teal-950 flex flex-col justify-between">
      
      {/* Dynamic Blur topbar Menu */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-neutral-150 py-1.5 shadow-xs' 
          : 'bg-white/40 tracking-tight border-neutral-100 py-2'
      }`}>
        <div className="max-w-7xl mx-auto px-2 md:px-4 flex items-center justify-between">
          
          {/* Brand logo */}
          <button 
            onClick={() => {
              setSelectedPropertyId(null);
              setFilterIntent('All');
              setCurrentView('marketplace');
            }}
            className="flex items-center gap-1.5 font-display font-medium text-sm sm:text-lg text-black group cursor-pointer"
            id="brand-logo-home"
          >
            <div className="w-6.5 h-6.5 bg-neutral-900 hover:scale-97 transition-all rounded-md flex items-center justify-center text-white text-[11px] font-serif font-black">
              sft
            </div>
            <span className="tracking-tight font-black hover:opacity-85 text-teal-750">getsft</span>
          </button>

          {/* Navigation Items (Visible on mobile too!) */}
          {currentView !== 'dashboard' && (
            <nav className="flex items-center gap-2.5 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-mono tracking-wider uppercase text-neutral-500">
              <button 
                onClick={() => {
                  setSelectedPropertyId(null);
                  setCurrentView('marketplace');
                  setFilterIntent('Buy');
                  setSearchTrigger(false);
                }}
                className={`hover:text-black transition-colors ${currentView === 'marketplace' && filterIntent === 'Buy' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : ''}`}
                id="nav-buy"
              >
                Buy
              </button>
              <button 
                onClick={() => {
                  setSelectedPropertyId(null);
                  setCurrentView('marketplace');
                  setFilterIntent('Rent');
                  setSearchTrigger(false);
                }}
                className={`hover:text-black transition-colors ${currentView === 'marketplace' && filterIntent === 'Rent' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : ''}`}
                id="nav-rent"
              >
                Rent
              </button>
              <button 
                onClick={() => {
                  setSelectedPropertyId(null);
                  setCurrentView('agents-showcase');
                }}
                className={`hover:text-black transition-colors ${currentView === 'agents-showcase' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : ''}`}
                id="nav-agents"
              >
                Realtors
              </button>
            </nav>
          )}

          {/* User Sign-In/Register Flow trigger drawer */}
          <div className="flex items-center gap-2">
            {appState.currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {appState.currentUser.role === 'realtor' ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-sans tracking-wide font-semibold transition-all cursor-pointer ${
                        currentView === 'dashboard'
                          ? 'bg-neutral-950 text-white'
                          : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                      }`}
                      id="link-to-dashboard-btn"
                    >
                      Realtor Console
                    </button>
                    <button
                      onClick={() => setCurrentView('buyer-portal')}
                      className={`px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-sans tracking-wide font-semibold transition-all cursor-pointer ${
                        currentView === 'buyer-portal'
                          ? 'bg-teal-800 text-white'
                          : 'bg-white text-neutral-500 hover:text-black border border-neutral-200'
                      }`}
                      id="link-to-portal-btn-alt"
                    >
                      Buyer View
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setCurrentView('buyer-portal')}
                      className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-sans tracking-wide font-semibold transition-all cursor-pointer ${
                        currentView === 'buyer-portal'
                          ? 'bg-teal-850 text-white'
                          : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                      }`}
                      id="link-to-portal-btn"
                    >
                      User Dashboard
                    </button>
                    <button
                      onClick={() => {
                        const updatedCurrentUser = {
                          ...appState.currentUser!,
                          role: 'realtor' as const
                        };
                        if (!updatedCurrentUser.realtorProfile) {
                          updatedCurrentUser.realtorProfile = {
                            id: updatedCurrentUser.id,
                            name: updatedCurrentUser.name,
                            title: 'SFT Licensed Luxury Realtor',
                            profileImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&h=400&q=80',
                            coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                            city: 'Vancouver',
                            phone: '+1 (604) 555-0100',
                            whatsapp: '16045550100',
                            bio: 'SFT independent licensed luxury real estate advisor.',
                            experience: 5,
                            languages: ['English'],
                            specializations: ['Luxury Lofts', 'Waterfront Estates'],
                            template: 'Minimal'
                          };
                        }
                        
                        setAppState((prev) => {
                          const updatedUsers = prev.users.map((u) =>
                            u.email.toLowerCase() === updatedCurrentUser.email.toLowerCase() ? updatedCurrentUser : u
                          );
                          const hasRealtor = prev.realtors.some((r) => r.id === updatedCurrentUser.id);
                          const updatedRealtors = hasRealtor
                            ? prev.realtors
                            : [updatedCurrentUser.realtorProfile!, ...prev.realtors];
                          return {
                            ...prev,
                            users: updatedUsers,
                            realtors: updatedRealtors,
                            currentUser: updatedCurrentUser
                          };
                        });
                        
                        setCurrentView('dashboard');
                        showToast('Realtor Portal active! Access all specialized advisory controls.');
                      }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer font-bold"
                      id="link-to-upgrade-realtor-btn"
                    >
                      Realtor Console
                    </button>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1 px-2 border border-neutral-200 hover:border-black text-neutral-500 hover:text-black text-[9px] font-mono rounded-full uppercase transition-colors shrink-0 cursor-pointer"
                  id="top-logout-btn"
                >
                  Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <button
                  onClick={() => {
                    setAuthFormRole('buyer');
                    setIsAuthOpen(true);
                  }}
                  className="text-[10px] sm:text-xs font-mono tracking-wide text-neutral-500 hover:text-black hover:underline cursor-pointer"
                  id="header-signin-btn"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setAuthFormRole('realtor');
                    setIsAuthOpen(true);
                  }}
                  className="hidden sm:block px-4 py-1.5 bg-teal-850 hover:bg-teal-900 text-white rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-[0.98] font-bold"
                  id="header-join-realtor"
                >
                  Realtor Platform
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className={`flex-1 pt-12 ${currentView === 'dashboard' ? 'p-0 pt-0' : ''}`}>
        
        <AnimatePresence mode="wait">

          {selectedPropertyId !== null ? (
            <motion.div
              key="property-detail-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-2 sm:px-4 py-4"
            >
              <PropertyDetailPage
                property={appState.properties.find(p => p.property_id === selectedPropertyId)!}
                realtor={appState.realtors.find(r => r.id === appState.properties.find(p => p.property_id === selectedPropertyId)?.owner_id) || appState.realtors[0]}
                currentUser={appState.currentUser}
                onBack={() => setSelectedPropertyId(null)}
                onInquirySubmit={handleInquirySubmitted}
                isSaved={isSavedInWishlist(selectedPropertyId)}
                onToggleSaved={(id) => handleToggleWishlist(id)}
              />
            </motion.div>
          ) : (
            <>
              {/* SECTION: MAIN MARKETPLACE */}
              {currentView === 'marketplace' && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 pb-12"
                >
                  
                  {/* Home Hero Header */}
                  <section className="max-w-7xl mx-auto px-2 md:px-4 text-center space-y-3 pt-4 md:pt-6 pb-2">
                    <span className="font-mono text-[10px] tracking-widest text-teal-850 uppercase block animate-fade-in bg-teal-50 px-3.5 py-1.5 rounded-full w-fit mx-auto border border-teal-100 mt-2 font-medium">
                      Premium Canadian Pro-Tech Platform & Advisory
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-light text-neutral-950 tracking-tight leading-tight max-w-4xl mx-auto">
                      Find Homes Directly From <br className="hidden sm:inline" /><span className="font-semibold text-teal-850 hover:opacity-95 border-b-3 border-teal-600/40 pb-0.5">Trusted Local Realtors</span>
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-500 max-w-2xl mx-auto leading-relaxed font-sans mt-1">
                      Discover structural masterpieces directly from certified independent realtors. Zero middle-tier directory inflation. Direct connections. Absolute architectural clarity.
                    </p>
                  </section>

                  {/* Home Search Card (Apple/Linear pure whites) with Buy/Rent Tabs & Richer Filters */}
                  <section className="max-w-5xl mx-auto px-2">
                <div className="bg-[#ffffff] p-5 rounded-[24px] border border-neutral-150 shadow-xs flex flex-col gap-4">
                  
                  {/* Transaction Mode Selector */}
                  <div className="flex border-b border-neutral-100 pb-3 flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFilterIntent('All');
                          setSearchTrigger(true);
                        }}
                        className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          filterIntent === 'All' ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-50 text-[#666666] hover:bg-neutral-100'
                        }`}
                        id="tab-all-intent"
                      >
                        All Portfolios
                      </button>
                      <button
                        onClick={() => {
                          setFilterIntent('Buy');
                          setSearchTrigger(true);
                        }}
                        className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          filterIntent === 'Buy' ? 'bg-teal-850 text-white font-bold' : 'bg-neutral-50 text-[#666666] hover:bg-neutral-100'
                        }`}
                        id="tab-buy-intent"
                      >
                        ● Buy masterworks
                      </button>
                      <button
                        onClick={() => {
                          setFilterIntent('Rent');
                          setSearchTrigger(true);
                        }}
                        className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          filterIntent === 'Rent' ? 'bg-teal-855 text-white font-bold' : 'bg-neutral-50 text-[#666666] hover:bg-neutral-100'
                        }`}
                        id="tab-rent-intent"
                      >
                        ❖ Rent listings
                      </button>
                    </div>

                    <span className="font-mono text-[10px] text-neutral-400 hidden sm:inline">
                      NO MIDDLE-TIER AGENCIES • DIRECT REPRESENTATION
                    </span>
                  </div>

                  {/* Select parameters */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono uppercase tracking-wide text-teal-850 font-bold">Preferred Location</label>
                      <input
                        type="text"
                        placeholder="Type preferred location/city..."
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="w-full px-3 py-2 bg-teal-50/20 hover:bg-teal-50/40 focus:bg-white border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl text-xs font-sans outline-none transition-all placeholder:text-neutral-400 font-medium"
                        id="market-city"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono uppercase tracking-wide text-teal-850 font-bold">Property Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 bg-teal-50/20 hover:bg-teal-50/40 focus:bg-white border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl text-xs font-sans outline-none transition-all cursor-pointer font-medium"
                        id="market-type"
                      >
                        <option value="All">All Structural Types</option>
                        <option value="Estate">Estate</option>
                        <option value="Villa">Villa</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Townhouse">Townhouse</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono uppercase tracking-wide text-teal-850 font-bold">Min Budget</label>
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={filterMinPrice}
                        onChange={(e) => setFilterMinPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-teal-50/20 hover:bg-teal-50/40 focus:bg-white border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl text-xs font-sans outline-none transition-all placeholder:text-neutral-400 font-medium"
                        id="market-min-price"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono uppercase tracking-wide text-teal-850 font-bold">Max Budget</label>
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-teal-50/20 hover:bg-teal-50/40 focus:bg-white border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl text-xs font-sans outline-none transition-all placeholder:text-neutral-400 font-medium"
                        id="market-max-price"
                      />
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <label className="block text-[9px] font-mono uppercase tracking-wide text-teal-850 font-bold">Minimum Beds</label>
                      <select
                        value={filterBeds}
                        onChange={(e) => setFilterBeds(e.target.value)}
                        className="w-full px-3 py-2 bg-teal-50/20 hover:bg-teal-50/40 focus:bg-white border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 rounded-xl text-xs font-sans outline-none transition-all cursor-pointer font-medium"
                        id="market-beds"
                      >
                        <option value="Any">Any Beds</option>
                        <option value="2">2+ Bedrooms</option>
                        <option value="3">3+ Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                      </select>
                    </div>

                  </div>

                  {/* Advanced Multi-Filters Panel: Bathrooms & Amenities checklist */}
                  <div className="p-4 bg-neutral-50/65 rounded-xl border border-neutral-100/80 space-y-3.5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="space-y-1 ">
                        <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Minimum Bathrooms</label>
                        <div className="flex gap-2 mt-1">
                          {['Any', '2', '3', '5'].map((bVal) => (
                            <button
                              key={bVal}
                              onClick={() => {
                                setFilterMinBaths(bVal);
                                setSearchTrigger(true);
                              }}
                              className={`px-3 py-1 rounded text-xs font-sans transition-all cursor-pointer ${
                                filterMinBaths === bVal 
                                  ? 'bg-teal-800 text-white font-bold' 
                                  : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                              }`}
                            >
                              {bVal === 'Any' ? 'Any' : `${bVal}+ Baths`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 flex-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Curated Amenities Selection</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {['Infinity Pool', 'Art Gallery Foyer', 'Custom Wine Room', 'Heated Floor slab', 'Passive Solar collection', 'Sky Garden Loft', 'Rooftop Lounge'].map((amenity) => {
                            const isSelected = selectedAmenities.includes(amenity);
                            return (
                              <button
                                key={amenity}
                                onClick={() => {
                                  const next = isSelected 
                                    ? selectedAmenities.filter(a => a !== amenity)
                                    : [...selectedAmenities, amenity];
                                  setSelectedAmenities(next);
                                  setSearchTrigger(true);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-sans transition-all cursor-pointer border ${
                                  isSelected 
                                    ? 'bg-neutral-900 border-neutral-900 text-white' 
                                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '} {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-4 border-t border-neutral-100">
                    <span className="text-xs font-mono text-neutral-400">
                      Searching list of {marketplaceProperties.length} verified listings
                    </span>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-full text-xs font-mono uppercase"
                        id="reset-filter-btn"
                      >
                        Reset Filters
                      </button>
                      
                      <button
                        onClick={() => setSearchTrigger(true)}
                        className="flex-1 md:flex-none px-6 py-2 bg-black hover:bg-neutral-900 text-white rounded-full text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        id="search-homes-btn"
                      >
                        <Search className="w-4 h-4" />
                        Search Homes Catalog
                      </button>
                    </div>
                  </div>

                </div>
              </section>

              {/* Latest Listings Section */}
              <section className="max-w-7xl mx-auto px-2 sm:px-4 space-y-4">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-teal-800 uppercase block font-semibold">Pristine Architecture</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-neutral-950 mt-0.5">
                    {searchTrigger ? 'Search Results' : 'Latest Curated Residencies'}
                  </h2>
                </div>

                {searchedProperties.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-50 rounded-[20px] border border-dashed border-neutral-200">
                    <p className="text-neutral-500 italic text-xs font-sans">No matching verified residences available within this filter slice.</p>
                    <button onClick={handleResetFilters} className="text-xs font-mono text-black underline mt-2 block mx-auto">See all listings</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchedProperties.map((p) => {
                      const hostRealtor = appState.realtors.find((r) => r.id === p.owner_id);
                      return (
                        <div 
                          key={p.property_id}
                          onClick={() => setSelectedPropertyId(p.property_id)}
                          className="bg-white border border-[#eaeaea] rounded-[20px] overflow-hidden group hover:border-teal-700 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                        >
                          {/* Photo with heart like wishlist button */}
                          <div className="relative aspect-3/2 overflow-hidden bg-neutral-100 shrink-0">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                            />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(p.property_id);
                              }}
                              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-all cursor-pointer ${
                                isSavedInWishlist(p.property_id)
                                  ? 'bg-[#134e4a] text-white'
                                  : 'bg-white/80 hover:bg-white text-neutral-500 hover:text-black'
                              }`}
                              id={`wishlist-heart-btn-${p.property_id}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isSavedInWishlist(p.property_id) ? 'fill-current' : ''}`} />
                            </button>

                            <div className="absolute bottom-3 left-3 bg-teal-800 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded">
                              For {p.listingIntent || 'Sale'}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              
                              {/* Representative brief */}
                              {hostRealtor && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRealtorId(hostRealtor.id);
                                    setCurrentView('realtor-site');
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 hover:text-teal-700 hover:underline"
                                  id={`host-realtor-link-${p.property_id}`}
                                >
                                  <img
                                    src={hostRealtor.profileImage}
                                    alt={hostRealtor.name}
                                    referrerPolicy="no-referrer"
                                    className="w-3.5 h-3.5 rounded-full object-cover"
                                  />
                                  <span>Represented by {hostRealtor.name.split(' ')[0]}</span>
                                </button>
                              )}

                              <div className="space-y-0.5">
                                <h3 className="font-display font-medium text-lg leading-tight text-neutral-900 group-hover:text-teal-750 transition-colors">
                                  {p.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                                  <span>{p.address}, {p.city}</span>
                                </div>
                              </div>

                              {/* Specs row (Always visible on mobile & desktop) */}
                              <div className="flex items-center gap-3.5 py-1.5 text-xs text-neutral-600 font-sans border-y border-neutral-100/60 my-2">
                                <span className="flex items-center gap-1">
                                  <span className="font-bold text-neutral-950">{p.bedrooms}</span> Bed
                                </span>
                                <span className="text-neutral-250">•</span>
                                <span className="flex items-center gap-1">
                                  <span className="font-bold text-neutral-950">{p.bathrooms}</span> Bath
                                </span>
                                <span className="text-neutral-250">•</span>
                                <span className="flex items-center gap-1 font-mono">
                                  <span className="font-bold text-neutral-955">{p.area.toLocaleString()}</span> sft
                                </span>
                                <span className="text-neutral-250">•</span>
                                <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded tracking-wide shrink-0 font-mono">
                                  {p.propertyType}
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-sans">{p.description}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                              <span className="font-display font-semibold text-lg text-neutral-950 block font-sans">
                                ${p.price.toLocaleString()}
                                {p.listingIntent === 'Rent' && <span className="text-[10px] font-mono text-neutral-400 font-normal">/mo</span>}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPropertyId(p.property_id);
                                }}
                                className="px-4 py-2 bg-teal-850 hover:bg-teal-900 text-white text-[10px] font-mono uppercase tracking-wider rounded transition-colors font-bold"
                                id={`inquire-property-btn-${p.property_id}`}
                              >
                                View Details & Enquire
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Featured Realtors */}
              <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
                <div>
                  <span className="font-mono text-xs tracking-widest text-[#999999] uppercase block">Independent Network</span>
                  <h2 className="text-3xl font-display font-medium tracking-tight text-neutral-950 mt-1">
                    Featured SFT Realtors
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {appState.realtors.map((r) => {
                    const rListings = appState.properties.filter(p => p.owner_id === r.id && p.show_on_marketplace).length;
                    return (
                      <div 
                        key={r.id}
                        className="p-8 bg-white border border-[#eaeaea] rounded-[24px] flex flex-col items-center text-center justify-between"
                      >
                        <div className="space-y-4 w-full">
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-neutral-200">
                            <img
                              src={r.profileImage}
                              alt={r.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-semibold text-neutral-950">{r.name}</h3>
                            <span className="text-xs font-mono text-neutral-400 block mt-0.5 uppercase tracking-wide">{r.title}</span>
                          </div>
                          
                          <p className="text-xs text-neutral-500 max-w-xs mx-auto line-clamp-2 leading-relaxed font-sans">
                            {r.bio}
                          </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-neutral-100/60 w-full flex items-center justify-between">
                          <span className="font-mono text-xs text-neutral-400">{rListings} listing{rListings !== 1 ? 's' : ''} on SFT</span>
                          <button
                            onClick={() => {
                              setSelectedRealtorId(r.id);
                              setCurrentView('realtor-site');
                            }}
                            className="px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-full text-[10px] font-mono uppercase tracking-wider cursor-pointer font-bold"
                            id={`view-realtor-site-${r.id}`}
                          >
                            View Site
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* High End Testimonials Section */}
              <section className="max-w-4xl mx-auto px-6 text-center space-y-4 py-8">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">Uncompromising Standards</span>
                <blockquote className="font-serif italic text-xl md:text-2xl text-stone-800 leading-relaxed">
                  "GetSFT returns autonomy to direct, bespoke architectural brokers in the luxury segment. The UI leaves behind traditional MLS noise, delivering absolute structural clarity."
                </blockquote>
                <cite className="block text-xs font-mono tracking-wider uppercase text-neutral-500 not-italic mt-3">
                  — Julianne Mercer, Mercer Estate Holdings
                </cite>
              </section>

            </motion.div>
          )}

          {/* SECTION: ROUTED REALTOR CUSTOM WEBSITE VIEW */}
          {currentView === 'realtor-site' && (
            <motion.div
              key="realtor-site"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RealtorProfilePage
                realtor={activeRealtor}
                properties={appState.properties}
                onInquirySubmit={handleInquirySubmitted}
                onBackToMarketplace={() => setCurrentView('marketplace')}
                onPropertyClick={(id) => setSelectedPropertyId(id)}
                onTogglePublishMarketplace={handleToggleMarketplaceVisibility}
                isPreview={false}
              />
            </motion.div>
          )}

          {/* SECTION: ROUTED DOCK AGENT CONSOLE */}
          {currentView === 'dashboard' && appState.currentUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RealtorDashboard
                currentUser={appState.currentUser}
                properties={appState.properties}
                inquiries={appState.inquiries}
                onUpdateProperties={handleUpdateProperties}
                onUpdateRealtorProfile={handleUpdateRealtorProfile}
                onUpdateInquiries={handleUpdateInquiries}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {/* SECTION: BUYER CONSOLE PORTAL */}
          {currentView === 'buyer-portal' && appState.currentUser && (
            <motion.div
              key="buyer-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BuyerWishlist
                currentUser={appState.currentUser}
                properties={appState.properties}
                inquiries={appState.inquiries}
                onRemoveFromWishlist={(id) => handleToggleWishlist(id)}
                onExploreMarketplace={() => setCurrentView('marketplace')}
                onSelectPropertyToInquire={(p) => handleInitInquiry(p)}
                onSwitchToRealtor={() => {
                  if (!appState.currentUser) return;
                  const updatedCurrentUser = {
                    ...appState.currentUser,
                    role: 'realtor' as const
                  };
                  if (!updatedCurrentUser.realtorProfile) {
                    updatedCurrentUser.realtorProfile = {
                      id: updatedCurrentUser.id,
                      name: updatedCurrentUser.name,
                      title: 'SFT Licensed Luxury Realtor',
                      profileImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&h=400&q=80',
                      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                      city: 'Vancouver',
                      phone: '+1 (604) 555-0100',
                      whatsapp: '16045550100',
                      bio: 'SFT independent licensed luxury real estate advisor.',
                      experience: 5,
                      languages: ['English'],
                      specializations: ['Luxury Lofts', 'Waterfront Estates'],
                      template: 'Minimal'
                    };
                  }
                  
                  setAppState((prev) => {
                    const updatedUsers = prev.users.map((u) =>
                      u.email.toLowerCase() === updatedCurrentUser.email.toLowerCase() ? updatedCurrentUser : u
                    );
                    const hasRealtor = prev.realtors.some((r) => r.id === updatedCurrentUser.id);
                    const updatedRealtors = hasRealtor
                      ? prev.realtors
                      : [updatedCurrentUser.realtorProfile!, ...prev.realtors];
                    return {
                      ...prev,
                      users: updatedUsers,
                      realtors: updatedRealtors,
                      currentUser: updatedCurrentUser
                    };
                  });
                  
                  setCurrentView('dashboard');
                  showToast('Realtor Portal active! Access all specialized advisory controls.');
                }}
              />
            </motion.div>
          )}

          {/* SECTION: ROUTED VERIFIED REALTORS SHOWCASE */}
          {currentView === 'agents-showcase' && (
            <motion.div
              key="agents-showcase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12"
            >
              <div>
                <span className="font-mono text-xs tracking-widest text-teal-800 uppercase block font-bold">Global Network</span>
                <h1 className="text-4xl font-display font-medium text-black mt-1">SFT Exclusive Realtors</h1>
                <p className="text-sm text-neutral-500 mt-1 max-w-xl font-sans">Connecting discerning buyers directly with elite, licensed luxury realtors in Canada.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {appState.realtors.map((r) => {
                  const rListings = appState.properties.filter(p => p.owner_id === r.id && p.show_on_profile);
                  return (
                    <div key={r.id} className="bg-white border border-[#eaeaea] rounded-[24px] p-8 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={r.profileImage}
                            alt={r.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-2xl object-cover border border-neutral-100"
                          />
                          <div>
                            <h3 className="font-display font-bold text-lg text-neutral-900 leading-tight">{r.name}</h3>
                            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block mt-0.5">{r.title}</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 font-sans leading-relaxed">{r.bio}</p>

                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-[#999999] uppercase tracking-wider block">Areas representing</span>
                          <p className="text-xs text-neutral-800 font-sans">{r.specializations.join(' • ')}</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-400">{rListings.length} direct representations</span>
                        <button
                          onClick={() => {
                            setSelectedRealtorId(r.id);
                            setCurrentView('realtor-site');
                          }}
                          className="px-5 py-2 bg-neutral-950 text-white hover:bg-black rounded-full text-xs font-mono uppercase tracking-wider"
                          id={`agents-view-${r.id}`}
                        >
                          Visit Site
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

            </>
          )}

        </AnimatePresence>

      </div>

      {/* Corporate Minimal Footer */}
      <footer className="border-t border-[#eaeaea] py-4 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-neutral-400 font-mono">
            <span>© 2026 getsft.</span>
            <span>•</span>
            <span className="underline">SFT Independent Certified Brokerage Services</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[#999999]">
            <button onClick={() => showToast('Discerning terms & conditions policies are saved in your local sandbox model.')} className="hover:text-black">Terms of Use</button>
            <button onClick={() => showToast('Privacy directives comply with luxury standard guidelines.')} className="hover:text-black">Privacy Policy</button>
            <button onClick={() => showToast('Direct support channel: desk@getsft.com')} className="hover:text-black">Contact Desk</button>
          </div>
        </div>
      </footer>

      {/* Modern Pop-up Toast Element */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-neutral-900 border border-neutral-800 text-white p-3.5 px-5 rounded-xl shadow-2xl flex items-center justify-between gap-4 font-mono text-[11px]"
          >
            <span className="leading-relaxed">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-neutral-400 hover:text-white font-bold ml-2 shrink-0 border border-neutral-800 hover:border-neutral-500 rounded px-1.5 py-0.5"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Interactive Portal Forms */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authFormRole}
      />

      {activeInquiryProperty && (
        <LeadInquiryModal
          isOpen={isLeadInquiryOpen}
          onClose={() => setIsLeadInquiryOpen(false)}
          property={activeInquiryProperty}
          realtorName={
            appState.realtors.find((r) => r.id === activeInquiryProperty.owner_id)?.name || 'Managing Advisor'
          }
          onInquirySubmitted={(inq) => {
            handleInquirySubmitted(inq);
          }}
          defaultBuyerName={appState.currentUser?.name || ''}
          defaultBuyerEmail={appState.currentUser?.email || ''}
        />
      )}

    </div>
  );
}
