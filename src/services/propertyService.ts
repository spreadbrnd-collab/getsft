import { Property } from '../types';
import { loadState, saveState } from '../mockData';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    const state = loadState();
    return state.properties;
  },
  async getPropertyById(id: number): Promise<Property | undefined> {
    const state = loadState();
    return state.properties.find(p => p.property_id === id);
  },
  async addProperty(property: Property): Promise<Property> {
    const state = loadState();
    state.properties = [property, ...state.properties];
    saveState(state);
    return property;
  },
  async updateProperty(property: Property): Promise<Property> {
    const state = loadState();
    state.properties = state.properties.map(p => p.property_id === property.property_id ? property : p);
    saveState(state);
    return property;
  },
  async deleteProperty(id: number): Promise<boolean> {
    const state = loadState();
    const initialLen = state.properties.length;
    state.properties = state.properties.filter(p => p.property_id !== id);
    saveState(state);
    return state.properties.length < initialLen;
  }
};
