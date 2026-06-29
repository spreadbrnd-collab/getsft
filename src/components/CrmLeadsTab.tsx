import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, Plus, CheckCircle, Clock, Calendar, AlertCircle, ChevronDown, ChevronUp, Search, Award, FileText, Star, Copy, Download, Sparkles } from 'lucide-react';
import { Inquiry, Realtor, Property, Booking } from '../types';
import { leadService } from '../services/leadService';
import { bookingService } from '../services/bookingService';

interface CrmLeadsTabProps {
  currentUser: { id: string } | null;
  realtor: Realtor;
  properties: Property[];
  inquiries?: Inquiry[];
  onUpdateInquiries?: (inquiries: Inquiry[]) => void;
  onAddBooking?: (booking: Booking) => void;
  showToast: (msg: string) => void;
}

const formatLongDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      const month = d.toLocaleDateString('en-US', { month: 'long' });
      const day = d.getDate();
      const year = d.getFullYear();
      return `${month} ${day} ${year}`;
    }
  } catch(e) {}
  return dateStr;
};

const formatBookingBadgeDate = (dateStr: string, timeStr: string) => {
  let formattedDate = dateStr;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
  } catch(e) {}
  const formattedTime = timeStr.replace(':00', '');
  return `${formattedDate} ${formattedTime}`;
};

