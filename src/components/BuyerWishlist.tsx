import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Heart, Send, Calendar, MapPin, Trash2, ArrowRight, UserCircle2, Landmark } from 'lucide-react';
import { User, Property, Inquiry } from '../types';

interface BuyerWishlistProps {
  currentUser: User;
  properties: Property[];
  inquiries: Inquiry[];
  onRemoveFromWishlist: (propertyId: number) => void;
  onExploreMarketplace: () => void;
  onSelectPropertyToInquire: (property: Property) => void;
}

export default function BuyerWishlist({
  currentUser,
  properties,
  inquiries,
  onRemoveFromWishlist,
  onExploreMarketplace,
  onSelectPropertyToInquire,
}: BuyerWishlistProps) {
  // Filter properties in user's wishlist
  const wishlistedProperties = useMemo(() => {
    return properties.filter((p) => currentUser.savedPropertyIds.includes(p.property_id));
  }, [properties, currentUser.savedPropertyIds]);

  // Filter inquiry messages sent by this specific buyer email
  const buyerInquiries = useMemo(() => {
    return inquiries.filter(
      (inq) => inq.email.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [inquiries, currentUser.email]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12 font-sans">
      
      {/* Header Profile Info Card */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center text-white text-lg font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="font-mono text-xs tracking-wider uppercase text-neutral-400">Buyer Workspace Console</span>
            <h1 className="text-3xl font-display font-medium text-neutral-900 mt-1">{currentUser.name}</h1>
            <p className="text-xs text-neutral-500 mt-1 font-mono">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button 
            onClick={onExploreMarketplace}
            className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-mono uppercase tracking-wider rounded-full flex items-center gap-2 transition-all cursor-pointer font-bold"
            id="buyer-explore-marketplace"
          >
            Explore Properties
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left column: Wishlisted properties (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-medium text-neutral-900">My Curated Wishlist</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Discerning selections saved for private review.</p>
            </div>
            <span className="font-mono text-xs text-neutral-400">{wishlistedProperties.length} items</span>
          </div>

          {wishlistedProperties.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-neutral-150 rounded-[24px] bg-neutral-50/50">
              <Heart className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-sm font-sans text-neutral-500 mt-4 italic">Your wishlist card folder is currently empty.</p>
              <button
                onClick={onExploreMarketplace}
                className="text-xs font-mono font-medium text-black uppercase underline mt-4 hover:opacity-85"
                id="buyer-return-marketplace-from-empty"
              >
                Seek properties now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishlistedProperties.map((p) => (
                <div 
                  key={p.property_id}
                  className="bg-white border border-neutral-100 rounded-[24px] overflow-hidden group flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <button
                      onClick={() => onRemoveFromWishlist(p.property_id)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-red-500 hover:text-red-600 transition-colors shadow-sm"
                      title="Remove from wishlist"
                      id={`remove-wishlist-item-${p.property_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-display font-medium text-base text-neutral-900 truncate">
                          {p.title}
                        </h3>
                      </div>
                      <p className="text-[10px] font-mono tracking-wide text-neutral-400 uppercase mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-300" />
                        {p.address}, {p.city}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100/60 flex items-center justify-between">
                      <span className="font-bold text-neutral-900">${p.price.toLocaleString()}</span>
                      
                      <button
                        onClick={() => onSelectPropertyToInquire(p)}
                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-900 text-neutral-800 hover:text-white text-[10px] font-mono tracking-wide uppercase transition-all rounded"
                        id={`buyer-inquire-wishlist-item-${p.property_id}`}
                      >
                        Enquire Representative
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Submitted inquiries history */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-medium text-neutral-900">Sent Inquiries</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Historic log of secure messages dispatch.</p>
          </div>

          {buyerInquiries.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-150 rounded-[24px] bg-neutral-50/50">
              <p className="text-xs text-neutral-400 font-sans italic">No messages sent yet. Inquire directly on homes to reach realtors.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {buyerInquiries.map((inq) => (
                <div 
                  key={inq.id}
                  className="p-6 bg-[#fafafa] rounded-[24px] border border-neutral-100/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono bg-neutral-200/50 text-neutral-700 px-2 py-0.5 rounded uppercase font-semibold">
                        {inq.property_title}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">
                        Realtor Username: <span className="font-bold text-neutral-600">@{inq.realtor_id}</span>
                      </p>
                    </div>
                    <span className="text-[9px] text-[#999999] font-mono">
                      {new Date(inq.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 font-sans line-clamp-3 leading-relaxed border-l border-neutral-300 pl-3 italic">
                    "{inq.message}"
                  </p>

                  <div className="pt-2 border-t border-neutral-100/50 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      DELIVERED DIRECT
                    </span>
                    <span className="text-[#999999]">No read indicators</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
