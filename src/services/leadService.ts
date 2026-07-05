import { Inquiry } from '../types';
import { db, collection, doc, getDocs, getDoc, setDoc, cleanForFirestore } from '../firebase';

export const leadService = {
  async getLeads(realtorId?: string): Promise<Inquiry[] | null> {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      const inquiries: Inquiry[] = [];
      snap.forEach(docSnap => {
        const inq = docSnap.data() as Inquiry;
        if (inq && inq.realtor_id !== 'david' && inq.realtor_id !== 'sarah' && inq.realtor_id !== 'julian') {
          inquiries.push(inq);
        }
      });
      const enriched = inquiries.map(inq => ({
        ...inq,
        budget: inq.budget || 'CAD 850,000',
        source: inq.source || 'Marketplace',
        status: inq.status || 'New',
        notes: inq.notes || [inq.message || 'Initial inquiry registered in system.']
      }));
      if (realtorId) {
        return enriched.filter(i => i.realtor_id === realtorId);
      }
      return enriched;
    } catch (err) {
      console.error('Error fetching leads from Firestore:', err);
      return null;
    }
  },

  async updateLead(lead: Inquiry): Promise<Inquiry> {
    try {
      const cleaned = cleanForFirestore(lead);
      await setDoc(doc(db, 'inquiries', lead.id), cleaned);
      return lead;
    } catch (err) {
      console.error('Error updating lead in Firestore:', err);
      throw err;
    }
  },

  async createLead(lead: Omit<Inquiry, 'id'> & { id?: string }): Promise<Inquiry> {
    try {
      const leadId = lead.id || `inq-${Date.now()}`;
      const newLead: Inquiry = {
        ...lead,
        id: leadId,
        status: lead.status || 'New',
        notes: lead.notes || [lead.message || 'Manual lead entry created.']
      };
      const cleaned = cleanForFirestore(newLead);
      await setDoc(doc(db, 'inquiries', leadId), cleaned);
      return newLead;
    } catch (err) {
      console.error('Error creating lead in Firestore:', err);
      throw err;
    }
  },

  async addNoteToLead(leadId: string, note: string): Promise<Inquiry | undefined> {
    try {
      const docRef = doc(db, 'inquiries', leadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const lead = docSnap.data() as Inquiry;
        const notes = lead.notes || [];
        notes.push(note);
        const updated = { ...lead, notes };
        const cleaned = cleanForFirestore(updated);
        await setDoc(docRef, cleaned);
        return updated;
      }
      return undefined;
    } catch (err) {
      console.error('Error adding note to lead in Firestore:', err);
      return undefined;
    }
  }
};
