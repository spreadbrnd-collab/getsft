import { Booking } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from '../firebase';

export const bookingService = {
  async getBookings(realtorId?: string): Promise<Booking[]> {
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      const bookings: Booking[] = [];
      snap.forEach(docSnap => {
        const b = docSnap.data() as Booking;
        if (b && b.realtorId !== 'david' && b.realtorId !== 'sarah' && b.realtorId !== 'julian') {
          bookings.push(b);
        }
      });
      if (realtorId) {
        return bookings.filter(b => b.realtorId === realtorId);
      }
      return bookings;
    } catch (err) {
      console.error('Error fetching bookings from Firestore:', err);
      return [];
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
