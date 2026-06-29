import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Mail, CheckCircle, XCircle, Trash2, Send, MessageSquare } from 'lucide-react';
import { Booking, Realtor, Property } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingsTabProps {
  currentUser: { id: string };
  realtor: Realtor;
  properties: Property[];
  showToast: (msg: string) => void;
}

export default function BookingsTab({
  currentUser,
  realtor,
  properties,
  showToast,
}: BookingsTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [meetingFilter, setMeetingFilter] = useState<'all' | 'upcoming' | 'booked'>('all');

  // Reschedule Dialog State
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('2026-07-12');
  const [newTime, setNewTime] = useState('3:00 PM');

  useEffect(() => {
    async function load() {
      const data = await bookingService.getBookings(realtor.id);
      setBookings(data);
    }
    load();
  }, [realtor.id]);

  const handleUpdateStatus = async (booking: Booking, status: 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled') => {
    const updated = { ...booking, status };
    
    if (status === 'Accepted') {
      // Trigger modal letting realtor customize the confirmation message before Whatsapp
      setSelectedBooking(updated);
      setEditedMessage(booking.appointmentMessage || `Hi ${booking.name},\n\nYour appointment for ${booking.propertyTitle || 'Consultation'} has been confirmed.\n\nDate: ${booking.date}\nTime: ${booking.time}\n\nLooking forward to meeting you.\n\n${realtor.name}\nGetSFT`);
      setIsModalOpen(true);
    } else {
      await bookingService.updateBooking(updated);
      setBookings(prev => prev.map(b => b.id === booking.id ? updated : b));
      showToast(`Booking status updated to ${status}`);
    }
  };

  const handleConfirmAcceptModal = async () => {
    if (!selectedBooking) return;
    const finalBooking = { ...selectedBooking, appointmentMessage: editedMessage, status: 'Accepted' as const };
    await bookingService.updateBooking(finalBooking);
    setBookings(prev => prev.map(b => b.id === finalBooking.id ? finalBooking : b));
    setIsModalOpen(false);
    showToast(`Booking accepted. Ready to dispatch WhatsApp confirmation.`);
    
    // Open WhatsApp link immediately with custom message
    const rawPhone = finalBooking.phone.replace(/[^\d]/g, '');
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(editedMessage)}`;
    window.open(url, '_blank');
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;

    const updatedMessage = `Hi ${rescheduleBooking.name},\n\nYour appointment for ${rescheduleBooking.propertyTitle || 'Consultation'} has been rescheduled.\n\nNew Date: ${newDate}\nNew Time: ${newTime}\n\nLooking forward to meeting you.\n\n${realtor.name}\nGetSFT`;

    const updated = {
      ...rescheduleBooking,
      date: newDate,
      time: newTime,
      status: 'Rescheduled' as const,
      appointmentMessage: updatedMessage
    };

    await bookingService.updateBooking(updated);
    setBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? updated : b));
    setRescheduleBooking(null);
    showToast(`Booking successfully rescheduled to ${newDate} at ${newTime}`);
  };

  const handleDelete = async (id: string) => {
    const success = await bookingService.deleteBooking(id);
    if (success) {
      setBookings(prev => prev.filter(b => b.id !== id));
      showToast('Booking record deleted successfully.');
    }
  };

  const statusBadges = {
    'Pending': 'bg-amber-100 text-amber-800 border border-amber-200',
    'Accepted': 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold',
    'Rejected': 'bg-red-50 text-red-700 border border-red-200',
    'Rescheduled': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  };

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Interactive Workspace</span>
        <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
          CRM Bookings Calendar
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Manage scheduled virtual calls, office conferences, or live property tours instantly with clients.</p>
      </header>

      {/* Grid: Left - Calendar style appointments timeline. Right - Quick details list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Appointments Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-white border border-neutral-150 rounded-[24px]">
            
            {/* One-click Meetings filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-sans font-bold text-base text-neutral-900">Schedules Overview</h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">Filter schedule views in a single click.</p>
              </div>
              
              <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setMeetingFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${meetingFilter === 'all' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  All Scheduled ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${meetingFilter === 'upcoming' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Upcoming ({bookings.filter(b => b.date >= new Date().toISOString().split('T')[0]).length})
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingFilter('booked')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${meetingFilter === 'booked' ? 'bg-teal-600 text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                >
                  Booked ({bookings.filter(b => b.status === 'Accepted').length})
                </button>
              </div>
            </div>
            
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const filteredBookings = bookings.filter(book => {
                if (meetingFilter === 'upcoming') {
                  return book.date >= todayStr;
                }
                if (meetingFilter === 'booked') {
                  return book.status === 'Accepted';
                }
                return true;
              });

              if (filteredBookings.length === 0) {
                return (
                  <div className="text-center py-20 text-neutral-400 text-xs font-sans italic">
                    {bookings.length === 0 ? 'No bookings found. Link meetings using the CRM Leads page.' : 'No meetings match your selected filter.'}
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredBookings.map((book) => (
                    <div key={book.id} className="p-5 border border-neutral-100 rounded-2xl bg-white hover:bg-teal-50/10 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-bold text-sm text-neutral-900">{book.name}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${statusBadges[book.status] || 'bg-neutral-100'}`}>
                          {book.status}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded uppercase">
                          {book.meetingType}
                        </span>
                      </div>

                      {book.propertyTitle && (
                        <span className="text-xs text-neutral-500 font-sans block">
                          Property: <span className="font-semibold text-neutral-800">{book.propertyTitle}</span>
                        </span>
                      )}

                      <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                        <span className="flex items-center gap-1 text-teal-800 font-bold"><Calendar className="w-3.5 h-3.5" /> {book.date}</span>
                        <span className="flex items-center gap-1 text-indigo-700 font-bold"><Clock className="w-3.5 h-3.5" /> {book.time}</span>
                      </div>
                    </div>

                    {/* Booking Control buttons */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      {book.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(book, 'Accepted')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono uppercase tracking-wider font-bold rounded-lg cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(book, 'Rejected')}
                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-mono uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setRescheduleBooking(book);
                          setNewDate(book.date);
                          setNewTime(book.time);
                        }}
                        className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-mono uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        Reschedule
                      </button>

                      {book.status === 'Accepted' && (
                        <button
                          onClick={() => {
                            const rawPhone = book.phone.replace(/[^\d]/g, '');
                            const msg = book.appointmentMessage || `Hi ${book.name},\n\nYour appointment regarding ${book.propertyTitle || 'Consultation'} is confirmed on ${book.date} at ${book.time}.`;
                            window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Resend via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-1.5 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          </div>
        </div>

        {/* Quick Help Guide */}
        <div className="bg-white border border-neutral-150 rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-mono tracking-wider uppercase text-teal-800 font-bold">Client Confirmation Flow</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            When a client requests a listing showing on David's website, they instantly trigger a Booking request.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">1</span>
              <p className="text-xs text-neutral-700 leading-tight">Click <strong>Accept</strong> to generate a confirmation card for the buyer.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">2</span>
              <p className="text-xs text-neutral-700 leading-tight">Review or customize the auto-generated notification message text.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">3</span>
              <p className="text-xs text-neutral-700 leading-tight">Click <strong>Send via WhatsApp</strong> to initiate the chat immediately with pre-filled content.</p>
            </div>
          </div>
        </div>
      </div>

      {/* APPOINTMENT MODAL */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-150 p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950">
                Confirm Client Appointment
              </h3>
              <p className="text-xs text-neutral-500">Edit the template text below before launching the WhatsApp message.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Recipient Buyer</label>
                <div className="text-xs font-mono font-bold text-neutral-800 bg-white p-3 rounded-lg border border-neutral-150">
                  {selectedBooking.name} ({selectedBooking.phone})
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Appointment SMS / WhatsApp Template</label>
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full min-h-[160px] p-4 bg-white border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-sans font-medium rounded-full cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmAcceptModal}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-medium rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE DIALOG */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-150 p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950">
              Reschedule Meeting
            </h3>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">New Time</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black"
                  placeholder="e.g. 11:30 AM"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-sans font-medium rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full cursor-pointer shadow-sm"
                >
                  Reschedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
