import { Inquiry } from '../types';
import { db, collection, doc, getDocs, getDoc, setDoc } from '../firebase';
import { INITIAL_INQUIRIES } from '../mockData';

export const leadService = {
  async getLeads(realtorId?: string): Promise<Inquiry[]> {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      if (snap.empty) {
        console.log('Seeding initial inquiries...');
        for (const inq of INITIAL_INQUIRIES) {
          await setDoc(doc(db, 'inquiries', inq.id), inq);
        }
        return realtorId ? INITIAL_INQUIRIES.filter(i => i.realtor_id === realtorId) : INITIAL_INQUIRIES;
      }
      const inquiries: Inquiry[] = [];
      snap.forEach(docSnap => {
        inquiries.push(docSnap.data() as Inquiry);
      });
      const enriched = inquiries.map(inq => ({
        ...inq,
        budget: inq.budget || 'CAD 850,000',
        source: inq.source || (inq.id === 'inq-1' ? 'Personal Website' : inq.id === 'inq-2' ? 'Direct Link' : 'Marketplace'),
        status: inq.status || 'New',
        notes: inq.notes || [inq.message || 'Initial inquiry registered in system.']
      }));
      if (realtorId) {
        return enriched.filter(i => i.realtor_id === realtorId);
      }
      return enriched;
    } catch (err) {
      console.error('Error fetching leads from Firestore:', err);
      const enrichedInitial = INITIAL_INQUIRIES.map(inq => ({
        ...inq,
        budget: inq.budget || 'CAD 850,000',
        source: inq.source || (inq.id === 'inq-1' ? 'Personal Website' : inq.id === 'inq-2' ? 'Direct Link' : 'Marketplace'),
        status: inq.status || 'New',
        notes: inq.notes || [inq.message || 'Initial inquiry registered in system.']
      }));
      if (realtorId) {
        return enrichedInitial.filter(i => i.realtor_id === realtorId);
      }
      return enrichedInitial;
    }
  },

  async updateLead(lead: Inquiry): Promise<Inquiry> {
    try {
      await setDoc(doc(db, 'inquiries', lead.id), lead);
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
      await setDoc(doc(db, 'inquiries', leadId), newLead);
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
        await setDoc(docRef, updated);
        return updated;
      }
      return undefined;
    } catch (err) {
      console.error('Error adding note to lead in Firestore:', err);
      return undefined;
    }
  }
};
