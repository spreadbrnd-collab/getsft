import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0388026506",
  appId: "1:423964735520:web:210ef6b6a4fae2f3b8e445",
  apiKey: "AIzaSyCoMAbKVVr6wHocLfGiGlxF7NzdhefAO3w",
  authDomain: "gen-lang-client-0388026506.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-getsft-db89fe76-4f5e-40b7-a7de-daf58dcb9186",
  storageBucket: "gen-lang-client-0388026506.firebasestorage.app",
  messagingSenderId: "423964735520"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Safe helper to sync mock data when collections are first created
export async function syncMockDataToFirestore() {
  try {
    const { INITIAL_PROPERTIES, INITIAL_REALTORS } = await import('./mockData');

    // Sync properties
    const propertiesSnap = await getDocs(collection(db, 'properties'));
    if (propertiesSnap.empty) {
      console.log('Populating Firestore properties with default mock data...');
      for (const p of INITIAL_PROPERTIES) {
        await setDoc(doc(db, 'properties', p.property_id.toString()), p);
      }
    }

    // Sync users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log('Populating Firestore users with default mock profiles...');
      for (const r of INITIAL_REALTORS) {
        await setDoc(doc(db, 'users', r.id), {
          id: r.id,
          name: r.name,
          email: `${r.id}@getsft.com`,
          role: 'realtor',
          savedPropertyIds: [],
          realtorProfile: r
        });
      }
    }
  } catch (error) {
    console.error('Failed to auto-seed mock data to Firestore:', error);
  }
}

export { 
  app, 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
};
export type { FirebaseUser };
