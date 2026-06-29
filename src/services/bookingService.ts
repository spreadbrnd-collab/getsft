import { Booking } from '../types';

const BOOKINGS_KEY = 'getsft_bookings';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    realtorId: 'david',
    leadId: 'inq-1',
    name: 'Eleanor Vance',
    email: 'eleanor@vancearchitects.com',
    phone: '+17785558912',
    date: '2026-07-12',
    time: '3:00 PM',
    meetingType: 'Property Showing',
    propertyId: 1284,
    propertyTitle: 'The Obsidian Pavilion',
    status: 'Pending',
    appointmentMessage: 'Hi Eleanor,\n\nYour appointment for The Obsidian Pavilion has been confirmed.\n\nDate: July 12 2026\nTime: 3:00 PM\n\nLooking forward to meeting you.\n\nDavid Vandervelde\nGetSFT'
  },
  {
    id: 'book-2',
    realtorId: 'david',
    leadId: 'inq-2',
    name: 'René Larson',
    email: 'rlarson@equinoxnord.com',
    phone: '+16045553810',
    date: '2026-06-29',
    time: '11:00 AM',
    meetingType: 'Virtual',
    propertyId: 1284,
    propertyTitle: 'The Obsidian Pavilion',
    status: 'Accepted',
    appointmentMessage: 'Hi René,\n\nYour appointment for Virtual consultation regarding The Obsidian Pavilion has been confirmed.\n\nDate: June 29 2026\nTime: 11:00 AM\n\nLooking forward to meeting you.\n\nDavid Vandervelde\nGetSFT'
  }
];

export const bookingService = {
  async getBookings(realtorId?: string): Promise<Booking[]> {
    if (typeof window === 'undefined') return INITIAL_BOOKINGS;
    const stored = localStorage.getItem(BOOKINGS_KEY);
    let bookings: Booking[] = stored ? JSON.parse(stored) : INITIAL_BOOKINGS;
    if (realtorId) {
      bookings = bookings.filter(b => b.realtorId === realtorId);
    }
    return bookings;
  },
  async saveBookings(bookings: Booking[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
  },
  async addBooking(booking: Booking): Promise<Booking> {
    const bookings = await this.getBookings();
    bookings.unshift(booking);
    await this.saveBookings(bookings);
    return booking;
  },
  async updateBooking(booking: Booking): Promise<Booking> {
    const bookings = await this.getBookings();
    const updated = bookings.map(b => b.id === booking.id ? booking : b);
    await this.saveBookings(updated);
    return booking;
  },
  async deleteBooking(id: string): Promise<boolean> {
    const bookings = await this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    await this.saveBookings(filtered);
    return bookings.length > filtered.length;
  }
};
