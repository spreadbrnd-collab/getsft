import { Property } from '../types';
import { db, collection, doc, getDocs, getDoc, setDoc, deleteDoc, cleanForFirestore } from '../firebase';

export const propertyService = {
  async getProperties(): Promise<Property[] | null> {
    try {
      const snap = await getDocs(collection(db, 'properties'));
      const properties: Property[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as Property;
        if (data && data.owner_id !== 'david' && data.owner_id !== 'sarah' && data.owner_id !== 'julian') {
          properties.push(data);
        }
      });
      return properties.sort((a, b) => b.property_id - a.property_id);
    } catch (err) {
      console.error('Error in propertyService.getProperties:', err);
      return null;
    }
  },

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const docSnap = await getDoc(doc(db, 'properties', id.toString()));
      if (docSnap.exists()) {
        const data = docSnap.data() as Property;
        if (data.owner_id !== 'david' && data.owner_id !== 'sarah' && data.owner_id !== 'julian') {
          return data;
        }
      }
      const all = await this.getProperties();
      return all ? all.find(p => p.property_id === id) : undefined;
    } catch (err) {
      console.error('Error in propertyService.getPropertyById:', err);
      return undefined;
    }
  },

  async addProperty(property: Property): Promise<Property> {
    try {
      const cleaned = cleanForFirestore(property);
      await setDoc(doc(db, 'properties', property.property_id.toString()), cleaned);
      return property;
    } catch (err) {
      console.error('Error adding property to Firestore:', err);
      throw err;
    }
  },

  async updateProperty(property: Property): Promise<Property> {
    try {
      const cleaned = cleanForFirestore(property);
      await setDoc(doc(db, 'properties', property.property_id.toString()), cleaned);
      return property;
    } catch (err) {
      console.error('Error updating property in Firestore:', err);
      throw err;
    }
  },

  async deleteProperty(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'properties', id.toString()));
      return true;
    } catch (err) {
      console.error('Error deleting property from Firestore:', err);
      return false;
    }
  }
};
