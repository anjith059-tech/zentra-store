import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbycdfssgJItaZiE-zuPfTI0MP6vXxoKT6i7czMoAJVwTkSSt9PbJmCqgGftolcb6VBBHQ/exec';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign In to Proceed',
  subtitle = 'Please sign in or create an account to proceed to checkout.',
}) => {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password flow states
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Cooldown timer for OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const getStoredUsers = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem('zentra_users_registry');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const callAppsScript = async (payload: Record<string, any>) => {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: response.ok, rawText: text };
      }
    } catch {
      return null;
    }
  };

  const handleAuthSuccess = (userEmail: string) => {
    localStorage.setItem('zentra_user_email', userEmail);
    window.dispatchEvent(new Event('zentra_auth_change'));
    setSuccessMsg('Success! Proceeding to checkout...');
    setTimeout(() => {
      onSuccess(userEmail);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const users = getStoredUsers();

    if (view === 'signup') {
      if (cleanPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        setLoading(false);
        return;
      }

      try {
        const result = await callAppsScript({
          action: 'register',
          email: cleanEmail,
          password: cleanPassword,
        });

        if (result && result.success === false) {
          if (result.message?.toLowerCase().includes('already exist')) {
            setErrorMessage('An account with this email already exists. Please Sign In.');
          } else {
            setErrorMessage(result.message || 'Registration failed. Please try again.');
          }
          setLoading(false);
          return;
        }

        users[cleanEmail] = cleanPassword;
        localStorage.setItem('zentra_users_registry', JSON.stringify(users));
        handleAuthSuccess(cleanEmail);
      } catch {
        users[cleanEmail] = cleanPassword;
        localStorage.setItem('zentra_users_registry', JSON.stringify(users));
        handleAuthSuccess(cleanEmail);
      }
    } else {
      // Sign In Flow
      try {
        const result = await callAppsScript({
          action: 'login',
          email: cleanEmail,
          password: cleanPassword,
        });

        if (result && result.success === true) {
          users[cleanEmail] = cleanPassword;
          localStorage.setItem('zentra_users_registry', JSON.stringify(users));
          handleAuthSuccess(cleanEmail);
          return;
        }

        // Fallback to local storage registry check
        if (users[cleanEmail] && users[cleanEmail] === cleanPassword) {
          handleAuthSuccess(cleanEmail);
          return;
        }

        if (result && result.message) {
          setErrorMessage(result.message);
        } else {
          setErrorMessage('Invalid email or password. Please check your credentials.');
        }
        setLoading(false);
      } catch {
        if (users[cleanEmail] && users[cleanEmail] === cleanPassword) {
          handleAuthSuccess(cleanEmail);
        } else {
          setErrorMessage('Unable to connect. Please check your network and try again.');
          setLoading(false);
        }
      }
    }
  };

  // Forgot password OTP request
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      await callAppsScript({ action: 'sendOtp', email: cleanEmail });
      setResetStep('otp');
      setCooldown(60);
      setSuccessMsg(`OTP sent to ${cleanEmail}`);
    } catch {
      setResetStep('otp');
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password OTP verify
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await callAppsScript({
        action: 'verifyOtp',
        email: resetEmail.trim().toLowerCase(),
        otp: otp.trim(),
      });
      if (result && result.success === false) {
        setErrorMessage(result.message || 'Invalid or expired code.');
        setLoading(false);
        return;
      }
      setResetStep('newPassword');
    } catch {
      setResetStep('newPassword');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password reset
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const cleanEmail = resetEmail.trim().toLowerCase();
    try {
      await callAppsScript({
        action: 'resetPassword',
        email: cleanEmail,
        newPassword: newPassword.trim(),
      });
      const users = getStoredUsers();
      users[cleanEmail] = newPassword.trim();
      localStorage.setItem('zentra_users_registry', JSON.stringify(users));
      handleAuthSuccess(cleanEmail);
    } catch {
      const users = getStoredUsers();
      users[cleanEmail] = newPassword.trim();
      localStorage.setItem('zentra_users_registry', JSON.stringify(users));
      handleAuthSuccess(cleanEmail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                {view === 'forgot' ? 'Reset Password' : title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {view === 'forgot'
                  ? 'We will send a code to your email'
                  : subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {view !== 'forgot' && (
          <div className="px-6 pt-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMessage(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  view === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('signup');
                  setErrorMessage(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  view === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {view === 'forgot' ? (
            /* Forgot Password Flow */
            <div className="space-y-3">
              {resetStep === 'email' && (
                <form onSubmit={handleForgotSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('signin');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              )}

              {resetStep === 'otp' && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 text-center font-mono tracking-widest text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              )}

              {resetStep === 'newPassword' && (
                <form onSubmit={handleForgotResetPassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {loading ? 'Updating Password...' : 'Save & Proceed to Checkout'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Password</label>
                  {view === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setResetEmail(email);
                        setErrorMessage(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {view === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>
                      {view === 'signin' ? 'Sign In & Continue' : 'Create Account & Continue'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  {view === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setView('signup');
                          setErrorMessage(null);
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Register in seconds
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setView('signin');
                          setErrorMessage(null);
                        }}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
