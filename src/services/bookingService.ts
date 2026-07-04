import { Booking } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from '../firebase';

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
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      if (snap.empty) {
        console.log('Seeding initial bookings...');
        for (const b of INITIAL_BOOKINGS) {
          await setDoc(doc(db, 'bookings', b.id), b);
        }
        return realtorId ? INITIAL_BOOKINGS.filter(b => b.realtorId === realtorId) : INITIAL_BOOKINGS;
      }
      const bookings: Booking[] = [];
      snap.forEach(docSnap => {
        bookings.push(docSnap.data() as Booking);
      });
      if (realtorId) {
        return bookings.filter(b => b.realtorId === realtorId);
      }
      return bookings;
    } catch (err) {
      console.error('Error fetching bookings from Firestore:', err);
      return realtorId ? INITIAL_BOOKINGS.filter(b => b.realtorId === realtorId) : INITIAL_BOOKINGS;
    }
  },

  async addBooking(booking: Booking): Promise<Booking> {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      return booking;
    } catch (err) {
      console.error('Error adding booking to Firestore:', err);
      throw err;
    }
  },

  async updateBooking(booking: Booking): Promise<Booking> {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      return booking;
    } catch (err) {
      console.error('Error updating booking in Firestore:', err);
      throw err;
    }
  },

  async deleteBooking(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      return true;
    } catch (err) {
      console.error('Error deleting booking from Firestore:', err);
      return false;
    }
  }
};
