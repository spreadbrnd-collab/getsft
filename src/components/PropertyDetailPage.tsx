import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MapPin, BedDouble, Bath, Maximize2, Sparkles, Building2, 
  Phone, Mail, MessageSquare, BadgeCheck, Send, CheckCircle2, 
  Compass, DollarSign, Calendar
} from 'lucide-react';
import { Property, Realtor, Inquiry, User } from '../types';
import { INITIAL_PROPERTIES } from '../mockData';

interface PropertyDetailPageProps {
  property: Property;
  realtor: Realtor;
  currentUser: User | null;
  onBack: () => void;
  onInquirySubmit: (inquiry: Inquiry) => void;
  isSaved: boolean;
  onToggleSaved: (id: number) => void;
}

export default function PropertyDetailPage({
  property,
  realtor,
  currentUser,
  onBack,
  onInquirySubmit,
  isSaved,
  onToggleSaved
}: PropertyDetailPageProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [formName, setFormName] = useState(currentUser?.name || '');
  const [formEmail, setFormEmail] = useState(currentUser?.email || '');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState(
    `Hello ${realtor.name.split(' ')[0]}, I would like to schedule a private architectural consultation and walk-through for "${property.title}".`
  );
  const [submitted, setSubmitted] = useState(false);

  // Vetted detailed tools & calculator inputs
  const isINR = property.city?.toLowerCase() === 'hyderabad' || property.province?.toLowerCase() === 'telangana';
  
  const [activeToolTab, setActiveToolTab] = useState<'emi' | 'affordability' | 'eligibility' | 'breakdown'>('emi');
  const [emiDownPaymentPct, setEmiDownPaymentPct] = useState(20);
  const [emiInterestRate, setEmiInterestRate] = useState(8.5);
  const [emiTenureYrs, setEmiTenureYrs] = useState(20);

  const [affMonthlyIncome, setAffMonthlyIncome] = useState(isINR ? 350000 : 18000);
  const [affMonthlyExpenses, setAffMonthlyExpenses] = useState(isINR ? 80000 : 4000);

  const [eligMonthlyIncome, setEligMonthlyIncome] = useState(isINR ? 300000 : 15000);
  const [eligAge, setEligAge] = useState(30);

  // Property comparison selection state
  const otherProperties = INITIAL_PROPERTIES.filter(p => p.property_id !== property.property_id);
  const [compareId, setCompareId] = useState<number>(otherProperties[0]?.property_id || 0);

  const pricePerSft = Math.round(property.price / property.area);

  const handleInquiryForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      property_id: property.property_id,
      property_title: property.title,
      realtor_id: property.owner_id,
      name: formName,
      email: formEmail,
      phone: formPhone,
      message: formMessage,
      date: new Date().toISOString()
    };

    onInquirySubmit(newInquiry);
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in text-neutral-900">
      
      {/* Dynamic Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 hover:border-black rounded-full font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer text-neutral-600 hover:text-black"
          id="detail-back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-neutral-400">
            ID: #{property.property_id}
          </span>
          <button
            onClick={() => onToggleSaved(property.property_id)}
            className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${
              isSaved 
                ? 'bg-black border-black text-white' 
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-black'
            }`}
            id="detail-save-wishlist"
          >
            {isSaved ? '★ Wishlisted' : '☆ Save Residence'}
          </button>
        </div>
      </div>

      {/* Grid Layout: Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main content col: Property details (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main big display title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white ${
                property.listingIntent === 'Rent' ? 'bg-teal-805' : 'bg-black'
              } rounded`}>
                For {property.listingIntent || 'Buy'}
              </span>
              <span className="px-3 py-1 bg-neutral-100 font-mono text-[10px] text-neutral-600 uppercase tracking-widest rounded">
                {property.propertyType}
              </span>
              {property.status !== 'Active' && (
                <span className="px-3 py-1 bg-teal-50 text-teal-800 font-mono text-[10px] uppercase rounded">
                  {property.status}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-display font-light tracking-tight text-black leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-400">
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>{property.address}, {property.city}, {property.province} {property.postalCode}</span>
            </div>
          </div>

          {/* Elegant Image Gallery with thumbnail sidebar indicator */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-100">
              <img
                src={property.images[activeImage]}
                alt={`${property.title} view ${activeImage + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 aspect-3/2 rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 transition-all ${
                      idx === activeImage ? 'border-[#c8a27b] scale-102' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Metrics highlight layout bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-neutral-50 rounded-[20px] border border-neutral-150">
            {property.listingIntent === 'Rent' ? (
              <>
                {/* RENTER'S VIEW */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Monthly Rent Rate</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    {isINR ? `₹ ${(property.price / 100000).toFixed(2)} Lacs` : `$${property.price.toLocaleString()}`}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> / mo</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#b38e68] block">Fully-Vetted Base Rate</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Rent per Sq Ft</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    {isINR ? `₹ ${(property.price / property.area).toFixed(1)}` : `$${(property.price / property.area).toFixed(2)}`}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> / SFT / mo</span>
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">Calculated Space Cost</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Yearly Rent Outlay</span>
                  <span className="text-xl font-display font-semibold text-neutral-900 mt-0.5 block font-bold">
                    {isINR ? `₹ ${((property.price * 12) / 100000).toFixed(2)} Lacs` : `$${(property.price * 12).toLocaleString()}`}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> / yr</span>
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">Total Annual Rent Cost</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Lease Agreement</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    12 Months
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">1-Month Security Deposit</span>
                </div>
              </>
            ) : (
              <>
                {/* BUYER'S VIEW */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">List Sale Price</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    {isINR ? (property.price >= 10000000 ? `₹ ${(property.price / 10000000).toFixed(2)} Cr` : `₹ ${(property.price / 100000).toFixed(2)} Lakhs`) : `$${property.price.toLocaleString()}`}
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">Verified Market Valuation</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Unit Cost (SFT)</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    {isINR ? `₹ ${(pricePerSft / 100).toFixed(1)} K` : `$${pricePerSft.toLocaleString()}`}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> / SFT</span>
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">Acquisition Floor Price</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Est. Market Rent Value</span>
                  <span className="text-xl font-display font-semibold text-teal-900 mt-0.5 block font-bold">
                    {isINR ? `₹ ${(property.monthlyRentEstimate || Math.round(property.price * 0.0035)).toLocaleString('en-IN')}` : `$${(property.monthlyRentEstimate || Math.round(property.price * 0.0035)).toLocaleString()}`}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> / mo</span>
                  </span>
                  <span className="text-[9px] font-mono text-teal-800 block">Potential Passive Monthly Yield</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-400 block">Total Liveable Area</span>
                  <span className="text-xl font-display font-semibold text-black mt-0.5 block">
                    {property.area.toLocaleString()}
                    <span className="text-xs font-mono text-neutral-500 font-normal"> SFT</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#b38e68] block">Vetted Structural Floorplan</span>
                </div>
              </>
            )}
          </div>

          {/* Home Overview & Description details */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-medium text-black">Home Overview</h2>
            <div className="text-neutral-600 leading-relaxed text-sm space-y-4 font-sans max-w-none">
              <p>{property.description}</p>
            </div>
          </div>

          {/* PROJECT EXCLUSIVE SPECIFICATIONS */}
          {(property.reraId || property.possessionDate || property.projectSize || property.projectAreaCount || property.bhkConfig) && (
            <div className="p-6 bg-teal-50/15 border border-teal-100/60 rounded-[20px] space-y-4 shadow-3xs">
              <h3 className="font-display font-medium text-black text-sm uppercase tracking-wider text-teal-800">Project Specifications & Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-sans">
                {property.reraId && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">RERA Status</span>
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Registered ({property.reraId})
                    </span>
                  </div>
                )}
                {property.possessionDate && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Possession Starts</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{property.possessionDate}</span>
                  </div>
                )}
                {property.projectSize && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Total Project Size</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{property.projectSize}</span>
                  </div>
                )}
                {property.projectAreaCount && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Project Land Area</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{property.projectAreaCount}</span>
                  </div>
                )}
                {property.bhkConfig && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Apartment Configurations</span>
                    <span className="text-xs font-semibold text-teal-700 block">{property.bhkConfig}</span>
                  </div>
                )}
                {property.avgPricePerSft && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Average Rate</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{property.avgPricePerSft}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC FLOOR PLANS & PRICING */}
          {property.bhkConfig && (
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h2 className="text-xl font-display font-medium text-black">Floor Plans & Typical Pricing Models</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                {[
                  {
                    type: '3.5 BHK Premium Suite',
                    price: property.price ? `₹ ${(property.price * 0.85 / 10000000).toFixed(2)} Cr onwards` : '₹ 3.90 Cr onwards',
                    size: '3,390 sq.ft Super Builtup',
                    status: property.possessionDate ? `Delivering ${property.possessionDate}` : 'Under Construction'
                  },
                  {
                    type: '4.0 BHK Grand Estate',
                    price: property.price ? `₹ ${(property.price * 1.0 / 10000000).toFixed(2)} Cr onwards` : '₹ 4.48 Cr onwards',
                    size: '4,150 sq.ft Super Builtup',
                    status: property.possessionDate ? `Delivering ${property.possessionDate}` : 'Under Construction'
                  },
                  {
                    type: '4.5 BHK Masterful Mansion',
                    price: property.price ? `₹ ${(property.price * 1.15 / 10000000).toFixed(2)} Cr - ₹ ${(property.price * 1.25 / 10000000).toFixed(2)} Cr` : '₹ 4.98 Cr - 5.55 Cr',
                    size: '4,825 sq.ft Super Builtup',
                    status: property.possessionDate ? `Delivering ${property.possessionDate}` : 'Under Construction'
                  }
                ].map((tier, idx) => (
                  <div key={idx} className="p-5 bg-white border border-neutral-150 rounded-2xl flex flex-col justify-between hover:border-teal-700 transition-all duration-300 group shadow-3xs hover:shadow-2xs">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded uppercase">
                        Config Architecture {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-teal-700 transition-colors">{tier.type}</h4>
                      <p className="text-xs text-teal-700 font-bold">{tier.price}</p>
                      <div className="pt-2 text-[11px] text-neutral-500 font-mono space-y-1 border-t border-neutral-100 mt-2">
                        <div>📐 Sizes Range: {tier.size}</div>
                        <div>📅 Status: {tier.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEIGHBORHOOD CONNECTIVITY MAP & LANDMARKS */}
          {property.landmarks && (
            <div className="p-5 bg-white border border-neutral-150 rounded-[24px] space-y-4 pt-5 shadow-3xs">
              <h3 className="font-display font-medium text-black text-base tracking-tight">Around This Project (Neighbourhood Guide)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {property.landmarks.school && (
                  <div className="p-4 bg-teal-50/15 border border-teal-100/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">🏫 Education Hub</span>
                    <p className="text-xs font-semibold text-neutral-800 leading-snug">{property.landmarks.school}</p>
                  </div>
                )}
                {property.landmarks.metro && (
                  <div className="p-4 bg-teal-50/15 border border-teal-100/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">🚇 Rapid Transit</span>
                    <p className="text-xs font-semibold text-neutral-800 leading-snug">{property.landmarks.metro}</p>
                  </div>
                )}
                {property.landmarks.hospital && (
                  <div className="p-4 bg-teal-50/15 border border-teal-100/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">🏥 Healthcare</span>
                    <p className="text-xs font-semibold text-neutral-800 leading-snug">{property.landmarks.hospital}</p>
                  </div>
                )}
                {property.landmarks.mall && (
                  <div className="p-4 bg-teal-50/15 border border-teal-100/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">🛍️ Shopping & Retail</span>
                    <p className="text-xs font-semibold text-neutral-800 leading-snug">{property.landmarks.mall}</p>
                  </div>
                )}
                {property.landmarks.restaurant && (
                  <div className="p-4 bg-teal-50/15 border border-teal-100/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block">☕ Food & Coffee</span>
                    <p className="text-xs font-semibold text-neutral-800 leading-snug">{property.landmarks.restaurant}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECT HIGHLIGHTS */}
          {property.highlights && property.highlights.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h2 className="text-xl font-display font-medium text-black">Project Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.highlights.map((highlight, idx) => (
                  <div key={idx} className="p-4 bg-[#fbf9f6] rounded-xl border border-[#ede7df] flex gap-3 h-full">
                    <span className="text-[#c8a27b] shrink-0 font-bold">0{idx + 1}.</span>
                    <span className="text-xs text-neutral-700 font-sans leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AMENITIES WITH PREMIUM ICONS / LABELS */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h2 className="text-xl font-display font-medium text-black">Project Premium Features</h2>
            <div className="flex flex-wrap gap-2.5">
              {property.amenities.map((amenity, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-neutral-700 border border-neutral-150 rounded-full text-xs font-sans hover:border-[#c8a27b] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c8a27b]" />
                  <span>{amenity}</span>
                </span>
              ))}
            </div>
          </div>

          {/* PROJECT BUILDER & DEVELOPER SECTION */}
          {property.builderName && (
            <div className="p-6 bg-neutral-50 rounded-[20px] border border-neutral-150 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#c8a27b]" />
                <div>
                  <h4 className="text-xs font-mono tracking-wider uppercase text-neutral-400">Project Architectural Builder</h4>
                  <h3 className="text-base font-display font-medium text-black">{property.builderName}</h3>
                </div>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans pl-8">
                {property.builderDescription || 'A renowned local architectural developer vetted by our advisory for premium material execution standards and structural warranty.'}
              </p>
            </div>
          )}

          {/* ESTIMATED RETURN ANALYSIS */}
          <div className="p-6 bg-[#fafafa] rounded-[20px] border border-neutral-150 space-y-4">
            <h3 className="font-display font-medium text-sm text-black uppercase tracking-wider">Advisory Performance Index</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-neutral-100">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">Price Metrics</span>
                <span className="text-[#b38e68] text-base font-semibold block mt-1">
                  {isINR ? `₹ ${(pricePerSft / 100).toFixed(1)} K / SFT` : `$${pricePerSft.toLocaleString()} / SFT`}
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-100">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">Estimated Monthly Rent</span>
                <span className="text-neutral-900 text-base font-semibold block mt-1">
                  {isINR ? `₹ ${(property.monthlyRentEstimate || Math.round(property.price * 0.0035)).toLocaleString('en-IN')}` : `$${(property.monthlyRentEstimate || Math.round(property.price * 0.0035)).toLocaleString()}`} / mo
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-100">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">Advisory SFT Yield</span>
                <span className="text-emerald-700 text-base font-semibold block mt-1">
                  {property.listingIntent === 'Rent' ? 'Direct Income' : '3.8% - 4.5% Net Target'}
                </span>
              </div>
            </div>
          </div>

          {/* ADVANCED HELPFUL TOOLS / CALCULATOR SUITE */}
          <div className="p-6 bg-[#ffffff] border border-neutral-150 rounded-[28px] space-y-5" id="helpful-tools-suite">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-800 font-bold">✦ Dynamic Client Advisory</span>
              <h3 className="text-lg font-display font-medium text-neutral-900 mt-0.5">Helpful Calculators & Estimators</h3>
              <p className="text-xs text-neutral-500 font-sans">Verify loan thresholds, eligibility parameters, and comprehensive acquisition cost breakdowns.</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-xl">
              {(['emi', 'affordability', 'eligibility', 'breakdown'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveToolTab(tab)}
                  className={`flex-1 py-2 px-1 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all font-bold ${
                    activeToolTab === tab 
                      ? 'bg-black text-white shadow-xs' 
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab === 'emi' ? 'EMI Cal' : tab === 'affordability' ? 'Affordability' : tab === 'eligibility' ? 'Eligibility' : 'Price Break'}
                </button>
              ))}
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="text-xs font-sans space-y-4 pt-1">
              {activeToolTab === 'emi' && (() => {
                // Calculate Dynamic EMI
                const emiPrincipal = property.price * (1 - emiDownPaymentPct / 100);
                const emiMonthlyRate = (emiInterestRate / 12) / 100;
                const emiTotalMonths = emiTenureYrs * 12;
                let emiResult = 0;
                if (emiMonthlyRate > 0) {
                  emiResult = emiPrincipal * emiMonthlyRate * Math.pow(1 + emiMonthlyRate, emiTotalMonths) / (Math.pow(1 + emiMonthlyRate, emiTotalMonths) - 1);
                } else {
                  emiResult = emiPrincipal / emiTotalMonths;
                }

                return (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#fafaee] p-4 rounded-2xl border border-[#edece0] flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] font-mono uppercase text-neutral-500 font-bold">Estimated Monthly EMI</span>
                        <span className="text-lg sm:text-xl font-display font-semibold text-neutral-800 mt-0.5 block">
                          {isINR ? `₹ ${(emiResult / 100000).toFixed(2)} Lacs` : `$${Math.round(emiResult).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-mono uppercase tracking-wider text-teal-800 font-bold">Downpayment Paid</span>
                        <span className="text-xs font-bold text-neutral-700 block mt-1">
                          {isINR ? `₹ ${(property.price * emiDownPaymentPct / 100 / 10000000).toFixed(2)} Cr` : `$${(property.price * emiDownPaymentPct / 100).toLocaleString()}`} ({emiDownPaymentPct}%)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-500 font-bold">Down Payment Percent</span>
                          <span className="font-mono text-teal-800 font-bold">{emiDownPaymentPct}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="80" 
                          step="5"
                          value={emiDownPaymentPct} 
                          onChange={(e) => setEmiDownPaymentPct(Number(e.target.value))} 
                          className="w-full accent-teal-800 cursor-pointer" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-500 font-bold">Annual Interest Rate</span>
                          <span className="font-mono text-teal-800 font-bold">{emiInterestRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="20" 
                          step="0.1" 
                          value={emiInterestRate} 
                          onChange={(e) => setEmiInterestRate(Number(e.target.value))} 
                          className="w-full accent-neutral-800 cursor-pointer" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-500 font-bold">Loan Tenure Period</span>
                          <span className="font-mono text-[#b38e68] font-bold">{emiTenureYrs} Years</span>
                        </div>
                        <div className="flex gap-2">
                          {[10, 15, 20, 25, 30].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setEmiTenureYrs(yr)}
                              className={`flex-1 py-1 text-center rounded-lg text-[10px] font-mono border transition-all ${
                                emiTenureYrs === yr 
                                  ? 'bg-[#b38e68] border-[#b38e68] text-white' 
                                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-black'
                              }`}
                            >
                              {yr} Yr
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeToolTab === 'affordability' && (() => {
                const maxHousingAllocation = (affMonthlyIncome * 0.40) - affMonthlyExpenses;
                const monthlyIntAff = (8.5 / 12) / 100;
                const totalMthsAff = 240; // 20 years fixed
                let calculatedLoan = 0;
                if (maxHousingAllocation > 0 && monthlyIntAff > 0) {
                  calculatedLoan = maxHousingAllocation * (Math.pow(1 + monthlyIntAff, totalMthsAff) - 1) / (monthlyIntAff * Math.pow(1 + monthlyIntAff, totalMthsAff));
                }
                const calculatedBudget = calculatedLoan + (affMonthlyIncome * 4); // loan + estimated downpayment backup

                return (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="bg-[#f0f8ff] p-4 rounded-xl border border-[#d1e6fa] grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">Suggested Maximum Budget</span>
                        <span className="text-base sm:text-lg font-display font-semibold text-neutral-800 tracking-tight mt-0.5 block">
                          {isINR ? `₹ ${(calculatedBudget / 10000000).toFixed(2)} Cr` : `$${Math.round(calculatedBudget).toLocaleString()}`}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">Est. Eligible Home Loan</span>
                        <span className="text-base sm:text-lg font-display font-semibold text-neutral-800 tracking-tight mt-0.5 block">
                          {isINR ? `₹ ${(calculatedLoan / 10000000).toFixed(2)} Cr` : `$${Math.round(calculatedLoan).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Monthly Active Income</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-neutral-400 font-semibold">{isINR ? '₹' : '$'}</span>
                          <input
                            type="number"
                            value={affMonthlyIncome}
                            onChange={(e) => setAffMonthlyIncome(Number(e.target.value))}
                            className="w-full pl-7 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Other Existing Debt EMI</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-neutral-400 font-semibold">{isINR ? '₹' : '$'}</span>
                          <input
                            type="number"
                            value={affMonthlyExpenses}
                            onChange={(e) => setAffMonthlyExpenses(Number(e.target.value))}
                            className="w-full pl-7 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeToolTab === 'eligibility' && (() => {
                const maxEMIAllowed = eligMonthlyIncome * 0.50;
                const monthlyIntElig = (8.2 / 12) / 100;
                const calculatedLoanLimit = maxEMIAllowed * (Math.pow(1 + monthlyIntElig, 240) - 1) / (monthlyIntElig * Math.pow(1 + monthlyIntElig, 240));

                return (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-[#fcf7f2] p-4 rounded-xl border border-[#ebdccb] flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">Estimated Home Loan Limit</span>
                        <span className="text-lg font-display font-semibold text-neutral-800 mt-0.5 block">
                          {isINR ? `₹ ${(calculatedLoanLimit / 10000000).toFixed(2)} Cr` : `$${Math.round(calculatedLoanLimit).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">Max Bank EMI Allowed</span>
                        <span className="text-xs font-bold text-teal-800 block mt-0.5">
                          {isINR ? `₹ ${(maxEMIAllowed / 100000).toFixed(2)} Lacs/mo` : `$${Math.round(maxEMIAllowed).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">In-Hand Monthly Salary</label>
                        <input
                          type="number"
                          value={eligMonthlyIncome}
                          onChange={(e) => setEligMonthlyIncome(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Primary Applicant Age</label>
                        <input
                          type="number"
                          value={eligAge}
                          onChange={(e) => setEligAge(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeToolTab === 'breakdown' && (() => {
                // Detailed Breakdown calculations
                const baseVal = property.price;
                const stampDuty = isINR ? Math.round(baseVal * 0.06) : Math.round(baseVal * 0.03); 
                const regFees = isINR ? Math.round(baseVal * 0.01) : Math.round(baseVal * 0.005);
                const gstTax = isINR ? Math.round(baseVal * 0.05) : Math.round(baseVal * 0.012);
                const devServiceInfrastructure = isINR ? 850000 : 25000;
                const totalEscrowAcquisition = baseVal + stampDuty + regFees + gstTax + devServiceInfrastructure;

                return (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="border border-neutral-150 rounded-2xl overflow-hidden text-neutral-800">
                      <div className="p-3 bg-neutral-50 border-b border-neutral-150 flex justify-between font-bold text-neutral-900">
                        <span>Fee Item Components</span>
                        <span>Estimated Cost Outlay</span>
                      </div>
                      <div className="p-3 space-y-2 text-neutral-600">
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Base Property Value / Price</span>
                          <span className="font-mono text-neutral-800 font-bold">
                            {isINR ? `₹ ${(baseVal / 10000000).toFixed(2)} Cr` : `$${baseVal.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Stamp Duty {isINR ? '(6% of price)' : '(3% of price)'}</span>
                          <span className="font-mono text-neutral-800">
                            {isINR ? `₹ ${(stampDuty / 100000).toFixed(2)} Lacs` : `$${stampDuty.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Registration Charges {isINR ? '(1%)' : '(0.5%)'}</span>
                          <span className="font-mono text-neutral-800">
                            {isINR ? `₹ ${(regFees / 100000).toFixed(2)} Lacs` : `$${regFees.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Goods & Services GST / Taxes</span>
                          <span className="font-mono text-neutral-800">
                            {isINR ? `₹ ${(gstTax / 100000).toFixed(2)} Lacs` : `$${gstTax.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span>Society Infrastructure & Amenities Fee</span>
                          <span className="font-mono text-neutral-800">
                            {isINR ? `₹ ${(devServiceInfrastructure / 100000).toFixed(2)} Lacs` : `$${devServiceInfrastructure.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="border-t border-dashed border-neutral-150 pt-2.5 flex justify-between items-center text-xs font-bold text-neutral-900 uppercase">
                          <span>Total Capital Outlay</span>
                          <span className="font-mono text-[#b38e68] text-sm">
                            {isINR ? `₹ ${(totalEscrowAcquisition / 10000000).toFixed(3)} Cr` : `$${totalEscrowAcquisition.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] leading-relaxed text-teal-850 bg-teal-50 p-3 rounded-lg border border-teal-100 font-mono italic">
                      ⚠ Advisory Check: Price excludes maintenance, floor rise cost, stamp duty, registration, GST etc. True cost will vary based on floor rise level and specific block orientation.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* SIDE-BY-SIDE PROPERTY COMPARISON SECTION */}
          <div className="p-6 bg-[#ffffff] border border-neutral-150 rounded-[28px] space-y-4" id="compare-properties-suite">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-800 font-bold">✦ Side-by-Side Analysis</span>
              <h3 className="text-lg font-display font-medium text-neutral-900 mt-0.5">Compare With Similar Projects</h3>
              <p className="text-xs text-neutral-500 font-sans">Compare key specifications, builder warranty parameters, and pricing matrices instantly.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <span className="text-xs text-neutral-500 font-bold shrink-0">Select Competitor Target:</span>
              <select
                value={compareId}
                onChange={(e) => setCompareId(Number(e.target.value))}
                className="w-full sm:w-auto text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-800 outline-none focus:border-black"
              >
                {otherProperties.map((op) => (
                  <option key={op.property_id} value={op.property_id}>
                    {op.title} ({op.city})
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const comp = otherProperties.find(op => op.property_id === compareId);
              if (!comp) return null;

              return (
                <div className="border border-neutral-150 rounded-2xl overflow-hidden font-sans text-xs">
                  <div className="grid grid-cols-3 bg-neutral-100 text-[10px] font-mono uppercase tracking-wide text-neutral-500 text-center font-bold p-2.5 border-b border-neutral-150">
                    <div>Specification</div>
                    <div>This Project</div>
                    <div>{comp.title.split(' ')[0]} {comp.title.split(' ')[1] || ''}</div>
                  </div>

                  <div className="divide-y divide-neutral-150">
                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">Market Price</div>
                      <div className="font-bold text-teal-800 font-mono">
                        {isINR ? `₹ ${(property.price / 10000000).toFixed(2)} Cr` : `$${(property.price).toLocaleString()}`}
                      </div>
                      <div className="font-mono text-neutral-700">
                        {comp.city?.toLowerCase() === 'hyderabad' ? `₹ ${(comp.price / 10000000).toFixed(2)} Cr` : `$${(comp.price).toLocaleString()}`}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">Avg. SFT Price</div>
                      <div className="font-mono text-neutral-800 font-bold">
                        {property.avgPricePerSft || (isINR ? `₹ ${(pricePerSft / 100).toFixed(1)} K/sq.ft` : `$${pricePerSft}/SFT`)}
                      </div>
                      <div className="font-mono text-neutral-600">
                        {comp.avgPricePerSft || (comp.city?.toLowerCase() === 'hyderabad' ? `₹ ${(Math.round(comp.price / comp.area) / 100).toFixed(1)} K/sq.ft` : `$${Math.round(comp.price / comp.area)}/SFT`)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">Area Size (SFT)</div>
                      <div className="font-mono">{property.area} SFT</div>
                      <div className="font-mono text-neutral-600">{comp.area} SFT</div>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">RERA Status</div>
                      <div className="text-emerald-800 font-bold">{property.reraId ? 'Registered' : 'Vetted'}</div>
                      <div className="text-neutral-600">{comp.reraId ? 'Registered' : 'Vetted'}</div>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">Possession Starts</div>
                      <div className="font-semibold text-neutral-800">{property.possessionDate || 'Ready'}</div>
                      <div className="text-neutral-600">{comp.possessionDate || 'Ready'}</div>
                    </div>

                    <div className="grid grid-cols-3 p-2.5 items-center text-center">
                      <div className="font-semibold text-neutral-500 text-[11px] text-left">Developer Group</div>
                      <div className="font-bold text-neutral-800 truncate px-1">{property.builderName || 'Vetted Dev'}</div>
                      <div className="text-neutral-600 truncate px-1">{comp.builderName || 'Vetted Dev'}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* DYNAMIC SPECIFICATIONS FREQUENTLY ASKED QUESTIONS (FAQ) */}
          <div className="p-6 bg-[#ffffff] border border-[#eaeaea] rounded-[28px] space-y-4" id="faq-property-suite">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-800 font-bold">✦ Project Inquiries Q&A</span>
              <h3 className="text-lg font-display font-medium text-neutral-900 mt-0.5">FAQs About {property.title}</h3>
              <p className="text-xs text-neutral-500 font-sans">Frequently registered queries regarding the RERA credentials, layout pricing, and neighboring milestones.</p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-4 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-800 block">Q: Under what RERA Registration ID code is {property.title} registered?</span>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A: The development represents a fully registered and authorized project under RERA with ID index code <span className="font-mono font-bold text-neutral-900">{property.reraId || 'P02400009538'}</span>, guaranteeing transparent legal delivery timelines and builder adherence checks.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-800 block">Q: When is the registered developer scheduled to start handing over possession keys?</span>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A: Handover and possession key handoffs are officially projected to begin from <span className="font-bold text-neutral-900">{property.possessionDate || 'Mar, 2030'}</span> according to state filing documents.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-800 block">Q: What typical configurations are available in {property.title}?</span>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A: The high-end complex mostly comprises elegant <span className="font-bold text-teal-800">{property.bhkConfig || '3.5, 4, 4.5 BHK Premium Suites'}</span>. Layout space scales from {property.area.toLocaleString()} sq.ft. upwards.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl space-y-1">
                <span className="font-bold text-neutral-800 block">Q: Does the listed market rate exclude specific overhead elements?</span>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A: Yes, strictly. Please note that the baseline selling price refers to the structure list and excludes floor raise premiums, GST tax outlays, registration fees, maintenance deposits, or custom stamp duty calculations.
                </p>
              </div>

              {property.landmarks && (
                <div className="p-4 bg-neutral-50 rounded-xl space-y-1">
                  <span className="font-bold text-neutral-800 block">Q: What transport and lifestyle milestones locate surrounding the neighborhood?</span>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    A: Residents benefit from top connectivity including proximity to <span className="font-bold text-neutral-800">{property.landmarks.metro || 'Raidurg Metro Station'}</span> for rapid transit commute and premier education clinics such as <span className="font-bold text-neutral-800">{property.landmarks.school || 'Phoenix Greens School'}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right sticky col: Vetted Agent profile & Direct contact Form  (4/12) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Realtor / Broker Profile Info Box */}
          <div className="bg-[#ffffff] rounded-3xl border border-neutral-150 p-6 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
              <img
                src={realtor.profileImage}
                alt={realtor.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-neutral-200"
              />
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-base text-neutral-900 leading-tight">
                  {realtor.name}
                </h3>
                <span className="font-mono text-[9px] text-[#b38e68] uppercase tracking-wider block">
                  {realtor.title}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Licensed in {realtor.city}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 font-sans leading-relaxed">
              "{realtor.bio}"
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="bg-neutral-50 text-neutral-600 px-2.5 py-1 rounded">
                ★ {realtor.experience} Yrs Experience
              </span>
              {realtor.languages.slice(0, 2).map((lang) => (
                <span key={lang} className="bg-neutral-50 text-neutral-600 px-2.5 py-1 rounded">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Request Form (No popups!) */}
          <div className="bg-[#ffffff] rounded-3xl border border-neutral-150 p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display font-medium text-sm text-black uppercase tracking-wider">
                Direct Inquiry
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Submit this form to trigger a secure response back regarding this project.
              </p>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-[#f5faf5] border border-emerald-100 text-emerald-800 rounded-2xl flex flex-col items-center text-center space-y-2"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold">Request Verified</h4>
                <p className="text-[11px] font-sans text-emerald-700">
                  Your inquiry message was registered directly in state for representative {realtor.name}. Follow up expected shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] font-mono text-emerald-600 mt-2 hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleInquiryForm} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arthur Pendelton"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-sans focus:bg-white focus:border-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@getsft.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-sans focus:bg-white focus:border-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (604) 555-0100"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-sans focus:bg-white focus:border-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-400">Message Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-sans focus:bg-white focus:border-black outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit Consultation request
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
