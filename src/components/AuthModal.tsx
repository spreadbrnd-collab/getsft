import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User, Realtor } from '../types';

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

  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setError('');
    }
  }, [isOpen, initialRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please complete all required fields.');
      return;
    }

    // Since this is a custom local system, we create or load from saved users
    const existingRaw = localStorage.getItem('getsft_mvp_state');
    let state = { users: [] as User[] };
    if (existingRaw) {
      try {
        state = JSON.parse(existingRaw);
      } catch (err) {}
    }

    if (isLogin) {
      // Look up user
      let found = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        // Respect the selected role in the tab instead of forcing or overruling
        const sessionUser: User = {
          ...found,
          role: role
        };

        if (role === 'realtor' && !sessionUser.realtorProfile) {
          sessionUser.realtorProfile = {
            id: sessionUser.id,
            name: sessionUser.name || email.split('@')[0].toUpperCase(),
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
          
          // Sync database users as well to save the profile!
          found.realtorProfile = sessionUser.realtorProfile;
          state.users = state.users.map(u => u.id === found!.id ? found! : u);
          localStorage.setItem('getsft_mvp_state', JSON.stringify(state));
        }

        onAuthSuccess(sessionUser);
        onClose();
      } else {
        // Automatically create a mock user for convenience & flawless preview experience
        const newUser: User = {
          id: email.split('@')[0],
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: role,
          savedPropertyIds: []
        };
        if (role === 'realtor') {
          newUser.realtorProfile = {
            id: newUser.id,
            name: newUser.name,
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
        
        // Add to state list
        state.users.push(newUser);
        localStorage.setItem('getsft_mvp_state', JSON.stringify(state));
        
        onAuthSuccess(newUser);
        onClose();
      }
    } else {
      // Register custom
      const userExists = state.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError('This email is already associated with an account.');
        return;
      }

      const userId = name.toLowerCase().replace(/\s+/g, '-');
      const newUser: User = {
        id: userId,
        name: name,
        email: email,
        role: role,
        savedPropertyIds: []
      };

      if (role === 'realtor') {
        const customRealtor: Realtor = {
          id: userId,
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
        newUser.realtorProfile = customRealtor;

        // Also append custom realtor to the common realtors array
        if (state && (state as any).realtors) {
          (state as any).realtors.unshift(customRealtor);
        }
      }

      state.users.push(newUser);
      localStorage.setItem('getsft_mvp_state', JSON.stringify(state));

      onAuthSuccess(newUser);
      onClose();
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
                  📂 AUTHORIZED TEST REAL REALTORS:
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
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-neutral-100">
                    <div>
                      <span className="font-sans font-bold text-neutral-900 block">Julian Rose</span>
                      <span className="text-[10px] text-neutral-500">julian@getsft.com</span>
                    </div>
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 text-[10px]">password123</code>
                  </div>
                </div>
                <div className="text-[9px] text-neutral-400 leading-snug">
                  * Please type the email and password above manually to check listings. Password is <code className="font-bold">password123</code>.
                </div>
              </div>
            )}

            {/* Error messaging */}
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-[#fdf2f2] text-red-700 rounded-xl mb-6 text-xs font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
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
                className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-sm font-sans font-medium transition-all duration-200 mt-4 active:scale-[0.99] shadow-sm cursor-pointer"
                id="auth-submit-button"
              >
                {isLogin ? 'Authenticate' : `Join SFT as ${role === 'realtor' ? 'Realtor' : 'Buyer'}`}
              </button>
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
