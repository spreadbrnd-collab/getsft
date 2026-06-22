import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileText, Users, Globe, SwatchBook, LineChart, Settings, CreditCard, LogOut,
  Plus, Eye, CheckCircle, Trash2, ArrowUpRight, DollarSign, Calendar, Sliders, GlobeIcon, 
  MapPin, Check, Sparkles, Send, Mail, Phone, BookOpen, Edit, PhoneCall
} from 'lucide-react';
import { User, Property, Inquiry, ActiveTab, Realtor } from '../types';
import RealtorProfilePage from './RealtorProfilePage';

interface RealtorDashboardProps {
  currentUser: User;
  properties: Property[];
  inquiries: Inquiry[];
  onUpdateProperties: (properties: Property[]) => void;
  onUpdateRealtorProfile: (profile: Realtor) => void;
  onUpdateInquiries: (inquiries: Inquiry[]) => void;
  onLogout: () => void;
}

export default function RealtorDashboard({
  currentUser,
  properties,
  inquiries,
  onUpdateProperties,
  onUpdateRealtorProfile,
  onUpdateInquiries,
  onLogout,
}: RealtorDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [profile, setProfile] = useState<Realtor>(
    currentUser.realtorProfile || {
      id: currentUser.id,
      name: currentUser.name,
      title: 'Licensed Luxury Advisor',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      city: 'Vancouver',
      phone: '+1 (555) 019-2831',
      whatsapp: '15550192831',
      bio: 'Representing rare locations and structural design integrity.',
      experience: 5,
      languages: ['English'],
      specializations: ['Modernist Villas'],
      template: 'Minimal'
    }
  );

  // New Listing creation dialog states
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newBeds, setNewBeds] = useState('3');
  const [newBaths, setNewBaths] = useState('2.5');
  const [newArea, setNewArea] = useState('3200');
  const [newType, setNewType] = useState<'Penthouse' | 'Villa' | 'Estate' | 'Townhouse' | 'Apartment'>('Villa');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState(profile.city);
  const [newProvince, setNewProvince] = useState('British Columbia');
  const [newPostal, setNewPostal] = useState('');
  const [newOpenHouse, setNewOpenHouse] = useState('');
  const [newAmenities, setNewAmenities] = useState('Infinity Pool, Modern Kitchen, Oak Floors');
  const [newImgUrl, setNewImgUrl] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
  const [showOnProfile, setShowOnProfile] = useState(true);
  const [listOnMarketplace, setListOnMarketplace] = useState(true);

  // Expanded detailed state fields
  const [newIntent, setNewIntent] = useState<'Buy' | 'Rent'>('Buy');
  const [newReraId, setNewReraId] = useState('');
  const [newPossessionDate, setNewPossessionDate] = useState('');
  const [newProjectSize, setNewProjectSize] = useState('');
  const [newProjectAreaCount, setNewProjectAreaCount] = useState('');
  const [newBhkConfig, setNewBhkConfig] = useState('');
  const [newAvgPricePerSft, setNewAvgPricePerSft] = useState('');
  const [newBuilderName, setNewBuilderName] = useState('');
  const [newBuilderDescription, setNewBuilderDescription] = useState('');
  const [newHighlightStr, setNewHighlightStr] = useState('');
  
  // Local benchmarks hotspots
  const [landmarkSchool, setLandmarkSchool] = useState('');
  const [landmarkMetro, setLandmarkMetro] = useState('');
  const [landmarkHospital, setLandmarkHospital] = useState('');
  const [landmarkMall, setLandmarkMall] = useState('');
  const [landmarkRestaurant, setLandmarkRestaurant] = useState('');

  // Track replied leads to avoid blocky window.alerts
  const [repliedInquiries, setRepliedInquiries] = useState<Record<string, boolean>>({});
  const [activePlan, setActivePlan] = useState('GetSFT Launch');

  // Active Live preview of Realtor site inside Website builder tab
  const [isLivePreviewing, setIsLivePreviewing] = useState(false);

  // Local dashboard toast message notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Filter properties owned by this realtor
  const myProperties = useMemo(() => {
    return properties.filter((p) => p.owner_id === currentUser.id);
  }, [properties, currentUser.id]);

  // Filter inquiries belonging to this realtor's listings
  const myInquiries = useMemo(() => {
    return inquiries.filter((inq) => inq.realtor_id === currentUser.id);
  }, [inquiries, currentUser.id]);

  // Core metrics computation
  const metrics = useMemo(() => {
    const totalListings = myProperties.length;
    const activeListings = myProperties.filter(p => p.status === 'Active').length;
    const marketplaceListings = myProperties.filter(p => p.show_on_marketplace).length;
    const totalLeads = myInquiries.length;
    
    // Calculate actual distinct buyer saves by loading local storage state
    let totalSaves = 0;
    try {
      const existingRaw = localStorage.getItem('getsft_mvp_state');
      if (existingRaw) {
        const stateObj = JSON.parse(existingRaw);
        if (stateObj && Array.isArray(stateObj.users)) {
          const myPropIds = myProperties.map(p => p.property_id);
          stateObj.users.forEach((u: any) => {
            if (u.role === 'buyer' && Array.isArray(u.savedPropertyIds)) {
              u.savedPropertyIds.forEach((pid: number) => {
                if (myPropIds.includes(pid)) {
                  totalSaves++;
                }
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse buyer saves", e);
    }

    // Default simulation fallback if no buyers exist in storage yet to ensure it doesn't look empty
    if (totalSaves === 0) {
      totalSaves = myProperties.reduce((acc, p) => acc + (p.property_id % 3 + 1) * 2, 8);
    }
    
    // Hardcoded mock views to match user interface criteria elegantly
    const viewsThisMonth = 1420 + (totalListings * 120);

    return {
      totalListings,
      activeListings,
      marketplaceListings,
      totalLeads,
      totalSaves,
      viewsThisMonth
    };
  }, [myProperties, myInquiries]);

  // Settings forms fields
  const [settingsName, setSettingsName] = useState(profile.name);
  const [settingsTitle, setSettingsTitle] = useState(profile.title);
  const [settingsPhone, setSettingsPhone] = useState(profile.phone);
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(profile.whatsapp);
  const [settingsCity, setSettingsCity] = useState(profile.city);
  const [settingsBio, setSettingsBio] = useState(profile.bio);
  const [settingsLang, setSettingsLang] = useState(profile.languages.join(', '));
  const [settingsSpecs, setSettingsSpecs] = useState(profile.specializations.join(', '));
  const [settingsDomain, setSettingsDomain] = useState(profile.customDomain || `${currentUser.id}.getsft.com`);
  const [settingsExp, setSettingsExp] = useState(profile.experience.toString());
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);

  const resetFormFields = () => {
    setEditingPropertyId(null);
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
    setNewBeds('3');
    setNewBaths('2.5');
    setNewArea('3200');
    setNewType('Villa');
    setNewAddress('');
    setNewCity(profile.city);
    setNewProvince('British Columbia');
    setNewPostal('');
    setNewOpenHouse('');
    setNewAmenities('Infinity Pool, Modern Kitchen, Oak Floors');
    setNewImgUrl('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    setShowOnProfile(true);
    setListOnMarketplace(true);
    setNewIntent('Buy');
    setNewReraId('');
    setNewPossessionDate('');
    setNewProjectSize('');
    setNewProjectAreaCount('');
    setNewBhkConfig('');
    setNewAvgPricePerSft('');
    setNewBuilderName('');
    setNewBuilderDescription('');
    setNewHighlightStr('');
    setLandmarkSchool('');
    setLandmarkMetro('');
    setLandmarkHospital('');
    setLandmarkMall('');
    setLandmarkRestaurant('');
  };

  const handleStartEditListing = (p: Property) => {
    setEditingPropertyId(p.property_id);
    setNewTitle(p.title);
    setNewDesc(p.description);
    setNewPrice(p.price.toString());
    setNewBeds(p.bedrooms.toString());
    setNewBaths(p.bathrooms.toString());
    setNewArea(p.area.toString());
    setNewType(p.propertyType);
    setNewAddress(p.address);
    setNewCity(p.city);
    setNewProvince(p.province || 'British Columbia');
    setNewPostal(p.postalCode || '');
    setNewOpenHouse(p.openHouseDate || '');
    setNewAmenities(p.amenities.join(', '));
    setNewImgUrl(p.images[0] || '');
    setShowOnProfile(p.show_on_profile);
    setListOnMarketplace(p.show_on_marketplace);
    setNewIntent(p.listingIntent || 'Buy');
    setNewReraId(p.reraId || '');
    setNewPossessionDate(p.possessionDate || '');
    setNewProjectSize(p.projectSize || '');
    setNewProjectAreaCount(p.projectAreaCount || '');
    setNewBhkConfig(p.bhkConfig || '');
    setNewAvgPricePerSft(p.avgPricePerSft || '');
    setNewBuilderName(p.builderName || '');
    setNewBuilderDescription(p.builderDescription || '');
    setNewHighlightStr(p.highlights ? p.highlights.join(', ') : '');
    setLandmarkSchool(p.landmarks?.school || '');
    setLandmarkMetro(p.landmarks?.metro || '');
    setLandmarkHospital(p.landmarks?.hospital || '');
    setLandmarkMall(p.landmarks?.mall || '');
    setLandmarkRestaurant(p.landmarks?.restaurant || '');

    setIsCreatingListing(true);
  };

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newAddress) return;

    if (editingPropertyId !== null) {
      const updatedProperties = properties.map((p) => {
        if (p.property_id === editingPropertyId) {
          const editedProperty: Property = {
            ...p,
            title: newTitle,
            description: newDesc,
            price: parseFloat(newPrice),
            bedrooms: parseInt(newBeds),
            bathrooms: parseFloat(newBaths),
            area: parseInt(newArea),
            propertyType: newType,
            amenities: newAmenities.split(',').map(s => s.trim()).filter(Boolean),
            address: newAddress,
            city: newCity,
            province: newProvince,
            postalCode: newPostal,
            images: [newImgUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
            openHouseDate: newOpenHouse || undefined,
            show_on_profile: showOnProfile,
            show_on_marketplace: listOnMarketplace,
            listingIntent: newIntent,
            monthlyRentEstimate: newIntent === 'Rent' ? parseFloat(newPrice) : Math.round(parseFloat(newPrice) * 0.0035),
            reraId: newReraId || undefined,
            possessionDate: newPossessionDate || undefined,
            projectSize: newProjectSize || undefined,
            projectAreaCount: newProjectAreaCount || undefined,
            bhkConfig: newBhkConfig || undefined,
            avgPricePerSft: newAvgPricePerSft || undefined,
            builderName: newBuilderName || undefined,
            builderDescription: newBuilderDescription || undefined,
            highlights: newHighlightStr ? newHighlightStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            landmarks: (landmarkSchool || landmarkMetro || landmarkHospital || landmarkMall || landmarkRestaurant) ? {
              school: landmarkSchool || undefined,
              metro: landmarkMetro || undefined,
              hospital: landmarkHospital || undefined,
              mall: landmarkMall || undefined,
              restaurant: landmarkRestaurant || undefined
            } : undefined
          };
          return editedProperty;
        }
        return p;
      });

      onUpdateProperties(updatedProperties);
      showToast(`🎉 "${newTitle}" listing updated successfully!`);
      setIsCreatingListing(false);
      resetFormFields();
      return;
    }

    const addedProperty: Property = {
      property_id: Math.floor(1000 + Math.random() * 9000),
      owner_id: currentUser.id,
      title: newTitle,
      description: newDesc,
      price: parseFloat(newPrice),
      bedrooms: parseInt(newBeds),
      bathrooms: parseFloat(newBaths),
      area: parseInt(newArea),
      propertyType: newType,
      amenities: newAmenities.split(',').map(s => s.trim()).filter(Boolean),
      address: newAddress,
      city: newCity,
      province: newProvince,
      postalCode: newPostal,
      images: [newImgUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      openHouseDate: newOpenHouse || undefined,
      status: 'Active',
      show_on_profile: showOnProfile,
      show_on_marketplace: listOnMarketplace,
      listingIntent: newIntent,
      monthlyRentEstimate: newIntent === 'Rent' ? parseFloat(newPrice) : Math.round(parseFloat(newPrice) * 0.0035),
      reraId: newReraId || undefined,
      possessionDate: newPossessionDate || undefined,
      projectSize: newProjectSize || undefined,
      projectAreaCount: newProjectAreaCount || undefined,
      bhkConfig: newBhkConfig || undefined,
      avgPricePerSft: newAvgPricePerSft || undefined,
      builderName: newBuilderName || undefined,
      builderDescription: newBuilderDescription || undefined,
      highlights: newHighlightStr ? newHighlightStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      landmarks: (landmarkSchool || landmarkMetro || landmarkHospital || landmarkMall || landmarkRestaurant) ? {
        school: landmarkSchool || undefined,
        metro: landmarkMetro || undefined,
        hospital: landmarkHospital || undefined,
        mall: landmarkMall || undefined,
        restaurant: landmarkRestaurant || undefined
      } : undefined
    };

    const updated = [addedProperty, ...properties];
    onUpdateProperties(updated);
    showToast(`🎉 "${newTitle}" listing published successfully!`);
    setIsCreatingListing(false);
    resetFormFields();
  };

  const handleDeleteListing = (propertyId: number) => {
    const updated = properties.filter(p => p.property_id !== propertyId);
    onUpdateProperties(updated);
  };

  const handleToggleProfileVisibility = (propertyId: number) => {
    const updated = properties.map(p => {
      if (p.property_id === propertyId) {
        return { ...p, show_on_profile: !p.show_on_profile };
      }
      return p;
    });
    onUpdateProperties(updated);
  };

  const handleToggleMarketplaceVisibility = (propertyId: number) => {
    const updated = properties.map(p => {
      if (p.property_id === propertyId) {
        return { ...p, show_on_marketplace: !p.show_on_marketplace };
      }
      return p;
    });
    onUpdateProperties(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Realtor = {
      ...profile,
      name: settingsName,
      title: settingsTitle,
      phone: settingsPhone,
      whatsapp: settingsPhone.replace(/[^0-9]/g, ''),
      city: settingsCity,
      bio: settingsBio,
      experience: parseInt(settingsExp || '5'),
      languages: settingsLang.split(',').map(s => s.trim()).filter(Boolean),
      specializations: settingsSpecs.split(',').map(s => s.trim()).filter(Boolean),
      customDomain: settingsDomain
    };

    setProfile(updatedProfile);
    onUpdateRealtorProfile(updatedProfile);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleSelectTemplate = (templateName: 'Luxury' | 'Minimal' | 'Modern' | 'Vintage' | 'Oasis' | 'Techno' | 'Bauhaus' | 'Nordic' | 'Neon') => {
    const updatedProfile = { ...profile, template: templateName };
    setProfile(updatedProfile);
    onUpdateRealtorProfile(updatedProfile);
  };

  // Nav side links matching layout specifications
  const sidebarItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'listings', name: 'Listings', icon: FileText },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'website', name: 'Website', icon: Globe },
    { id: 'templates', name: 'Templates', icon: SwatchBook },
    { id: 'analytics', name: 'Analytics', icon: LineChart },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* Absolute Header banner indicator */}
      <div className="absolute top-0 right-0 left-0 bg-neutral-900 text-white text-[10px] uppercase font-mono tracking-widest text-center py-1 z-30 flex items-center justify-center gap-2 px-4 md:hidden">
        <span>SFT Hub Console v2.60</span>
      </div>

      {/* Modern Cupertino Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#fdfdfd] border-b md:border-b-0 md:border-r border-[#eaeaea] p-6 flex flex-col justify-between shrink-0 pt-10 md:pt-6">
        <div>
          {/* Platform Identity */}
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-serif font-black text-sm">
              SFT
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-tight tracking-tight block">GetSFT CRM</span>
              <span className="text-[10px] font-mono tracking-wider text-gray-400 block uppercase">Independent workspace</span>
            </div>
          </div>

          {/* Quick info of authenticated Agent */}
          <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-100/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-200">
              <img
                src={profile.profileImage}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-sans font-medium text-xs text-neutral-800 truncate block">{profile.name}</span>
              <span className="font-mono text-[9px] text-[#999999] truncate block uppercase tracking-wider">{profile.title}</span>
            </div>
          </div>

          {/* Sidebar Tabs List */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setIsLivePreviewing(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-black text-white shadow-xs' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-black'
                  }`}
                  id={`sidebar-tab-${item.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 pt-6 border-t border-[#eaeaea]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium text-red-600 hover:bg-red-50/50 transition-colors"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main workspace container */}
      <main className="flex-1 bg-[#ffffff] p-6 md:p-10 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* Sub-view: Live Preview of Realtor page */}
          {isLivePreviewing ? (
            <motion.div
              key="live-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#eaeaea] pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-display font-medium tracking-tight">Public Website Dynamic View</h2>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
                    REPRESENTING DOMAIN: {profile.customDomain || `${currentUser.id}.getsft.com`}
                  </p>
                </div>
                <button
                  onClick={() => setIsLivePreviewing(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs rounded-full uppercase tracking-wider cursor-pointer"
                  id="exit-preview-btn"
                >
                  Close Live Preview
                </button>
              </div>

              <div className="border border-neutral-100 rounded-[24px] overflow-hidden shadow-xl bg-white">
                <RealtorProfilePage
                  realtor={profile}
                  properties={properties}
                  onInquirySubmit={(inq) => {
                    // Prepend new inquiry directly in state so they can instantly view in Leeds tab!
                    inquiries.unshift(inq);
                  }}
                  isPreview={true}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Interactive Workspace</span>
                    <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Welcome, {profile.name.split(' ')[0]}
                    </h1>
                  </header>

                  {/* Curate metrics cards with premium colorful minimalist bento accents */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-[24px] border border-emerald-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="font-mono text-[10px] tracking-wider text-emerald-700 uppercase font-black">✦ Active Properties</span>
                      <h3 className="text-3xl font-display font-black tracking-tight text-emerald-900 mt-2">{metrics.activeListings}</h3>
                      <p className="text-[11px] text-emerald-600/70 font-sans mt-2 font-medium">Currently active in directory</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50/40 rounded-[24px] border border-indigo-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="font-mono text-[10px] tracking-wider text-indigo-700 uppercase font-black">✦ Listing Saves</span>
                      <h3 className="text-3xl font-display font-black tracking-tight text-indigo-900 mt-2">{metrics.totalSaves}</h3>
                      <p className="text-[11px] text-indigo-600/70 font-sans mt-2 font-medium">Distinct client additions</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50/40 rounded-[24px] border border-cyan-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="font-mono text-[10px] tracking-wider text-cyan-700 uppercase font-black">✦ Leads Received</span>
                      <h3 className="text-3xl font-display font-black tracking-tight text-cyan-900 mt-2">{metrics.totalLeads}</h3>
                      <p className="text-[11px] text-cyan-600/70 font-sans mt-2 font-medium">Live listening inbox leads</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50/40 rounded-[24px] border border-rose-200/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="font-mono text-[10px] tracking-wider text-rose-700 uppercase font-black">✦ Monthly Views</span>
                      <h3 className="text-3xl font-display font-black tracking-tight text-rose-900 mt-2">{metrics.viewsThisMonth}</h3>
                      <p className="text-[11px] text-rose-600/70 font-sans mt-2 font-medium">Total listing impressions</p>
                    </div>
                  </div>

                  {/* MINI ADVANCED ANALYTICS CHART SUITE - Highly colorful and minimalist */}
                  <div className="p-6 bg-gradient-to-r from-neutral-900 to-slate-900 text-white rounded-[28px] border border-slate-800 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Real-time Performance Metrics</span>
                        <h3 className="text-lg font-display font-medium text-white">Client Traction History</h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block"></span> Leads</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block"></span> Views (k/10)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 block"></span> Saves</span>
                      </div>
                    </div>

                    <div className="relative h-44 w-full mt-2">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.15" strokeDasharray="2,2" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.15" strokeDasharray="2,2" />
                        <line x1="0" y1="75" x2="100" y2="75" stroke="#334155" strokeWidth="0.15" strokeDasharray="2,2" />
                        
                        {/* Area glow under Leads path */}
                        <path d="M 0 95 Q 20 60, 40 45 T 80 20 T 100 15 L 100 100 L 0 100 Z" fill="url(#leadsGlow)" opacity="0.15" />
                        <path d="M 0 92 Q 20 85, 40 65 T 80 40 T 100 30 L 100 100 L 0 100 Z" fill="url(#viewsGlow)" opacity="0.10" />

                        {/* Interactive Paths */}
                        <path d="M 0 95 Q 20 60, 40 45 T 80 20 T 100 15" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M 0 92 Q 20 85, 40 65 T 80 40 T 100 30" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M 0 85 Q 20 70, 40 50 T 80 35 T 100 25" fill="none" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" strokeDasharray="1,1" />

                        {/* Definitions */}
                        <defs>
                          <linearGradient id="leadsGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="viewsGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Floating dots representing dynamic hotspots on the chart */}
                      <span className="absolute left-[39%] top-[40%] w-2.5 h-2.5 bg-emerald-400 ring-4 ring-emerald-500/35 rounded-full block animate-ping"></span>
                      <span className="absolute left-[39%] top-[40%] w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white rounded-full block"></span>

                      <span className="absolute left-[79%] top-[16%] w-2.5 h-2.5 bg-cyan-400 ring-4 ring-cyan-500/35 rounded-full block"></span>
                      
                      {/* X Axis Labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] font-mono text-slate-400 px-1 pt-1 border-t border-slate-800">
                        <span>JUNE 15</span>
                        <span>JUNE 16</span>
                        <span>JUNE 17</span>
                        <span>JUNE 18</span>
                        <span>JUNE 19</span>
                        <span>TODAY</span>
                      </div>
                    </div>
                  </div>

                  {/* Split Section: Recent Leads + Quick links */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Leads Preview */}
                    <div className="lg:col-span-2 p-8 bg-white border border-neutral-100 rounded-[24px]">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-display font-medium tracking-tight text-neutral-900">Recent Buyer Leads</h3>
                        <button
                          onClick={() => setActiveTab('leads')}
                          className="text-xs font-mono text-teal-800 hover:text-teal-900 underline font-bold"
                          id="overview-all-leads-link"
                        >
                          View Leeds Inbox
                        </button>
                      </div>

                      {myInquiries.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm font-sans italic">
                          No inquiries received yet on your exclusive listings.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {myInquiries.slice(0, 3).map((inq) => (
                            <div key={inq.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-neutral-900">{inq.name}</span>
                                  <span className="text-[10px] font-mono bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded">
                                    {inq.property_title}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{inq.message}</p>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400 shrink-0 self-start md:self-center">
                                {new Date(inq.date).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Access Sidebar Actions */}
                    <div className="p-8 bg-[#fdfdfd] rounded-[24px] border border-neutral-150 space-y-4">
                      <h3 className="text-sm font-mono tracking-wider uppercase text-teal-800 font-bold">Quick Actions</h3>
                      
                      <button
                        onClick={() => setIsCreatingListing(true)}
                        className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        id="overview-quick-add-listing"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Listing
                      </button>

                      <button
                        onClick={() => setIsLivePreviewing(true)}
                        className="w-full py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 transition-transform cursor-pointer"
                        id="overview-quick-preview-site"
                      >
                        <Eye className="w-4 h-4" />
                        Preview My Website
                      </button>

                      <div className="pt-4 border-t border-neutral-200/50">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Current Theme Link</span>
                        <p className="text-xs font-sans text-neutral-800 font-bold mt-1.5 flex items-center gap-2">
                          <GlobeIcon className="w-4 h-4 text-teal-800" />
                          Template: <span className="underline">{profile.template}</span>
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: LISTINGS */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Catalog Hub</span>
                      <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                        Properties Directory
                      </h1>
                    </div>
                    <button
                      onClick={() => setIsCreatingListing(true)}
                      className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                      id="listings-add-new-btn"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Listing
                    </button>
                  </header>

                  <div className="bg-white border border-neutral-100 rounded-[24px] overflow-hidden">
                    <div className="p-6 border-b border-neutral-100">
                      <h3 className="font-sans font-medium text-sm text-neutral-800">Your Representations</h3>
                      <p className="text-xs text-neutral-500 mt-1">Configure visibility and settings instantly. Changes save client-side.</p>
                    </div>

                    {myProperties.length === 0 ? (
                      <div className="text-center py-20 text-neutral-400 text-sm font-sans italic">
                        No property listings created yet. Click "Add New Listing" to get started.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 font-mono text-[10px] tracking-wider uppercase text-neutral-400 border-b border-neutral-100">
                              <th className="py-4 px-6 font-medium">Property</th>
                              <th className="py-4 px-6 font-medium">Dimension Info</th>
                              <th className="py-4 px-6 font-medium">Site Visibility</th>
                              <th className="py-4 px-6 font-medium text-center">GetSFT Platform Status</th>
                              <th className="py-4 px-6 font-medium text-right">Selling Price</th>
                              <th className="py-4 px-6 font-medium text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {myProperties.map((p) => (
                              <tr key={p.property_id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="py-4 px-4 md:px-6">
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={p.images[0]}
                                      alt="Thumbnail"
                                      referrerPolicy="no-referrer"
                                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                                    />
                                    <div>
                                      <span className="font-sans font-medium text-xs text-neutral-900 leading-tight block">{p.title}</span>
                                      <span className="font-mono text-[9px] text-[#999999] tracking-wider uppercase block">{p.address}, {p.city}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="font-sans text-xs text-neutral-600 block">
                                    {p.bedrooms} Beds, {p.bathrooms} Baths
                                  </span>
                                  <span className="font-mono text-[10px] text-neutral-400">
                                    {p.area} Sq. Ft. (SFT)
                                  </span>
                                </td>
                                <td className="py-4 px-4 md:px-6">
                                  {/* Custom Site Visibility toggle */}
                                  <button
                                    onClick={() => handleToggleProfileVisibility(p.property_id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                      p.show_on_profile
                                        ? 'bg-neutral-100 text-neutral-900 font-bold border border-neutral-300'
                                        : 'bg-neutral-50 text-neutral-400 border border-transparent'
                                    }`}
                                    title="Toggle if visible on your personalized Realtor Website"
                                    id={`toggle-profile-site-${p.property_id}`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${p.show_on_profile ? 'bg-indigo-600' : 'bg-neutral-300'}`}></span>
                                    {p.show_on_profile ? 'Visible on Realtor Page' : 'Hidden on Realtor Page'}
                                  </button>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  {/* High-visibility primary SFT Platform toggle requested by user */}
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <button
                                      onClick={() => {
                                        handleToggleMarketplaceVisibility(p.property_id);
                                        const willBePublished = !p.show_on_marketplace;
                                        if (willBePublished) {
                                          showToast(`🎉 "${p.title}" successfully published directly to GetSFT marketplace platform!`);
                                        } else {
                                          showToast(`Removed "${p.title}" from local GetSFT marketplace indices.`);
                                        }
                                      }}
                                      className={`px-4.5 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                                        p.show_on_marketplace
                                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 hover:from-emerald-600 hover:to-teal-700 hover:shadow-sm scale-[1.03]'
                                          : 'bg-amber-50/50 hover:bg-amber-55 text-amber-700 border-amber-200 hover:border-amber-300 hover:text-amber-800'
                                      }`}
                                      id={`btn-publish-to-getsft-${p.property_id}`}
                                    >
                                      {p.show_on_marketplace ? (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                          ★ LIVE ON GETSFT
                                        </>
                                      ) : (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                          ☆ PUBLISH TO GETSFT
                                        </>
                                      )}
                                    </button>
                                    <span className="text-[9px] text-neutral-400 font-sans block max-w-[170px] leading-tight">
                                      {p.show_on_marketplace 
                                        ? "Visible to all SFT buyers worldwide" 
                                        : "Private: Only viewed on your realtor page"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right font-display font-medium text-xs text-neutral-900 leading-tight">
                                  ${p.price.toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleStartEditListing(p)}
                                      className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                      id={`edit-property-btn-${p.property_id}`}
                                      title="Edit property parameters"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteListing(p.property_id)}
                                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      id={`delete-property-btn-${p.property_id}`}
                                      title="Delete property"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: LEADS */}
              {activeTab === 'leads' && (
                <div className="space-y-6">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Communications</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Leads Received
                    </h1>
                  </header>

                  <div className="bg-white border border-neutral-100 rounded-[24px] overflow-hidden">
                    <div className="p-6 border-b border-neutral-100">
                      <h3 className="font-sans font-medium text-sm text-neutral-800">Direct Inquiries</h3>
                      <p className="text-xs text-neutral-500 mt-1">These messages are delivered fully client-side and sent directly to you from listings.</p>
                    </div>

                    {myInquiries.length === 0 ? (
                      <div className="text-center py-20 text-neutral-400 text-sm font-sans italic">
                        No inquiries received yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {myInquiries.map((inq) => (
                          <div key={inq.id} className="p-6 hover:bg-neutral-50/40 transition-colors flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-sans font-medium text-sm text-neutral-900">{inq.name}</span>
                                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded uppercase">
                                  {inq.property_title}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {new Date(inq.date).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs text-neutral-600 font-sans leading-relaxed bg-neutral-50 p-4 border border-neutral-100/70 rounded-xl italic">
                                "{inq.message}"
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500">
                                <a href={`mailto:${inq.email}`} className="hover:underline flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {inq.email}
                                </a>
                                <a href={`tel:${inq.phone}`} className="hover:underline flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {inq.phone}
                                </a>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setRepliedInquiries(prev => ({ ...prev, [inq.id]: true }));
                              }}
                              className={`px-4 py-2 border rounded-xl text-xs font-mono tracking-wide self-start md:self-center cursor-pointer transition-all duration-200 ${
                                repliedInquiries[inq.id]
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                  : 'bg-neutral-900 border-teal-700 hover:bg-neutral-800 text-white'
                              }`}
                              id={`reply-lead-btn-${inq.id}`}
                              disabled={!!repliedInquiries[inq.id]}
                            >
                              {repliedInquiries[inq.id] ? 'Response Sent ✓' : 'Send Response'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: WEBSITE */}
              {activeTab === 'website' && (
                <div className="space-y-8">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Custom Publishing</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Website Custom Domain Builder
                    </h1>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Website configuration details */}
                    <div className="lg:col-span-2 space-y-6">
                      <section className="bg-white border border-neutral-100 rounded-[24px] p-8 space-y-6">
                        <h3 className="text-lg font-display font-medium">Domain Settings</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                              SFT Subdomain
                            </label>
                            <div className="flex items-center">
                              <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-200 text-xs text-neutral-500 font-mono rounded-l-lg">
                                getsft.com/
                              </span>
                              <input
                                type="text"
                                disabled
                                value={currentUser.id}
                                className="flex-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 text-xs font-mono rounded-r-lg outline-none cursor-not-allowed"
                                id="website-getsft-id"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                              Custom Brand URL
                            </label>
                            <input
                              type="text"
                              value={settingsDomain}
                              onChange={(e) => setSettingsDomain(e.target.value)}
                              placeholder="e.g. vancouvervillas.com"
                              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 text-xs font-mono rounded-lg outline-none focus:border-black"
                              id="website-custom-domain"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl flex items-start gap-4">
                          <GlobeIcon className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-semibold text-neutral-800 block">Automatic SSL & Proxies</span>
                            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                              GetSFT automatically binds Cloudflare SSL certificates to custom broker domains. Changes resolve within minutes.
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Cover & Profile Images Section */}
                      <section className="bg-white border border-neutral-100 rounded-[24px] p-8 space-y-6">
                        <h3 className="text-lg font-display font-medium">Media Framing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Profile Avatar Portrait Image URL</label>
                            <input
                              type="text"
                              value={profile.profileImage}
                              onChange={(e) => {
                                const up = { ...profile, profileImage: e.target.value };
                                setProfile(up);
                                onUpdateRealtorProfile(up);
                              }}
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] font-mono rounded-lg outline-none focus:border-black"
                              id="website-avatar-url"
                            />
                            <div className="w-16 h-16 rounded-xl overflow-hidden mt-3 bg-neutral-100 border border-neutral-200">
                              <img src={profile.profileImage} alt="Avatar portrait" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Cover Header Background Image URL</label>
                            <input
                              type="text"
                              value={profile.coverImage}
                              onChange={(e) => {
                                const up = { ...profile, coverImage: e.target.value };
                                setProfile(up);
                                onUpdateRealtorProfile(up);
                              }}
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] font-mono rounded-lg outline-none focus:border-black"
                              id="website-cover-url"
                            />
                            <div className="h-16 rounded-xl overflow-hidden mt-3 bg-neutral-100 border border-neutral-200 relative">
                              <img src={profile.coverImage} alt="Cover layout" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>
                      </section>

                    </div>

                    {/* Preview Prompt & Selection */}
                    <div className="space-y-6">
                      <div className="bg-[#111111] text-white rounded-[24px] p-8 space-y-6 shadow-xl">
                        <Sparkles className="w-8 h-8 text-[#dddddd]" />
                        <div>
                          <h4 className="font-display font-medium text-lg leading-tight">Live Preview Hub</h4>
                          <p className="text-xs text-[#999999] mt-2 leading-relaxed">
                            Interact with your custom styled real-estate catalog as buyers will experience it.
                          </p>
                        </div>

                        <button
                          onClick={() => setIsLivePreviewing(true)}
                          className="w-full py-3 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-mono tracking-wider uppercase font-semibold cursor-pointer text-center"
                          id="website-launch-preview-btn"
                        >
                          Launch Live Preview
                        </button>
                      </div>

                      <div className="p-6 bg-[#fafafa] rounded-[24px] border border-neutral-100/50 text-neutral-500">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-2">Active Styling layout</span>
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-neutral-800 animate-pulse"></span>
                          <p className="text-xs font-sans text-neutral-800 font-bold uppercase tracking-wider">{profile.template} Theme Engine</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Curate Skin Types</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Templates Gallery
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">Select a template below to instantaneously restyle your public profile and listings pages. No coding required.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        name: 'Luxury',
                        tag: 'Template A',
                        desc: 'Imperial Burgundy & Golden Terracotta. Features high-society serif typography, luxurious golden borders, and warm stone card textures. The pinnacle of pedigree.',
                        badge: 'Regal Gold Velvet',
                      },
                      {
                        name: 'Minimal',
                        tag: 'Template B',
                        desc: 'Retro Pop Neo-Brutalist Comic style. Features high-energy sunbaked yellow backdrop, thick outline borders, and colorful flat paper-blocks. Pure, vibrant, and fun!',
                        badge: 'Vibrant Neo-Pop Comic',
                      },
                      {
                        name: 'Modern',
                        tag: 'Template C',
                        desc: 'Cyberpunk Aurora & Vaporwave Sunset. Features deep space indigo and glowing neon cyan & fuchsia border layers with a futuristic interactive consultation matrix.',
                        badge: 'Hyper-Tech Cyber Sunset',
                      },
                      {
                        name: 'Vintage',
                        tag: 'Template D',
                        desc: 'Venetian Imperial Gothic. Features deep forest greens, rich antique brass trims, antique serif typography, sepia paper backgrounds, and heavy editorial prestige.',
                        badge: 'Venetian Gold Heritage',
                      },
                      {
                        name: 'Oasis',
                        tag: 'Template E',
                        desc: 'Tropical Beachfront Cove. Golden sands sunset pinks, deep turquoise sea ocean wave gradients, and vacation vibes with cursive flowy headings.',
                        badge: 'Fiji Turquoise sunset',
                      },
                      {
                        name: 'Techno',
                        tag: 'Template F',
                        desc: 'Glitch Brutalist Industrial. Bright neon crimson highlights, heavy charcoal wireframes, and raw structural monospace alignment templates with grid telemetry.',
                        badge: 'Cd-Cadmium Orange wireframe',
                      },
                      {
                        name: 'Bauhaus',
                        tag: 'Template G',
                        desc: 'Swiss Bauhaus Modernism. Strict primary blue, red, & yellow layout blocks, geometric proportions, thick clean framing, and bold grotesque lettering.',
                        badge: 'Swiss Grotesque Primary',
                      },
                      {
                        name: 'Nordic',
                        tag: 'Template H',
                        desc: 'Organic Earth & Elements. Soft sage and moss greens, warm cozy oatmeal backing cards, dark pine wood typography, and rounded organic custom-crafted shapes.',
                        badge: 'Copenhagen Moss Sage',
                      },
                      {
                        name: 'Neon',
                        tag: 'Template I',
                        desc: 'Space Ultraviolet Sky. Alien deep cosmic violet backspace, glowing radio-active neon lime outlines, and real-time custom laser pulse accents.',
                        badge: 'Cosmic Ultraviolet Glow',
                      }
                    ].map((temp) => {
                      const isSelected = profile.template === temp.name;
                      return (
                        <div
                          key={temp.name}
                          onClick={() => handleSelectTemplate(temp.name as any)}
                          className={`p-8 bg-white border rounded-[24px] cursor-pointer transition-all hover:-translate-y-1 relative duration-200 ${
                            isSelected 
                              ? 'border-black ring-1 ring-black shadow-lg bg-[#fafafa]' 
                              : 'border-neutral-100 hover:shadow-md'
                          }`}
                          id={`template-card-${temp.name}`}
                        >
                          {isSelected && (
                            <span className="absolute top-6 right-6 px-3 py-1 bg-black text-white text-[9px] font-mono tracking-wider uppercase rounded-full">
                              Selected
                            </span>
                          )}
                          <span className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase block">{temp.tag}</span>
                          <h3 className="text-2xl font-display font-semibold tracking-tight text-neutral-900 mt-2">{temp.name}</h3>
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded uppercase mt-2 inline-block font-mono font-medium">
                            {temp.badge}
                          </span>
                          <p className="text-xs text-neutral-500 mt-4 leading-relaxed font-sans">{temp.desc}</p>

                          <div className={`mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold ${isSelected ? 'text-black' : 'text-neutral-400'}`}>
                            <span>Apply Preset Skin</span>
                            <span>→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">SFT Telemetry telemetry</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Performance Telemetry
                    </h1>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SVG Chart 1: Traffic views */}
                    <div className="bg-white border border-neutral-100 rounded-[24px] p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">Monthly Traffic Trends</span>
                          <h4 className="text-lg font-display font-medium text-neutral-900 mt-1">Unique Client views</h4>
                        </div>
                        <span className="text-xs font-mono text-emerald-600 font-bold">+12% vs last cycle</span>
                      </div>

                      {/* Pure SVG Line Chart (completely robust, zero library bugs) */}
                      <div className="h-64 flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 500 200">
                          {/* Grid Lines */}
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f1f1" strokeWidth="1" />
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f1f1" strokeWidth="1" />
                          <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f1f1" strokeWidth="1" />
                          
                          {/* Chart Path */}
                          <path
                            d="M 20,180 Q 100,120 180,150 T 340,80 T 480,40"
                            fill="none"
                            stroke="#111111"
                            strokeWidth="3.5"
                          />
                          <circle cx="180" cy="150" r="4" fill="#000000" />
                          <circle cx="340" cy="80" r="4" fill="#000000" />
                          <circle cx="480" cy="40" r="5" fill="#000000" />
                          
                          {/* Labels */}
                          <text x="20" y="195" fill="#999" fontSize="9" fontFamily="JetBrains Mono">APR</text>
                          <text x="180" y="195" fill="#999" fontSize="9" fontFamily="JetBrains Mono">MAY</text>
                          <text x="340" y="195" fill="#999" fontSize="9" fontFamily="JetBrains Mono">JUN</text>
                          <text x="450" y="195" fill="#999" fontSize="9" fontFamily="JetBrains Mono">CURRENT</text>
                        </svg>
                      </div>
                    </div>

                    {/* SVG Chart 2: Leads captures */}
                    <div className="bg-white border border-neutral-100 rounded-[24px] p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">Conversion Funnels</span>
                          <h4 className="text-lg font-display font-medium text-neutral-900 mt-1">Inquiry counts Captured</h4>
                        </div>
                        <span className="text-xs font-mono text-neutral-800 font-bold">{metrics.totalLeads} total records</span>
                      </div>

                      {/* Beautiful minimal bar layout */}
                      <div className="h-64 flex items-end justify-between px-6 pt-10">
                        {[
                          { month: 'January', val: '24', h: '40%' },
                          { month: 'February', val: '31', h: '55%' },
                          { month: 'March', val: '19', h: '35%' },
                          { month: 'April', val: '45', h: '75%' },
                          { month: 'Current', val: Math.max(10, metrics.totalLeads * 14).toString(), h: '90%' }
                        ].map((bar) => (
                          <div key={bar.month} className="flex flex-col items-center gap-3 w-12">
                            <span className="font-mono text-[10px] font-bold text-neutral-900">{bar.val}</span>
                            <div className="w-6 bg-black rounded-t-lg transition-all duration-500" style={{ height: bar.h }}></div>
                            <span className="font-mono text-[8px] text-gray-400 uppercase tracking-wider">{bar.month.substring(0,3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 7: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Agent Setup</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Profile Console Settings
                    </h1>
                  </header>

                  <div className="bg-white border border-neutral-100 rounded-[24px] p-8">
                    {settingsSaveSuccess && (
                      <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-mono uppercase tracking-wider mb-6">
                        <Check className="w-4 h-4" />
                        <span>Profile details stored securely locally! Check your live website preview.</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Full Professional Name</label>
                          <input
                            type="text"
                            required
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white"
                            id="settings-fullname-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Official Title Line</label>
                          <input
                            type="text"
                            required
                            value={settingsTitle}
                            onChange={(e) => setSettingsTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white"
                            id="settings-title-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Direct Telephone</label>
                          <input
                            type="text"
                            required
                            value={settingsPhone}
                            onChange={(e) => setSettingsPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white"
                            id="settings-phone-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">WhatsApp Protocol (Numerical)</label>
                          <input
                            type="text"
                            required
                            value={settingsWhatsapp}
                            onChange={(e) => setSettingsWhatsapp(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white"
                            id="settings-whatsapp-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Experience (Years active)</label>
                          <input
                            type="number"
                            required
                            value={settingsExp}
                            onChange={(e) => setSettingsExp(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white"
                            id="settings-experience-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Target Representation City</label>
                        <input
                          type="text"
                          required
                          value={settingsCity}
                          onChange={(e) => setSettingsCity(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none"
                          id="settings-city-input"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Languages (Comma separated)</label>
                          <input
                            type="text"
                            value={settingsLang}
                            onChange={(e) => setSettingsLang(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono outline-none focus:border-black focus:bg-white"
                            id="settings-languages-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Specializations Focus Areas</label>
                          <input
                            type="text"
                            value={settingsSpecs}
                            onChange={(e) => setSettingsSpecs(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono outline-none focus:border-black focus:bg-white"
                            id="settings-specs-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Professional Brokerage Biography</label>
                        <textarea
                          rows={4}
                          value={settingsBio}
                          onChange={(e) => setSettingsBio(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black focus:bg-white resize-none"
                          id="settings-biography-input"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-mono tracking-wider uppercase cursor-pointer"
                        id="save-settings-btn"
                      >
                        Store Information
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 8: BILLING */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <header>
                    <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">System Tiers</span>
                    <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                      Subscription & Scale Tiers
                    </h1>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        name: 'GetSFT Launch',
                        price: '$0',
                        feat: ['Up to 3 listings', 'SFT CDN site sub-domain getsft.com/username', 'Standard Minimal template layout', 'Email leads forwarding'],
                        badge: 'Sandbox Free',
                        btn: 'Active Sandbox Tier',
                        active: true
                      },
                      {
                        name: 'Professional Advisor',
                        price: '$89',
                        period: '/ month',
                        feat: ['Unlimited active listings documents', 'Custom high performance domains (e.g. agentsite.com)', 'Full Templates unlock matching Luxury / Minimal / Modern layouts', 'Bespoke SVG traffic metrics charts', 'Premium WhatsApp click-to-chat action drawers'],
                        badge: 'Discerning Choice',
                        btn: 'Upgrade Advisor Suite',
                        active: false
                      },
                      {
                        name: 'Elegance Collective',
                        price: '$240',
                        period: '/ month',
                        feat: ['Everything in Professional Advisor tier', 'Unlimited custom domain bridges (multilingual/multi-domain)', 'Handcrafted 1-on-1 boutique visual styling consulting calls', 'Early access features: MLS syncing & CSV bulk listing uploads'],
                        badge: 'Agency Luxury',
                        btn: 'Pre-order Elegance Tier',
                        active: false
                      }
                    ].map((t) => {
                      const isActive = t.name === activePlan;
                      const tier = { ...t, active: isActive };
                      return (
                        <div
                          key={tier.name}
                          className={`p-8 bg-white border rounded-[24px] flex flex-col justify-between h-[450px] relative ${
                            isActive 
                              ? 'border-teal-700 ring-2 ring-teal-700/50 shadow-md' 
                              : 'border-neutral-100'
                          }`}
                          id={`billing-tier-${tier.name}`}
                        >
                          {isActive && (
                            <span className="absolute top-6 right-6 px-3.5 py-1 bg-teal-800 text-white text-[9px] font-mono tracking-wider uppercase font-bold rounded-full">
                              Active Plan
                            </span>
                          )}
                          <div>
                            <span className="font-mono text-[9px] tracking-wider uppercase text-neutral-400 block">{tier.badge}</span>
                            <h3 className="text-xl font-display font-medium text-neutral-900 mt-2">{tier.name}</h3>
                            
                            <div className="mt-4 flex items-baseline">
                              <span className="text-3xl font-display font-black text-black">{tier.price}</span>
                              {tier.period && <span className="text-xs text-neutral-400 font-mono ml-1">{tier.period}</span>}
                            </div>

                            <ul className="mt-6 space-y-2.5 text-xs text-neutral-500 font-sans leading-relaxed">
                              {tier.feat.map((f, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            onClick={() => {
                              if (!isActive) {
                                setActivePlan(tier.name);
                              }
                            }}
                            className={`w-full py-3.5 text-xs font-sans font-medium rounded-xl border text-center transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed font-bold'
                                : 'bg-teal-800 text-white border-teal-800 hover:bg-teal-900'
                            }`}
                            id={`upgrade-button-${tier.name}`}
                            disabled={isActive}
                          >
                            {isActive ? 'Active Plan ✓' : tier.btn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modal: Create/Edit Property Listing */}
      <AnimatePresence>
        {isCreatingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetFormFields}
              className="fixed inset-0 bg-black opacity-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-[640px] bg-white p-8 rounded-[24px] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={resetFormFields}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-50 transition-colors"
                id="close-create-listing-modal"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>

              <div className="mb-6">
                <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
                  {editingPropertyId !== null ? 'Architecture document editor' : 'Architecture catalog creator'}
                </span>
                <h3 className="text-2xl font-display font-medium text-neutral-900 mt-2 font-display">
                  {editingPropertyId !== null ? `Edit Exclusive Asset #${editingPropertyId}` : 'Publish Exclusive Asset'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {editingPropertyId !== null ? 'Modify existing parameters for this property listing record.' : 'Only one document will be created. We never duplicate property records.'}
                </p>
              </div>

              <form onSubmit={handleCreateListingSubmit} className="space-y-4 font-sans text-xs">
                {/* LISTING INTENT SELECTION */}
                <div className="bg-teal-50/20 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-neutral-800 uppercase tracking-wide">Operational Intent</span>
                    <span className="text-[10px] text-neutral-500 block">Is this item listed for absolute purchase or monthly rent?</span>
                  </div>
                  <div className="flex gap-1 bg-neutral-200/50 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setNewIntent('Buy')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        newIntent === 'Buy' ? 'bg-black text-white shadow-3xs' : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      For Sale / Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIntent('Rent')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        newIntent === 'Rent' ? 'bg-black text-white shadow-3xs' : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Asset Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Cascades Neopolis"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg outline-none"
                      id="new-listing-title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                      {newIntent === 'Rent' ? 'Monthly Rent Price ($ or ₹)' : 'Listing Sale Price ($ or ₹)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={newIntent === 'Rent' ? 'e.g. 194000' : 'e.g. 44800000'}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg outline-none"
                      id="new-listing-price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Detailed Architectural Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Bespoke finishes, low-iron insulated acoustics paneling, WELL premium features..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg outline-none resize-none"
                    id="new-listing-desc"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      required
                      value={newBeds}
                      onChange={(e) => setNewBeds(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-beds"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newBaths}
                      onChange={(e) => setNewBaths(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-baths"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Super Area (SFT)</label>
                    <input
                      type="number"
                      required
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-area"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Property Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-type"
                    >
                      <option value="Villa">Villa</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Estate">Estate</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neopolis, Kokapet"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Agent City Location</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-city"
                    />
                  </div>
                </div>

                {/* PREMIUM REALTOR PORTFOLIO DETAILS */}
                <div className="p-4 bg-[#fcfbf9] border border-neutral-150 rounded-xl space-y-4">
                  <span className="block text-[11px] font-bold text-teal-800 uppercase tracking-wider">✦ Advanced Project Specifications (Ideal for Realtors)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">RERA Registration ID</label>
                      <input
                        type="text"
                        placeholder="e.g. P02400009538"
                        value={newReraId}
                        onChange={(e) => setNewReraId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Possession Starts</label>
                      <input
                        type="text"
                        placeholder="e.g. Mar, 2030"
                        value={newPossessionDate}
                        onChange={(e) => setNewPossessionDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">BHK Configuration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3.5, 4, 4.5 BHK"
                        value={newBhkConfig}
                        onChange={(e) => setNewBhkConfig(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Avg Rate per SFT</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹11.5 K/sq.ft"
                        value={newAvgPricePerSft}
                        onChange={(e) => setNewAvgPricePerSft(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Project Land Area</label>
                      <input
                        type="text"
                        placeholder="e.g. 7.34 Acres"
                        value={newProjectAreaCount}
                        onChange={(e) => setNewProjectAreaCount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Total Size (Towers/Units)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Buildings - 1189 units"
                        value={newProjectSize}
                        onChange={(e) => setNewProjectSize(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Builder / Developer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GHR Lakshmi Urban Blocks"
                        value={newBuilderName}
                        onChange={(e) => setNewBuilderName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Project Highlights (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="Premium Living, Concept by UHA London, Concierge Service"
                        value={newHighlightStr}
                        onChange={(e) => setNewHighlightStr(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1 text-neutral-500">Builder Description Profile</label>
                    <textarea
                      rows={2}
                      placeholder="Commitment to eco-luxury, timeless architectural elegance, etc."
                      value={newBuilderDescription}
                      onChange={(e) => setNewBuilderDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg resize-none"
                    />
                  </div>

                  {/* LANDMARKS GUIDE */}
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <span className="block text-[10px] font-mono tracking-wider uppercase text-neutral-500">📍 Surrounding Neighborhood Landmarks</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                      <div>
                        <span className="block text-[9px] font-mono text-neutral-400 mb-0.5">🏫 Primary School</span>
                        <input type="text" placeholder="e.g. Phoenix Greens" value={landmarkSchool} onChange={e => setLandmarkSchool(e.target.value)} className="w-full px-2 py-1 bg-white border border-neutral-200 rounded text-[10px]" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-neutral-400 mb-0.5">🚇 Metro Station</span>
                        <input type="text" placeholder="e.g. Raidurg Metro" value={landmarkMetro} onChange={e => setLandmarkMetro(e.target.value)} className="w-full px-2 py-1 bg-white border border-neutral-200 rounded text-[10px]" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-neutral-400 mb-0.5">🏥 Hospital</span>
                        <input type="text" placeholder="e.g. Continental Hosp" value={landmarkHospital} onChange={e => setLandmarkHospital(e.target.value)} className="w-full px-2 py-1 bg-white border border-[#eaeaea] rounded text-[10px]" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-neutral-400 mb-0.5">🛍️ Mega Mall</span>
                        <input type="text" placeholder="e.g. Reliance Point" value={landmarkMall} onChange={e => setLandmarkMall(e.target.value)} className="w-full px-2 py-1 bg-white border border-[#eaeaea] rounded text-[10px]" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-neutral-400 mb-0.5">☕ Cafe/Bistro</span>
                        <input type="text" placeholder="e.g. Cafe Sandwicho" value={landmarkRestaurant} onChange={e => setLandmarkRestaurant(e.target.value)} className="w-full px-2 py-1 bg-white border border-[#eaeaea] rounded text-[10px]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Amenities (Comma separated list)</label>
                    <input
                      type="text"
                      placeholder="Infinity Pool, High Ceilings, Geothermal Floor"
                      value={newAmenities}
                      onChange={(e) => setNewAmenities(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-amenities"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">Open House Date (Optional)</label>
                    <input
                      type="date"
                      value={newOpenHouse}
                      onChange={(e) => setNewOpenHouse(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                      id="new-listing-openhouse"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-[#999999] mb-1.5">Listing Photo URL</label>
                  <input
                    type="text"
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 text-xs font-mono rounded-lg outline-none"
                    id="new-listing-img"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showOnProfile}
                      onChange={() => setShowOnProfile(!showOnProfile)}
                      className="accent-black h-4 w-4 border border-neutral-300 rounded"
                      id="claim-show-profile"
                    />
                    <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">Show on My Website</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={listOnMarketplace}
                      onChange={() => setListOnMarketplace(!listOnMarketplace)}
                      className="accent-black h-4 w-4 border border-neutral-300 rounded"
                      id="claim-list-marketplace"
                    />
                    <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">List on SFT Marketplace</span>
                  </label>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetFormFields}
                    className="px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-xl"
                    id="cancel-create-listing"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold cursor-pointer"
                    id="submit-create-listing"
                  >
                    {editingPropertyId !== null ? 'Update Listing Document' : 'Save & Create Document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating interactive toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-800 text-white text-xs font-mono tracking-wide px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
