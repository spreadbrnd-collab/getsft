import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Safe helper to remove undefined fields recursively from an object before writing to Firestore
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

// Safe helper to clean up legacy mock data when the application mounts
export async function syncMockDataToFirestore() {
  try {
    const dummyRealtorIds = ['david', 'sarah', 'julian'];
    const dummyPropertyIds = ['2001', '2002', '2003', '2004', '2005', '2006', '1284'];
    const dummyInquiryIds = ['inq-1', 'inq-2', 'inq-3', 'inq-4', 'inq-5'];
    const dummyBookingIds = ['book-1', 'book-2'];
    const dummyTaskIds = ['task-1', 'task-2', 'task-3'];

    console.log('Sync initialized: cleaning legacy mock data from Firestore...');

    // Delete dummy users
    for (const uid of dummyRealtorIds) {
      await deleteDoc(doc(db, 'users', uid));
    }

    // Delete dummy properties
    for (const pid of dummyPropertyIds) {
      await deleteDoc(doc(db, 'properties', pid));
    }

    // Query and delete any properties belonging to dummy realtors
    const propertiesSnap = await getDocs(collection(db, 'properties'));
    for (const docSnap of propertiesSnap.docs) {
      const data = docSnap.data();
      if (data && dummyRealtorIds.includes(data.owner_id)) {
        await deleteDoc(docSnap.ref);
      }
    }

    // Delete dummy inquiries
    for (const iid of dummyInquiryIds) {
      await deleteDoc(doc(db, 'inquiries', iid));
    }

    // Query and delete inquiries belonging to dummy realtors
    const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
    for (const docSnap of inquiriesSnap.docs) {
      const data = docSnap.data();
      if (data && dummyRealtorIds.includes(data.realtor_id)) {
        await deleteDoc(docSnap.ref);
      }
    }

    // Delete dummy bookings
    for (const bid of dummyBookingIds) {
      await deleteDoc(doc(db, 'bookings', bid));
    }

    // Delete dummy tasks
    for (const tid of dummyTaskIds) {
      await deleteDoc(doc(db, 'tasks', tid));
    }

    console.log('Legacy dummy data cleanup completed.');
  } catch (error) {
    console.error('Failed to clean up dummy data from Firestore:', error);
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
  sendPasswordResetEmail,
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
