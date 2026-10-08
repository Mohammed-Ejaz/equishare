import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Check,
  ArrowRight,
  LogOut,
  Smartphone,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { AppLogo } from './PaymentLogos';
import { isValidUpiId, isValidEmail } from '../utils/formatters';
import { api } from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  onLogin,
  onRegister,
  onUpdateProfile,
  onLogout,
  initialMode = 'signin'
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'profile' | 'switch'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Profile editing state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileUpiId, setProfileUpiId] = useState(currentUser?.upiId || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [profileCustomAvatarUrl, setProfileCustomAvatarUrl] = useState('');

  if (!isOpen) return null;

  // Real-time email validation states
  const isSignInEmailValid = isValidEmail(email);
  const showSignInEmailWarning = email.trim().length > 0 && !isSignInEmailValid;

  const isSignUpEmailValid = isValidEmail(email);
  const showSignUpEmailWarning = email.trim().length > 0 && !isSignUpEmailValid;

  const isProfileEmailValid = isValidEmail(profileEmail);
  const showProfileEmailWarning = profileEmail.trim().length > 0 && !isProfileEmailValid;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login(email.trim(), password.trim());
      if (data?.user) {
        onLogin(data.user);
        setSuccessMsg(`Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 500);
        return;
      }
    } catch (backendErr) {
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (found && (!found.password || found.password === password)) {
        onLogin(found);
        setSuccessMsg(`Welcome back, ${found.name}!`);
        setTimeout(() => {
          onClose();
        }, 500);
        return;
      }
      setError(backendErr.message || 'Login failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
    const finalUpi = upiId.trim();

    if (finalUpi && !isValidUpiId(finalUpi)) {
      setError('Please enter a valid UPI ID (e.g. name@okhdfcbank, 9876543210@paytm) or leave it blank.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        avatar: finalAvatar,
        upiId: finalUpi
      });
      if (data?.user) {
        onRegister(data.user);
        setSuccessMsg(`Account created for ${data.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 500);
        return;
      }
    } catch (backendErr) {
      if (backendErr.message?.includes('already exists')) {
        setError(backendErr.message);
        setIsLoading(false);
        return;
      }
      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        upiId: finalUpi,
        avatar: finalAvatar,
        createdAt: new Date().toISOString()
      };
      onRegister(newUser);
      setSuccessMsg(`Account created for ${newUser.name}!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    const finalName = profileName.trim();
    const finalEmail = profileEmail.trim();
    const finalUpi = profileUpiId.trim();

    if (!finalName || !finalEmail) {
      setError('Name and Email cannot be empty.');
      return;
    }

    if (!isValidEmail(finalEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (finalUpi && !isValidUpiId(finalUpi)) {
      setError('Please enter a valid UPI ID (e.g. name@okhdfcbank, 9876543210@paytm) or leave it blank.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: finalName,
      email: finalEmail,
      upiId: finalUpi,
      avatar: profileCustomAvatarUrl.trim() || profileAvatar
    };

    setIsLoading(true);
    try {
      await api.updateProfile({
        name: finalName,
        avatar: updatedUser.avatar,
        upiId: finalUpi
      });
    } catch (err) {
      console.warn('Backend profile update note:', err);
    } finally {
      setIsLoading(false);
      onUpdateProfile(updatedUser);
      setSuccessMsg('Profile details updated successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };


  const handleQuickSwitch = (user) => {
    onLogin(user);
    setSuccessMsg(`Switched to ${user.name}`);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-5">
          <AppLogo className="w-10 h-10" />
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight font-outfit">
              {mode === 'signin' && 'Sign In to EquiShare'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'profile' && 'Your User Profile'}
              {mode === 'switch' && 'Switch Active Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signin' && 'Access shared ledgers, receipts, and UPI settlements'}
              {mode === 'signup' && 'Join groups, split expenses, and settle in 1-click'}
              {mode === 'profile' && 'Manage your personal details and payout UPI ID'}
              {mode === 'switch' && 'Switch perspective to view another roommate’s balances'}
            </p>
          </div>
        </div>

        {/* Fresh 2-Tab Navigation for Sign In / Sign Up */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'signin' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'signup' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Alerts / Error & Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. FRESH SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showSignInEmailWarning ? 'text-rose-400' : isSignInEmailValid ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                <input
                  type="email"
                  name="user_email_signin"
                  autoComplete="off"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border transition-all text-white placeholder-slate-500 font-sans focus:outline-none ${showSignInEmailWarning
                      ? 'bg-rose-500/10 border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-rose-100'
                      : isSignInEmailValid
                        ? 'bg-white/5 border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                        : 'bg-white/5 border-white/10 focus:border-emerald-500'
                    }`}
                />
                {isSignInEmailValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 animate-fadeIn" />
                )}
              </div>
              {showSignInEmailWarning && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Please enter a valid email address (e.g. name@example.com)</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show Password'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="user_password_signin"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Bottom Switch Link */}
            <div className="pt-3 text-center border-t border-white/10">
              <span className="text-slate-400 text-xs">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                >
                  Sign up free
                </button>
              </span>
            </div>
          </form>
        )}

        {/* 2. FRESH SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} autoComplete="off" className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="user_fullname_signup"
                  autoComplete="off"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showSignUpEmailWarning ? 'text-rose-400' : isSignUpEmailValid ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                <input
                  type="email"
                  name="user_email_signup"
                  autoComplete="off"
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border transition-all text-white placeholder-slate-500 font-sans focus:outline-none ${showSignUpEmailWarning
                      ? 'bg-rose-500/10 border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-rose-100'
                      : isSignUpEmailValid
                        ? 'bg-white/5 border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                        : 'bg-white/5 border-white/10 focus:border-emerald-500'
                    }`}
                />
                {isSignUpEmailValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 animate-fadeIn" />
                )}
              </div>
              {showSignUpEmailWarning && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Please enter a valid email address (e.g. name@example.com)</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">UPI ID for Settlements (Optional)</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="user_upi_signup"
                  autoComplete="off"
                  placeholder="e.g. yourname@okaxis, yourname@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Choose Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show Password'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="user_password_signup"
                  autoComplete="new-password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Select Profile Avatar</label>
              <div className="flex items-center gap-2.5 mb-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedAvatar(av); setCustomAvatarUrl(''); }}
                    className={`relative rounded-full shrink-0 transition-all ${selectedAvatar === av && !customAvatarUrl
                        ? 'ring-2 ring-emerald-400 scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={av} alt="Avatar option" className="w-10 h-10 rounded-full object-cover" />
                    {selectedAvatar === av && !customAvatarUrl && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>

            {/* Bottom Switch Link */}
            <div className="pt-3 text-center border-t border-white/10">
              <span className="text-slate-400 text-xs">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        )}

        {/* 3. SWITCH ACCOUNT LIST (Only accessible from in-app settings) */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">
                Select a roommate account to test their dashboard perspective:
              </p>
            </div>
            <div className="space-y-2">
              {allUsers.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleQuickSwitch(u)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{u.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block">{u.email}</span>
                        {u.upiId && (
                          <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">UPI: {u.upiId}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                    >
                      {isCurrent ? 'Current' : 'Switch'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Register New Roommate</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. PROFILE MANAGEMENT */}
        {mode === 'profile' && currentUser && (
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-sans">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 mb-3">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover border border-emerald-500/40" />
              <div>
                <h4 className="font-bold text-sm text-white">{currentUser.name}</h4>
                <span className="text-xs text-slate-400">{currentUser.email}</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">UPI: {currentUser.upiId || 'Not set'}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showProfileEmailWarning ? 'text-rose-400' : isProfileEmailValid ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => {
                    setProfileEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border transition-all text-white font-semibold focus:outline-none ${showProfileEmailWarning
                      ? 'bg-rose-500/10 border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-rose-100'
                      : isProfileEmailValid
                        ? 'bg-white/5 border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                        : 'bg-white/5 border-white/10 focus:border-emerald-500'
                    }`}
                />
                {isProfileEmailValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 animate-fadeIn" />
                )}
              </div>
              {showProfileEmailWarning && (
                <p className="mt-1.5 text-[11px] text-rose-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Please enter a valid email address (e.g. name@example.com)</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Settlement UPI ID</label>
              <input
                type="text"
                value={profileUpiId}
                onChange={(e) => setProfileUpiId(e.target.value)}
                placeholder="yourname@okaxis"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Change Avatar</label>
              <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setProfileAvatar(av); setProfileCustomAvatarUrl(''); }}
                    className={`relative rounded-full shrink-0 transition-all ${profileAvatar === av && !profileCustomAvatarUrl
                        ? 'ring-2 ring-emerald-400 scale-105'
                        : 'opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={av} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="Or custom image URL..."
                value={profileCustomAvatarUrl}
                onChange={(e) => setProfileCustomAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[11px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Save Profile
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