export default function CrmLeadsTab({
  currentUser,
  realtor,
  properties,
  inquiries,
  onUpdateInquiries,
  onAddBooking,
  showToast,
}: CrmLeadsTabProps) {
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Manual Lead Creation State
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newBudget, setNewBudget] = useState('CAD 750,000');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newSource, setNewSource] = useState<'Marketplace' | 'Personal Website' | 'Direct Link'>('Personal Website');

  useEffect(() => {
    if (properties && properties.length > 0 && !newPropertyId) {
      setNewPropertyId(properties[0].property_id.toString());
    }
  }, [properties, newPropertyId]);

  // Filter States
  const [searchName, setSearchName] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'has_booking' | 'no_booking'>('all');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2026-07-12');
  const [bookingTime, setBookingTime] = useState('3:00 PM');
  const [bookingType, setBookingType] = useState<'Virtual' | 'Phone Call' | 'Office Visit' | 'Property Showing'>('Property Showing');
  const [bookingPropId, setBookingPropId] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const leadsData = await leadService.getLeads(realtor.id);
      const bookingsData = await bookingService.getBookings(realtor.id);
      setLeads(leadsData);
      setBookings(bookingsData);
    }
    fetchData();
  }, [realtor.id]);

  useEffect(() => {
    setShowPhone(false);
  }, [selectedLead?.id]);

  const handleStatusChange = async (leadId: string, newStatus: any) => {
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        const updated = { ...l, status: newStatus };
        leadService.updateLead(updated);
        return updated;
      }
      return l;
    });
    setLeads(updatedLeads);
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Lead status updated to ${newStatus}`);
  };



  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim()) return;

    // Construct the formatted note string with Date and Time automatically
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const day = now.getDate();
    const year = now.getFullYear();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const formattedNote = `━━━━━━━━━━━━━━━\n${month} ${day} ${year}\n${timeStr}\n\n${newNote.trim()}\n━━━━━━━━━━━━━━━`;

    const updatedLead = await leadService.addNoteToLead(leadId, formattedNote);
    if (updatedLead) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: updatedLead.notes } : l));
      setSelectedLead(prev => prev && prev.id === leadId ? { ...prev, notes: updatedLead.notes } : prev);
      setNewNote('');
      showToast('Private note saved successfully.');
    }
  };

  const openBookingModal = (lead: Inquiry) => {
    setSelectedLead(lead);
    setBookingPropId(lead.property_id ? lead.property_id.toString() : '');
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const matchedProperty = properties.find(p => p.property_id.toString() === bookingPropId);

    const confirmationText = `Hi ${selectedLead.name},\n\nYour appointment for ${matchedProperty ? matchedProperty.title : 'Consultation'} has been confirmed.\n\nDate: ${bookingDate}\nTime: ${bookingTime}\n\nLooking forward to meeting you.\n\n${realtor.name}\nGetSFT`;

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      realtorId: realtor.id,
      leadId: selectedLead.id,
      name: selectedLead.name,
      email: selectedLead.email,
      phone: selectedLead.phone,
      date: bookingDate,
      time: bookingTime,
      meetingType: bookingType,
      propertyId: matchedProperty ? matchedProperty.property_id : undefined,
      propertyTitle: matchedProperty ? matchedProperty.title : undefined,
      status: 'Pending',
      appointmentMessage: confirmationText
    };

    // 1. Automatically insert booking
    const createdBooking = await bookingService.addBooking(newBooking);
    if (onAddBooking) {
      onAddBooking(createdBooking);
    }

    // 2. Generate the automated note about the booking for timeline history (Lead Chat)
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const day = now.getDate();
    const year = now.getFullYear();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const formattedBookingDate = formatLongDate(bookingDate);
    const automaticNote = `━━━━━━━━━━━━━━━\n${month} ${day} ${year}\n${timeStr}\n\n📅 Meeting Scheduled\nDate: ${formattedBookingDate}\nTime: ${bookingTime}\nType: ${bookingType}\nStatus: Meeting Scheduled\n━━━━━━━━━━━━━━━`;

    // 3. Update the lead's notes and status to 'Meeting Scheduled' in Lead Pipeline
    const updatedLead: Inquiry = {
      ...selectedLead,
      status: 'Meeting Scheduled',
      notes: [...(selectedLead.notes || []), automaticNote]
    };

    await leadService.updateLead(updatedLead);

    // Update the local state React trees instantly
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
    setBookings(prev => [createdBooking, ...prev]);

    setIsBookingModalOpen(false);
    showToast(`Successfully booked meeting with ${selectedLead.name}. Go to Bookings to send notification.`);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Name and email are required fields.');
      return;
    }

    const matchedProperty = properties.find(p => p.property_id.toString() === newPropertyId);
    const newLeadData: any = {
      property_id: matchedProperty ? matchedProperty.property_id : (properties[0]?.property_id || 1),
      property_title: matchedProperty ? matchedProperty.title : (properties[0]?.title || 'General Consultation'),
      realtor_id: realtor.id,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || 'No Phone',
      message: newMessage.trim() || 'Manual lead entry created.',
      budget: newBudget,
      source: newSource,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
    };

    const createdLead = await leadService.createLead(newLeadData);
    const updatedLeads = [createdLead, ...leads];
    setLeads(updatedLeads);
    if (onUpdateInquiries) {
      onUpdateInquiries(updatedLeads);
    }

    // Reset Form fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewMessage('');
    setNewBudget('CAD 750,000');
    setNewPropertyId(properties[0]?.property_id.toString() || '');
    setNewSource('Personal Website');
    setIsAddLeadModalOpen(false);

    showToast(`Lead created successfully for ${createdLead.name}!`);
  };

  const statusColors = {
    'New': 'bg-amber-100 text-amber-800 border-amber-300',
    'Contacted': 'bg-blue-100 text-blue-800 border-blue-300',
    'Meeting Scheduled': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Offer Submitted': 'bg-purple-100 text-purple-800 border-purple-300',
    'Closed': 'bg-neutral-800 text-white border-neutral-900',
    'Lost': 'bg-red-100 text-red-800 border-red-300',
  };

  // Find booking for the currently selected lead
  const selectedLeadBooking = bookings.find(b => b.leadId === selectedLead?.id);

  const parseNote = (noteText: string) => {
    // strip the ━━━━━━━━━━━━━━━ lines and redundant spaces
    const cleanText = noteText.replace(/━+/g, '').trim();
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    
    if (lines.length >= 3) {
      const dateLine = lines[0];
      const timeLine = lines[1];
      const content = lines.slice(2).join('\n');
      const isMeeting = content.includes('📅 Meeting Scheduled') || content.includes('Meeting Scheduled');
      return {
        date: dateLine,
        time: timeLine,
        content: content,
        isMeeting: isMeeting
      };
    }
    
    return {
      date: 'Log Entry',
      time: '',
      content: cleanText,
      isMeeting: cleanText.includes('📅 Meeting Scheduled') || cleanText.includes('Meeting Scheduled')
    };
  };

  const filteredLeads = leads.filter(lead => {
    // 1. Customer Name Filter
    if (searchName.trim() && !lead.name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // 2. Property Name Filter
    if (selectedPropertyId !== 'all' && lead.property_id?.toString() !== selectedPropertyId) {
      return false;
    }

    // 3. Date Filter
    if (datePreset !== 'all') {
      const leadDate = new Date(lead.date);
      const now = new Date();
      
      if (datePreset === 'today') {
        if (leadDate.toDateString() !== now.toDateString()) {
          return false;
        }
      } else if (datePreset === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (leadDate < sevenDaysAgo) {
          return false;
        }
      } else if (datePreset === 'month') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (leadDate < thirtyDaysAgo) {
          return false;
        }
      } else if (datePreset === 'custom' && customDate) {
        const targetDate = new Date(customDate + 'T00:00:00');
        if (leadDate.toDateString() !== targetDate.toDateString()) {
          return false;
        }
      }
    }

    // 4. Booking Calendar Filter
    const leadBooking = bookings.find(b => b.leadId === lead.id);
    if (bookingStatusFilter === 'has_booking' && !leadBooking) {
      return false;
    }
    if (bookingStatusFilter === 'no_booking' && leadBooking) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Interactive Workspace</span>
          <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
            Leads
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Convert inquiries into verified sales. Manage pipeline, log calls, and add unlimited notes.</p>
        </div>
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Lead
        </button>
      </header>

      <div className="bg-white border border-neutral-150 rounded-[24px] overflow-hidden shadow-xs">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-sans font-bold text-base text-neutral-900">Inbox Pipeline</h3>
            <p className="text-xs text-neutral-500 font-sans mt-1">Click any lead to expand details, record client notes, and manage schedule directly below.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono bg-neutral-100 px-4 py-1.5 text-neutral-700 rounded-full uppercase font-bold">
              {filteredLeads.length === leads.length ? `${leads.length} Active Leads` : `${filteredLeads.length} of ${leads.length} Filtered`}
            </span>
          </div>
        </div>

        {/* Quick One-Click Filters Toolbar */}
        <div className="bg-neutral-50/50 p-6 border-b border-neutral-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-wider">Quick Lead Filters (One-Click Actions)</span>
            
            {/* Clear Filters Button if any is set */}
            {(searchName || selectedPropertyId !== 'all' || datePreset !== 'all' || bookingStatusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchName('');
                  setSelectedPropertyId('all');
                  setDatePreset('all');
                  setCustomDate('');
                  setBookingStatusFilter('all');
                }}
                className="px-2.5 py-1 text-[10px] font-mono bg-red-50 text-red-700 hover:bg-red-100 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Customer Name Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Customer Name</label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by customer name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-800 transition-colors"
                />
              </div>
            </div>

            {/* Property Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Property Name</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-800 transition-colors"
              >
                <option value="all">All Properties</option>
                {properties.map(p => (
                  <option key={p.property_id} value={p.property_id.toString()}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter preset / custom */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Date Filter</label>
              <div className="flex gap-1">
                <select
                  value={datePreset}
                  onChange={(e) => {
                    setDatePreset(e.target.value as any);
                    if (e.target.value !== 'custom') setCustomDate('');
                  }}
                  className="px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:border-neutral-800 transition-colors flex-1"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Inquired Today</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                  <option value="custom">Choose Date...</option>
                </select>
                
                {datePreset === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-2 py-1 border border-neutral-200 rounded-xl text-[11px] bg-white focus:outline-none focus:border-neutral-800 w-28"
                  />
                )}
              </div>
            </div>

            {/* Booking Calendar Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Booking Calendar Status</label>
              <div className="flex bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter('all')}
                  className={`flex-1 text-[10px] py-1 rounded-lg font-bold font-sans transition-all cursor-pointer ${bookingStatusFilter === 'all' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter('has_booking')}
                  className={`flex-1 text-[10px] py-1 rounded-lg font-bold font-sans transition-all cursor-pointer ${bookingStatusFilter === 'has_booking' ? 'bg-teal-600 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Has Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter('no_booking')}
                  className={`flex-1 text-[10px] py-1 rounded-lg font-bold font-sans transition-all cursor-pointer ${bookingStatusFilter === 'no_booking' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  No Meeting
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm font-sans italic">
            {leads.length === 0 ? 'No buyer inquiries recorded yet.' : 'No leads match your active filters.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredLeads.map((lead) => {
              const leadStatus = (lead.status as any) || 'New';
              const leadBooking = bookings.find(b => b.leadId === lead.id);
              const isSelected = selectedLead?.id === lead.id;

              return (
                <div 
                  key={lead.id} 
                  className={`p-6 transition-all ${isSelected ? 'bg-teal-50/10 border-l-4 border-teal-600' : 'hover:bg-neutral-50/15 border-l-4 border-transparent'}`}
                >
                  {/* Lead Row Header - Clickable area to toggle */}
                  <div 
                    className="flex flex-col md:flex-row justify-between gap-4 cursor-pointer select-none"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLead(null);
                      } else {
                        setSelectedLead(lead);
                      }
                    }}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-sans font-extrabold text-base text-neutral-900">{lead.name}</span>
                            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                              via {lead.source || 'Marketplace'}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500 font-sans block mt-1">
                            Interested property: <span className="text-neutral-900 font-bold">{lead.property_title}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        <span className="text-xs font-mono bg-teal-50/90 text-teal-900 border border-teal-200/50 font-bold px-3 py-1 rounded-full shadow-2xs">
                          Budget: {lead.budget || 'CAD 850,000'}
                        </span>
                        {leadBooking && (
                          <span className="text-xs font-mono bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                            📅 Booking Confirmed: {formatBookingBadgeDate(leadBooking.date, leadBooking.time)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-600 italic bg-neutral-50/70 p-4 rounded-xl border border-neutral-150 max-w-2xl leading-relaxed">
                        "{lead.message}"
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-neutral-500 font-medium">
                          {new Date(lead.date).toLocaleDateString()}
                        </span>
                        <div className="text-neutral-500">
                          {isSelected ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={leadStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-mono font-bold tracking-wide uppercase px-3.5 py-2 rounded-full border cursor-pointer outline-none shadow-2xs ${
                          statusColors[leadStatus as keyof typeof statusColors] || 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <option value="New">🟡 New</option>
                        <option value="Contacted">🔵 Contacted</option>
                        <option value="Meeting Scheduled">🟢 Meeting Scheduled</option>
                        <option value="Offer Submitted">🟣 Offer Submitted</option>
                        <option value="Closed">⚫ Closed</option>
                        <option value="Lost">🔴 Lost</option>
                      </select>
                    </div>
                  </div>

                  {/* Expandable Lead Profile & Note-Taking Workspace Directly Below */}
                  {isSelected && (
                    <div 
                      className="mt-6 pt-6 border-t border-neutral-150 animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Column 1: Contact Details, Active Booking Schedule & Quick Actions (lg:col-span-5) */}
                        <div className="lg:col-span-5 space-y-6 bg-[#fafafa]/90 p-6 rounded-2xl border border-neutral-150">
                          <div>
                            <span className="text-xs font-mono uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full font-bold border border-teal-100">
                              Lead Contact Info
                            </span>
                            <h4 className="text-base font-sans font-extrabold text-neutral-900 mt-3">Dossier details</h4>
                          </div>

                          <div className="grid grid-cols-1 gap-4 bg-white p-4.5 rounded-xl border border-neutral-100 shadow-2xs">
                            <div className="flex items-center gap-3.5 text-xs">
                              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-100">
                                <Mail className="w-4 h-4 text-teal-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] text-neutral-500 font-mono block uppercase tracking-wider font-semibold">Email Address</span>
                                <span className="font-semibold text-neutral-800 break-all select-all block text-sm mt-0.5">{lead.email}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5 text-xs border-t border-neutral-100/50 pt-3.5">
                              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-100">
                                <Phone className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] text-neutral-500 font-mono block uppercase tracking-wider font-semibold">Direct Phone</span>
                                <span className="font-semibold text-neutral-950 block select-all text-sm mt-0.5">{lead.phone}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5 text-xs border-t border-neutral-100/50 pt-3.5">
                              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0 border border-neutral-100">
                                <Clock className="w-4 h-4 text-amber-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] text-neutral-500 font-mono block uppercase tracking-wider font-semibold">Interested Property</span>
                                <span className="font-semibold text-neutral-850 block truncate text-sm mt-0.5">{lead.property_title}</span>
                              </div>
                            </div>
                          </div>

                          {/* Active Schedule (if booked) */}
                          {leadBooking ? (
                            <div className="bg-emerald-50/40 border border-emerald-150 rounded-xl p-4.5 space-y-2.5">
                              <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-800 block">Active Schedule</span>
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-sm font-bold text-neutral-850 block">
                                    {leadBooking.meetingType} Consultation
                                  </span>
                                  <span className="text-xs text-neutral-600 font-mono block mt-1">
                                    {formatLongDate(leadBooking.date)} • {leadBooking.time}
                                  </span>
                                </div>
                                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded font-bold uppercase shrink-0">
                                  {leadBooking.status === 'Pending' ? 'Scheduled' : leadBooking.status}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-4.5 text-center">
                              <span className="text-xs text-neutral-500 font-sans italic block">No consultation meeting scheduled yet.</span>
                            </div>
                          )}

                          {/* Quick Action Suite */}
                          <div className="space-y-3 pt-1">
                            <span className="block text-xs font-sans font-bold uppercase tracking-wider text-neutral-500">Action Suite</span>
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setShowPhone(!showPhone)}
                                className="flex items-center justify-center gap-2 px-3 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer text-center shadow-xs active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" /> 
                                <span className="truncate">{showPhone ? lead.phone : 'Call Lead'}</span>
                              </button>
                              <button 
                                onClick={() => {
                                  const cleanPhone = lead.phone.replace(/[^\d]/g, '');
                                  window.open('https://wa.me/' + cleanPhone, '_blank');
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer text-center shadow-xs active:scale-95"
                              >
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" /> 
                                <span>WhatsApp</span>
                              </button>
                            </div>

                            <button 
                              onClick={() => openBookingModal(lead)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold font-sans shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Book Consultation Meeting
                            </button>
                          </div>
                        </div>

                        {/* Column 2: Timeline, Logs & Real-time Notes Feed (lg:col-span-7) */}
                        <div className="lg:col-span-7 space-y-5">
                          <span className="block text-xs font-sans font-bold uppercase tracking-wider text-neutral-500">Interaction History Timeline</span>
                          
                          <div className="relative pl-5 border-l border-neutral-200 space-y-5 max-h-[280px] overflow-y-auto pr-1">
                            {(!lead.notes || lead.notes.length === 0) ? (
                              <div className="flex items-center gap-2.5 text-sm font-sans italic text-neutral-400 py-2">
                                <Clock className="w-4 h-4 text-neutral-300" />
                                <span>No timeline logs recorded yet. Add your first note below.</span>
                              </div>
                            ) : (
                              lead.notes.map((note, index) => {
                                const parsed = parseNote(note);
                                return (
                                  <div key={index} className="relative group">
                                    {/* Timeline dot accent */}
                                    <div className={`absolute -left-[24.5px] top-2 w-2.5 h-2.5 rounded-full border-2 bg-white transition-all ${
                                      parsed.isMeeting 
                                        ? 'border-emerald-500 scale-125' 
                                        : 'border-neutral-400 group-hover:border-black'
                                    }`} />
                                    
                                    <div className={`p-4 rounded-xl border transition-all ${
                                      parsed.isMeeting 
                                        ? 'bg-emerald-50/30 border-emerald-150 text-emerald-950 shadow-xs' 
                                        : 'bg-white border-neutral-100 hover:border-neutral-200 shadow-xs'
                                    }`}>
                                      <div className="flex justify-between items-center gap-2 mb-1.5">
                                        <span className="text-xs font-semibold text-neutral-500 font-mono block tracking-wide">
                                          {parsed.date}
                                        </span>
                                        <span className="text-xs font-mono text-neutral-500 block">
                                          {parsed.time}
                                        </span>
                                      </div>
                                      
                                      {parsed.isMeeting ? (
                                        <div className="space-y-1">
                                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">📅 Scheduled Event</span>
                                          <p className="text-sm text-emerald-900 leading-relaxed font-sans whitespace-pre-line font-medium">
                                            {parsed.content.replace('📅 Meeting Scheduled\n', '').replace('📅 Meeting Scheduled', '')}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-neutral-800 leading-relaxed font-sans whitespace-pre-line">
                                          {parsed.content}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Add Note box inside the accordion */}
                          <div className="flex gap-2 bg-neutral-50 hover:bg-neutral-50/80 p-2 rounded-xl border border-neutral-200 shadow-2xs focus-within:border-black focus-within:bg-white transition-all">
                            <textarea
                              placeholder="Type private agent comment or buyer status note..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              className="flex-1 min-h-[50px] px-3 py-2 bg-transparent text-sm outline-none resize-none placeholder-neutral-400 font-sans text-neutral-800"
                            />
                            <button
                              onClick={() => handleAddNote(lead.id)}
                              className="px-4 bg-black hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95"
                              title="Save Note to Timeline"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK CLIENT BOOKING MODAL */}
      {isBookingModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-150 p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950">
              Schedule Client Meeting
            </h3>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Buyer Name</label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedLead.name} 
                  className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-sans cursor-not-allowed text-neutral-850 font-semibold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Time</label>
                  <input 
                    type="text" 
                    value={bookingTime} 
                    onChange={(e) => setBookingTime(e.target.value)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black" 
                    placeholder="e.g. 3:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Meeting Type</label>
                <select 
                  value={bookingType} 
                  onChange={(e) => setBookingType(e.target.value as any)} 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                >
                  <option value="Property Showing">Property Showing</option>
                  <option value="Virtual">Virtual Consultation</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Office Visit">Office Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Interested Property</label>
                <select 
                  value={bookingPropId} 
                  onChange={(e) => setBookingPropId(e.target.value)} 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                >
                  <option value="">No Property Specific</option>
                  {properties.map(p => (
                    <option key={p.property_id} value={p.property_id.toString()}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-sans font-medium rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full cursor-pointer shadow-sm"
                >
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADD NEW LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] border border-neutral-150 p-8 max-w-md w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950">
                Add New Lead
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-1">Manually insert a prospective client inquiry into your workflow.</p>
            </div>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@email.com"
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +1 (555) 019-2834"
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Estimated Budget</label>
                  <select 
                    value={newBudget} 
                    onChange={(e) => setNewBudget(e.target.value)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                  >
                    <option value="CAD 500,000">CAD 500,000</option>
                    <option value="CAD 750,000">CAD 750,000</option>
                    <option value="CAD 1,000,000">CAD 1,000,000</option>
                    <option value="CAD 1,500,000">CAD 1,500,000</option>
                    <option value="CAD 2,000,000+">CAD 2,000,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Lead Source</label>
                  <select 
                    value={newSource} 
                    onChange={(e) => setNewSource(e.target.value as any)} 
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                  >
                    <option value="Personal Website">Personal Website</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Direct Link">Direct Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Interested Property</label>
                <select 
                  value={newPropertyId} 
                  onChange={(e) => setNewPropertyId(e.target.value)} 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                >
                  <option value="">No Property Specific</option>
                  {properties.map(p => (
                    <option key={p.property_id} value={p.property_id.toString()}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-1">Initial Inquiry / Message Note</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Inquired about pricing. Wants to check local school catchments."
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black resize-none bg-white" 
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-sans font-medium rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full cursor-pointer shadow-sm"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
