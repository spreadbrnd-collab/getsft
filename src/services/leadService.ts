import { Inquiry } from '../types';
import { loadState, saveState } from '../mockData';

export const leadService = {
  async getLeads(realtorId?: string): Promise<Inquiry[]> {
    const state = loadState();
    // Default mock data enrichment if fields are missing
    let inquiries = state.inquiries.map(inq => ({
      ...inq,
      budget: inq.budget || 'CAD 850,000',
      source: inq.source || (inq.id === 'inq-1' ? 'Personal Website' : inq.id === 'inq-2' ? 'Direct Link' : 'Marketplace'),
      status: inq.status || 'New',
      notes: inq.notes || [inq.message || 'Initial inquiry registered in system.']
    }));
    if (realtorId) {
      return inquiries.filter(i => i.realtor_id === realtorId);
    }
    return inquiries;
  },
  async updateLead(lead: Inquiry): Promise<Inquiry> {
    const state = loadState();
    state.inquiries = state.inquiries.map(i => i.id === lead.id ? lead : i);
    saveState(state);
    return lead;
  },
  async createLead(lead: Omit<Inquiry, 'id'> & { id?: string }): Promise<Inquiry> {
    const state = loadState();
    const newLead: Inquiry = {
      ...lead,
      id: lead.id || `inq-${Date.now()}`,
      status: lead.status || 'New',
      notes: lead.notes || [lead.message || 'Manual lead entry created.']
    };
    state.inquiries.push(newLead);
    saveState(state);
    return newLead;
  },
  async addNoteToLead(leadId: string, note: string): Promise<Inquiry | undefined> {
    const state = loadState();
    const leadIndex = state.inquiries.findIndex(i => i.id === leadId);
    if (leadIndex !== -1) {
      const lead = state.inquiries[leadIndex];
      if (!lead.notes) lead.notes = [];
      lead.notes.push(note);
      state.inquiries[leadIndex] = { ...lead };
      saveState(state);
      return lead;
    }
    return undefined;
  }
};
