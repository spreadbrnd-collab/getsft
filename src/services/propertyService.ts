import { Property } from '../types';
import { db, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from '../firebase';
import { INITIAL_PROPERTIES } from '../mockData';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      const snap = await getDocs(collection(db, 'properties'));
      if (snap.empty) {
        console.log('No properties found in Firestore. Seeding initial properties...');
        for (const p of INITIAL_PROPERTIES) {
          await setDoc(doc(db, 'properties', p.property_id.toString()), p);
        }
        return INITIAL_PROPERTIES;
      }
      const properties: Property[] = [];
      snap.forEach(docSnap => {
        properties.push(docSnap.data() as Property);
      });
      return properties.sort((a, b) => b.property_id - a.property_id);
    } catch (err) {
      console.error('Error in propertyService.getProperties:', err);
      return INITIAL_PROPERTIES;
    }
  },

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const docSnap = await getDoc(doc(db, 'properties', id.toString()));
      if (docSnap.exists()) {
        return docSnap.data() as Property;
      }
      const all = await this.getProperties();
      return all.find(p => p.property_id === id);
    } catch (err) {
      console.error('Error in propertyService.getPropertyById:', err);
      return INITIAL_PROPERTIES.find(p => p.property_id === id);
    }
  },

  async addProperty(property: Property): Promise<Property> {
    try {
      await setDoc(doc(db, 'properties', property.property_id.toString()), property);
      return property;
    } catch (err) {
      console.error('Error adding property to Firestore:', err);
      throw err;
    }
  },

  async updateProperty(property: Property): Promise<Property> {
    try {
      await setDoc(doc(db, 'properties', property.property_id.toString()), property);
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
