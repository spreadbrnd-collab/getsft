import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Landmark, BadgeCheck } from 'lucide-react';
import { Property, Inquiry } from '../types';

interface LeadInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  realtorName: string;
  onInquirySubmitted: (inquiry: Inquiry) => void;
  defaultBuyerName?: string;
  defaultBuyerEmail?: string;
}

export default function LeadInquiryModal({
  isOpen,
  onClose,
  property,
  realtorName,
  onInquirySubmitted,
  defaultBuyerName = '',
  defaultBuyerEmail = '',
}: LeadInquiryModalProps) {
  const [name, setName] = useState(defaultBuyerName);
  const [email, setEmail] = useState(defaultBuyerEmail);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hello, I would like to enquire about "${property.title}" located at ${property.address}, ${property.city}. Please let me know when we could organize a viewing.`
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) return;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      property_id: property.property_id,
      property_title: property.title,
      realtor_id: property.owner_id,
      name,
      email,
      phone,
      message,
      date: new Date().toISOString(),
    };

    onInquirySubmitted(newInquiry);
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black opacity-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-[500px] bg-white rounded-[24px] overflow-hidden p-8 border border-neutral-100 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-50 transition-colors"
              aria-label="Close modal"
              id="close-lead-modal"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            {!submitted ? (
              <div>
                <div className="mb-6">
                  <span className="font-mono text-xs tracking-widest text-[#999999] uppercase">
                    Direct Realtor Inquiry
                  </span>
                  <h3 className="text-2xl font-display font-medium tracking-tight text-neutral-900 mt-1">
                    Enquire on Residency
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1.5 font-sans">
                    Your inquiry is delivered instantly to <strong className="font-medium text-neutral-800">{realtorName}</strong>.
                  </p>
                </div>

                {/* Property Detail Brief */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 mb-6">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-sans font-medium text-sm text-neutral-900 leading-tight">
                      {property.title}
                    </h4>
                    <p className="font-mono text-xs text-neutral-500 mt-0.5">
                      {property.address}, {property.city}
                    </p>
                    <p className="font-sans font-medium text-xs text-neutral-900 mt-1">
                      ${property.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans outline-none focus:border-black transition-all"
                      id="lead-name-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@domain.com"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans outline-none focus:border-black transition-all"
                        id="lead-email-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans outline-none focus:border-black transition-all"
                        id="lead-phone-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1.5">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-sans outline-none focus:border-black transition-all resize-none"
                      id="lead-message-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-sm font-sans font-medium transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    id="submit-lead-inquiry"
                  >
                    <Send className="w-4 h-4" />
                    Send Inquiry
                  </button>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-200 mb-4">
                  <BadgeCheck className="w-8 h-8 text-neutral-800" />
                </div>
                <h3 className="text-xl font-display font-medium text-neutral-900 mb-2">
                  Inquiry Transmitted Successfully
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto font-sans leading-relaxed">
                  Your interest represents an exquisite alignment with our portfolio. The inquiry has been routed directly to the representative list owner profile of <strong className="font-semibold text-neutral-800">{realtorName}</strong>.
                </p>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="mt-8 px-6 py-2.5 bg-black hover:bg-neutral-900 text-white rounded-full text-xs font-mono tracking-wider uppercase cursor-pointer"
                  id="confirm-lead-close"
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
