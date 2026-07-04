import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ShieldAlert, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { User, Realtor } from '../types';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  db, 
  doc, 
  getDoc, 
  setDoc,
  sendPasswordResetEmail,
  signOut
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialRole?: 'buyer' | 'realtor';
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'buyer' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<'buyer' | 'realtor'>(initialRole);
  
  // Registration & Login Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Realtor Specific Optional Fields
  const [title, setTitle] = useState('Licensed Luxury Advisor');
  const [city, setCity] = useState('Vancouver');
  
  // State indicators
  const [error, setError] = useState('');
  const [isOpNotAllowed, setIsOpNotAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError('');
      setIsOpNotAllowed(false);
      setResetSuccess('');
      setIsForgotPassword(false);
      setIsLogin(true);
    }
  }, [isOpen, initialRole]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsOpNotAllowed(false);
    setResetSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please provide your email address.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess('A password recovery email has been sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      let errorMsg = err.message || 'Failed to send password recovery email.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account associated with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOpNotAllowed(true);
        errorMsg = 'Firebase Email/Password authentication is disabled.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsOpNotAllowed(false);
    setLoading(true);

    if (!email || (!isForgotPassword && !password) || (!isLogin && !isForgotPassword && (!name || !phone))) {
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
          if (sessionUser.role !== role) {
            await signOut(auth);
            setError(`This account is registered as a ${sessionUser.role === 'buyer' ? 'Buyer Profile' : 'Realtor Agent'}. Please switch to the correct role tab above to sign in.`);
            setLoading(false);
            return;
          }
        } else {
          sessionUser = {
            id: fUser.uid,
            name: email.split('@')[0].toUpperCase(),
            email: email,
            phone: '',
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
              phone: '',
              whatsapp: '',
              bio: 'Representing rare locations and structural design integrity.',
              experience: 1,
              languages: ['English'],
              specializations: ['Luxury Estates'],
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
          phone: phone,
          role: role,
          savedPropertyIds: []
        };

        if (role === 'realtor') {
          const customRealtor: Realtor = {
            id: fUser.uid,
            name: name,
            title: title || 'Licensed Luxury Advisor',
            profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
            coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            city: city,
            phone: phone,
            whatsapp: phone.replace(/[^0-9]/g, ''),
            bio: `Dedicated advisor representing rare locations and structural design integrity in ${city || 'Vancouver'}.`,
            experience: 1,
            languages: ['English'],
            specializations: ['Premium Real Estate'],
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
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOpNotAllowed(true);
        errorMsg = 'Firebase Email/Password authentication is disabled.';
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
              <span className="font-mono text-xs tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded uppercase font-semibold">
                {role === 'realtor' ? 'Realtor Hub' : 'Advisory Access'}
              </span>
              <h2 className="text-3xl font-display font-medium tracking-tight text-neutral-950 mt-2 font-display">
                {isForgotPassword 
                  ? 'Recover Password' 
                  : isLogin 
                    ? 'Welcome Back' 
                    : 'Create Real Account'
                }
              </h2>
              <p className="text-xs font-sans text-neutral-500 mt-2 leading-relaxed">
                {isForgotPassword 
                  ? 'Enter your registered email address below to receive password recovery instructions.' 
                  : isLogin 
                    ? 'Access your private and secure estate advisory and management platform.' 
                    : 'Unlock authentic listing curation, lead analytics, and real estate workspace.'
                }
              </p>
            </div>

            {/* Exclusive Segmented Role Switcher (Hidden in Forgot Password view) */}
            {!isForgotPassword && (
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
                  ● Buyer Profile
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
                  ■ Realtor Agent
                </button>
              </div>
            )}

            {/* Status alerts */}
            {error && (
              <div className="flex flex-col gap-2 p-4 bg-[#fdf2f2] text-red-700 rounded-xl mb-6 text-xs font-sans border border-red-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-semibold break-words">{error}</span>
                </div>
                {isOpNotAllowed && (
                  <div className="mt-2.5 pt-2.5 border-t border-red-200/60 text-neutral-800 space-y-2 leading-relaxed">
                    <p className="font-semibold text-red-800">How to activate registration & login:</p>
                    <p>
                      Your real Firebase database is active, but the <strong>Email/Password Sign-in Provider</strong> is not enabled yet in your Firebase console. Follow these 3 simple steps to enable it:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-neutral-700">
                      <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800">Firebase Console</a></li>
                      <li>Select your project: <code className="bg-neutral-100 text-neutral-900 px-1 py-0.5 rounded font-mono">gen-lang-client-0388026506</code></li>
                      <li>Go to <strong>Build &gt; Authentication &gt; Sign-in method</strong>, click <strong>Add new provider</strong>, select <strong>Email/Password</strong>, toggle <strong>Enable</strong>, and click <strong>Save</strong>.</li>
                    </ol>
                    <p className="text-[11px] text-neutral-500 italic pt-1">
                      After saving, you can instantly register new accounts here without refreshing the page!
                    </p>
                  </div>
                )}
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-850 rounded-xl mb-6 text-xs font-sans">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-750" />
                <span className="break-words font-medium">{resetSuccess}</span>
              </div>
            )}

            {/* Forgot Password View */}
            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                      required
                      id="forgot-password-email-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-900 disabled:bg-neutral-400 text-white rounded-xl text-sm font-sans font-medium transition-all duration-200 mt-4 active:scale-[0.99] shadow-sm cursor-pointer"
                  id="forgot-password-submit"
                >
                  {loading ? 'Sending Request...' : 'Send Recovery Link'}
                </button>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError('');
                      setResetSuccess('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-black hover:underline transition-all duration-150"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* Regular Auth form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Sign Up only) */}
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
                        placeholder="e.g. John Doe"
                        className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                        required
                        id="auth-name-input"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
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
                      placeholder="e.g. name@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                      required
                      id="auth-email-input"
                    />
                  </div>
                </div>

                {/* Phone Number (Sign Up only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-mono tracking-wider uppercase text-gray-400 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. +1 (604) 555-0199"
                        className="w-full pl-11 pr-4 py-3 bg-[#fdfdfd] border border-[#e5e5e5] rounded-xl text-sm font-sans outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                        required
                        id="auth-phone-input"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-mono tracking-wider uppercase text-gray-400">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                        }}
                        className="text-[11px] font-mono text-gray-400 hover:text-black hover:underline"
                        id="auth-forgot-password-link"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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

                {/* Realtor Specific Details (Sign Up only) */}
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
                        placeholder="e.g. Vancouver"
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
              </form>
            )}

            {/* Toggle Mode Link */}
            <div className="mt-6 pt-6 border-t border-[#eaeaea] text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgotPassword(false);
                  setError('');
                  setResetSuccess('');
                }}
                className="text-xs font-sans text-gray-500 hover:text-black hover:underline transition-all duration-150"
                id="toggle-auth-mode"
              >
                {isLogin ? "New to GetSFT? Create real account" : "Have an estate account? Authenticate"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
