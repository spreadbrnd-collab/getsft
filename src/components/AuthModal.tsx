import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User, Realtor } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  db, 
  doc, 
  getDoc, 
  setDoc 
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialRole?: 'buyer' | 'realtor';
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'buyer' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'realtor'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('Premium Real Estate Advisory');
  const [city, setCity] = useState('Vancouver');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError('');
    }
  }, [isOpen, initialRole]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    // Set a safety timeout to detect stuck/unresponsive popup communication in iframes
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Google Sign-In is taking longer than expected. Since the application is running inside a preview iframe, your browser might be blocking third-party authorization storage/cookies. Please click the "Open in new tab" icon (↗) in the top-right corner of the screen to authenticate successfully.');
    }, 8500);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      clearTimeout(timeoutId);
      const fUser = result.user;
      
      const userRef = doc(db, 'users', fUser.uid);
      const docSnap = await getDoc(userRef);
      
      let sessionUser: User;
      
      if (docSnap.exists()) {
        sessionUser = docSnap.data() as User;
        // Keep the role synchronized if they want to override
        if (sessionUser.role !== role) {
          sessionUser.role = role;
          await setDoc(userRef, sessionUser);
        }
      } else {
        sessionUser = {
          id: fUser.uid,
          name: fUser.displayName || fUser.email?.split('@')[0] || 'Google User',
          email: fUser.email || '',
          role: role,
          savedPropertyIds: []
        };
        
        if (role === 'realtor') {
          sessionUser.realtorProfile = {
            id: fUser.uid,
            name: sessionUser.name,
            title: 'Licensed Luxury Advisor',
            profileImage: fUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
            coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            city: 'Vancouver',
            phone: '+1 (604) 555-0100',
            whatsapp: '16045550100',
            bio: 'Representing rare locations and structural design integrity.',
            experience: 5,
            languages: ['English'],
            specializations: ['Modernist Villas'],
            template: 'Minimal'
          };
        }
        
        await setDoc(userRef, sessionUser);
      }
      
      onAuthSuccess(sessionUser);
      onClose();
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('The Google Auth popup was blocked by your browser. Please click the "Open in new tab" icon on the top right of the preview to complete authentication.');
      } else {
        setError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please complete all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const fUser = cred.user;
        
        const userRef = doc(db, 'users', fUser.uid);
        const docSnap = await getDoc(userRef);
        
        let sessionUser: User;
        if (docSnap.exists()) {
          sessionUser = docSnap.data() as User;
        } else {
          sessionUser = {
            id: fUser.uid,
            name: email.split('@')[0].toUpperCase(),
            email: email,
            role: role,
            savedPropertyIds: []
          };
          if (role === 'realtor') {
            sessionUser.realtorProfile = {
              id: fUser.uid,
              name: sessionUser.name,
              title: 'Licensed Luxury Advisor',
              profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
              coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
              city: 'Vancouver',
              phone: '+1 (604) 555-0100',
              whatsapp: '16045550100',
              bio: 'Representing rare locations and structural design integrity.',
              experience: 5,
              languages: ['English'],
              specializations: ['Modernist Villas'],
              template: 'Minimal'
            };
          }
          await setDoc(userRef, sessionUser);
        }
        
        onAuthSuccess(sessionUser);
        onClose();
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const fUser = cred.user;
        
        const sessionUser: User = {
          id: fUser.uid,
          name: name,
          email: email,
          role: role,
          savedPropertyIds: []
        };

        if (role === 'realtor') {
          const customRealtor: Realtor = {
            id: fUser.uid,
            name: name,
            title: title || 'Luxury Realtor',
            profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
            coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            city: city,
            phone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
            whatsapp: '15555555555',
            bio: `Specializing in premium listings in ${city}. Dedicated to absolute architectural honesty, custom styling and tailored experiences.`,
            experience: 5,
            languages: ['English'],
            specializations: ['Modern Architecture'],
            template: 'Minimal'
          };
          sessionUser.realtorProfile = customRealtor;
        }

        await setDoc(doc(db, 'users', fUser.uid), sessionUser);
        
        onAuthSuccess(sessionUser);
        onClose();
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let errorMsg = err.message || 'Authentication failed.';
      if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account associated with this email address.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000] opacity-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-[480px] bg-[#ffffff] p-5 sm:p-8 md:p-10 rounded-[24px] shadow-2xl border border-[#eaeaea] max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#f6f6f6] transition-colors duration-200"
              aria-label="Close modal"
              id="close-auth-modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Title Block */}
            <div className="mb-6">
              <span className="font-mono text-xs tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                {role === 'realtor' ? 'Realtor' : 'User'}
              </span>
              <h2 className="text-3xl font-display font-medium tracking-tight text-neutral-950 mt-2">
                {isLogin ? 'Welcome Back' : 'Create Estate Account'}
              </h2>
              <p className="text-xs font-sans text-neutral-500 mt-2">
                {isLogin ? 'Access your private and secure advisory environment' : 'Unlock full Saved Lists, historic logs, and digital workspaces.'}
              </p>
            </div>

            {/* Exclusive Segmented Role Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-neutral-100 rounded-xl mb-6 border border-neutral-200">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 text-xs font-sans font-semibold rounded-lg transition-all duration-200 ${
                  role === 'buyer'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                }`}
                id="select-buyer-role"
              >
                ● User
              </button>
              <button
                type="button"
                onClick={() => setRole('realtor')}
                className={`py-2 text-xs font-sans font-semibold rounded-lg transition-all duration-200 ${
                  role === 'realtor'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                }`}
                id="select-realtor-role"
              >
                ■ Realtor
              </button>
            </div>

            {/* Quick-select Test Realtor Accounts */}
            {isLogin && role === 'realtor' && (
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl mb-6 space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
                  📂 AUTHORIZED LIVE REALTORS:
                </span>
                <div className="space-y-2 font-mono text-[11px] text-neutral-700">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-neutral-100">
                    <div>
                      <span className="font-sans font-bold text-neutral-900 block">David Vandervelde</span>
                      <span className="text-[10px] text-neutral-500">david@getsft.com</span>
                    </div>
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 text-[10px]">password123</code>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-neutral-100">
                    <div>
                      <span className="font-sans font-bold text-neutral-900 block">Sarah Sterling</span>
                      <span className="text-[10px] text-neutral-500">sarah@getsft.com</span>
                    </div>
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 text-[10px]">password123</code>
                  </div>
                </div>
                <div className="text-[9px] text-neutral-400 leading-snug">
                  * Live Firebase-backed accounts. Use these credentials to sign in directly! Password is <code className="font-bold">password123</code>.
                </div>
              </div>
            )}

            {/* Error messaging */}
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-[#fdf2f2] text-red-700 rounded-xl mb-6 text-xs font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="David Vandervelde"
                      className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                      required
                      id="auth-name-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="david@getsft.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                    required
                    id="auth-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                    required
                    id="auth-password-input"
                  />
                </div>
              </div>

              {!isLogin && role === 'realtor' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Luxury Broker"
                      className="w-full px-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black transition-all duration-200"
                      id="auth-professional-title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                      Target City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Toronto"
                      className="w-full px-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black transition-all duration-200"
                      id="auth-target-city"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black hover:bg-neutral-900 disabled:bg-neutral-400 text-white rounded-xl text-sm font-sans font-medium transition-all duration-200 mt-4 active:scale-[0.99] shadow-sm cursor-pointer"
                id="auth-submit-button"
              >
                {loading ? 'Processing...' : isLogin ? 'Authenticate' : `Join SFT as ${role === 'realtor' ? 'Realtor' : 'Buyer'}`}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-neutral-400 font-mono text-[9px] uppercase tracking-wider">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 border border-neutral-200 hover:bg-neutral-50 disabled:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.99]"
                id="google-signin-button"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Secure Google Authentication
              </button>

              {isIframe && (
                <div className="mt-3.5 p-3.5 bg-teal-50/50 dark:bg-slate-900/30 border border-teal-100 dark:border-teal-950 rounded-xl text-[11px] text-teal-850 dark:text-teal-400 font-sans leading-relaxed text-left">
                  <span className="font-semibold block mb-1">💡 Running in Preview Mode:</span>
                  Google Authentication popups are heavily restricted by browser policies within preview frames (iframes). If it gets stuck or does not log you in, click the <strong className="text-black dark:text-white">"Open in new tab"</strong> icon (↗) at the top-right corner of the screen to sign in seamlessly.
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-[#eaeaea] text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-sans text-gray-500 hover:text-black hover:underline transition-all duration-150"
                id="toggle-auth-mode"
              >
                {isLogin ? "New to GetSFT? Create an elegance account" : "Have an elegant account? Authenticate"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
