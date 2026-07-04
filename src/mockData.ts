import { Property, Realtor, Inquiry, User } from './types';

export const INITIAL_REALTORS: Realtor[] = [];
export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_INQUIRIES: Inquiry[] = [];
export const INITIAL_USERS: User[] = [];

const LOCAL_STORAGE_KEY = 'getsft_mvp_state';

interface AppState {
  realtors: Realtor[];
  properties: Property[];
  inquiries: Inquiry[];
  users: User[];
  currentUser: User | null;
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return {
      realtors: [],
      properties: [],
      inquiries: [],
      users: [],
      currentUser: null,
    };
  }

  // Clear existing local storage cache that might contain old mock data
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // If we find mock data, clear it to start clean!
      if (parsed.realtors && parsed.realtors.some((r: any) => r.id === 'david' || r.id === 'sarah')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else if (parsed.realtors && parsed.properties && parsed.inquiries && parsed.users) {
        return parsed as AppState;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  }

  const initialState: AppState = {
    realtors: [],
    properties: [],
    inquiries: [],
    users: [],
    currentUser: null,
  };
  saveState(initialState);
  return initialState;
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
}
