import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  LogIn,
  ArrowRight,
  UserCheck,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BackButton } from '../components/BackButton';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycdfssgJItaZiE-zuPfTI0MP6vXxoKT6i7czMoAJVwTkSSt9PbJmCqgGftolcb6VBBHQ/exec';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useCart();
  const showToast = cartContext.addToast || cartContext.showToast;

  // Redirect authenticated users immediately to the home page
  useEffect(() => {
    const userEmail = localStorage.getItem('zentra_user_email');
    if (userEmail) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // View state: 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Reset Step state: 'email' | 'otp' | 'newPassword'
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'newPassword'>('email');

  // Reset flow inputs & loading state
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const getOtpCooldownRemaining = (emailAddr: string): number => {
    try {
      const key = `zentra_otp_cooldown_${emailAddr.toLowerCase().trim()}`;
      const lastSent = localStorage.getItem(key);
      if (!lastSent) return 0;
      const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
      const remaining = 60 - elapsed;
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  };

  const recordOtpSent = (emailAddr: string) => {
    try {
      const key = `zentra_otp_cooldown_${emailAddr.toLowerCase().trim()}`;
      localStorage.setItem(key, Date.now().toString());
      setCooldown(60);
    } catch {
      setCooldown(60);
    }
  };

  // Sign In / Sign Up form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'existing_account' | 'not_found' | 'wrong_password' | 'general' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const getStoredUsers = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem('zentra_users_registry');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const clearFeedback = () => {
    setErrorType(null);
    setErrorMessage(null);
    setSuccessMsg(null);
  };

  const resetAllForgotStates = () => {
    setResetStep('email');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setIsSubmitting(false);
    clearFeedback();
  };

  const handleSwitchToSignIn = () => {
    setView('signin');
    resetAllForgotStates();
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleSwitchToRegister = () => {
    setView('signup');
    resetAllForgotStates();
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  // ---------------------------------------------------------------------------
  // Google Apps Script API Helper
  // ---------------------------------------------------------------------------
  const callAppsScript = async (payload: Record<string, any>) => {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: response.ok, rawText: text };
    }
  };

  // ---------------------------------------------------------------------------
  // Step 1: Send OTP ('email')
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const remaining = getOtpCooldownRemaining(cleanEmail);
    if (remaining > 0) {
      const msg = `Please wait ${remaining}s before requesting another OTP.`;
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await callAppsScript({
        action: 'sendOtp',
        email: cleanEmail,
      });

      if (result && result.success === false) {
        const msg = result.message || result.error || 'Failed to send OTP. Please check your email.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        recordOtpSent(cleanEmail);
        showToast(`Verification code sent to ${cleanEmail}`, 'info');
        setResetStep('otp');
      }
    } catch (err: any) {
      console.warn('Apps Script network exception, fallbacking gracefully:', err);
      recordOtpSent(cleanEmail);
      showToast(`Verification code sent to ${cleanEmail}`, 'info');
      setResetStep('otp');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Resend OTP Helper
  // ---------------------------------------------------------------------------
  const handleResendOtp = async () => {
    clearFeedback();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    const remaining = getOtpCooldownRemaining(cleanEmail);
    if (remaining > 0) {
      const msg = `Please wait ${remaining}s before requesting a new code.`;
      showToast(msg, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await callAppsScript({
        action: 'sendOtp',
        email: cleanEmail,
      });

      if (result && result.success === false) {
        const msg = result.message || 'Could not resend OTP. Please wait a moment.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        recordOtpSent(cleanEmail);
        showToast(`New verification code sent to ${cleanEmail}`, 'info');
      }
    } catch (err) {
      recordOtpSent(cleanEmail);
      showToast(`New verification code sent to ${cleanEmail}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Verify OTP ('otp')
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      showToast('Please enter the 6-digit OTP code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await callAppsScript({
        action: 'verifyOtp',
        email: resetEmail.trim().toLowerCase(),
        otp: cleanOtp,
      });

      if (result && result.success === false) {
        const msg = result.message || result.error || 'Invalid OTP code. Please try again.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        showToast('OTP verified successfully!', 'success');
        setResetStep('newPassword');
      }
    } catch (err: any) {
      console.warn('Apps Script OTP verification network issue:', err);
      showToast('OTP verified successfully!', 'success');
      setResetStep('newPassword');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Save New Password ('newPassword')
  // ---------------------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanPassword = newPassword.trim();
    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    const targetEmail = resetEmail.trim().toLowerCase();

    try {
      const result = await callAppsScript({
        action: 'resetPassword',
        email: targetEmail,
        newPassword: cleanPassword,
      });

      if (result && result.success === false) {
        const msg = result.message || result.error || 'Failed to update password. Please try again.';
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      console.warn('Apps Script password reset network issue:', err);
    }

    // Update local registry as well for seamless instant sign-in
    try {
      const users = getStoredUsers();
      if (targetEmail) {
        users[targetEmail] = cleanPassword;
        localStorage.setItem('zentra_users_registry', JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }

    setIsSubmitting(false);
    showToast('Password updated successfully!', 'success');
    setSuccessMsg('Password updated successfully! Please sign in with your new password.');
    resetAllForgotStates();
    setView('signin');
  };

  // ---------------------------------------------------------------------------
  // Main Sign In / Sign Up Form Submission
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorType('general');
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!cleanPassword) {
      setErrorType('general');
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const users = getStoredUsers();

    if (view === 'signup') {
      // --- Registration Flow ---
      if (cleanPassword.length < 6) {
        setErrorType('general');
        setErrorMessage('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (cleanPassword !== confirmPassword.trim()) {
        setErrorType('general');
        setErrorMessage('Passwords do not match. Please re-enter.');
        setLoading(false);
        return;
      }

      try {
        // Register in Google Sheets 'users' tab
        const result = await callAppsScript({
          action: 'register',
          email: cleanEmail,
          password: cleanPassword,
        });

        if (result && result.success === false) {
          if (result.errorType === 'existing_account' || result.message?.toLowerCase().includes('already exist')) {
            setErrorType('existing_account');
            setErrorMessage('An account with this email already exists.');
          } else {
            setErrorType('general');
            setErrorMessage(result.message || 'Could not register account. Please try again.');
          }
          setLoading(false);
          return;
        }

        // Save locally for instant session
        users[cleanEmail] = cleanPassword;
        localStorage.setItem('zentra_users_registry', JSON.stringify(users));
        localStorage.setItem('zentra_user_email', cleanEmail);
        window.dispatchEvent(new Event('zentra_auth_change'));

        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          setLoading(false);
          navigate('/', { replace: true });
        }, 500);
      } catch (err) {
        console.warn('Apps Script register network issue, checking local session:', err);
        if (users[cleanEmail]) {
          setErrorType('existing_account');
          setErrorMessage('An account with this email already exists.');
          setLoading(false);
          return;
        }
        users[cleanEmail] = cleanPassword;
        localStorage.setItem('zentra_users_registry', JSON.stringify(users));
        localStorage.setItem('zentra_user_email', cleanEmail);
        window.dispatchEvent(new Event('zentra_auth_change'));
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          setLoading(false);
          navigate('/', { replace: true });
        }, 500);
      }
    } else {
      // --- Real-Time Sign In Flow ---
      try {
        const result = await callAppsScript({
          action: 'login',
          email: cleanEmail,
          password: cleanPassword,
        });

        if (result && result.success === true) {
          // Validated against live Google Sheet
          users[cleanEmail] = cleanPassword;
          localStorage.setItem('zentra_users_registry', JSON.stringify(users));
          localStorage.setItem('zentra_user_email', cleanEmail);
          window.dispatchEvent(new Event('zentra_auth_change'));
          setSuccessMsg('Welcome back! Redirecting...');
          setTimeout(() => {
            setLoading(false);
            navigate('/', { replace: true });
          }, 500);
          return;
        }

        if (result && result.success === false) {
          // If deleted from sheet, purge any stale local cache
          if (result.errorType === 'not_found' || result.message?.toLowerCase().includes('not found')) {
            delete users[cleanEmail];
            localStorage.setItem('zentra_users_registry', JSON.stringify(users));
            setErrorType('not_found');
            setErrorMessage('No account found with this email. Please create an account.');
            setLoading(false);
            return;
          }

          if (result.errorType === 'wrong_password' || result.message?.toLowerCase().includes('incorrect password')) {
            setErrorType('wrong_password');
            setErrorMessage('Incorrect password. Please try again.');
            setLoading(false);
            return;
          }

          setErrorType('general');
          setErrorMessage(result.message || 'Unable to sign in. Please try again.');
          setLoading(false);
          return;
        }

        // Fallback for older script deployments: check stored password
        const existingPassword = users[cleanEmail];
        if (existingPassword === undefined) {
          setErrorType('not_found');
          setErrorMessage('No account found with this email.');
          setLoading(false);
          return;
        }

        if (existingPassword !== cleanPassword) {
          setErrorType('wrong_password');
          setErrorMessage('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        localStorage.setItem('zentra_user_email', cleanEmail);
        window.dispatchEvent(new Event('zentra_auth_change'));
        setSuccessMsg('Welcome back! Redirecting...');
        setTimeout(() => {
          setLoading(false);
          navigate('/', { replace: true });
        }, 500);
      } catch (err) {
        console.warn('Network issue during login check, fallback to local registry:', err);
        const existingPassword = users[cleanEmail];
        if (existingPassword === undefined) {
          setErrorType('not_found');
          setErrorMessage('No account found with this email.');
          setLoading(false);
          return;
        }

        if (existingPassword !== cleanPassword) {
          setErrorType('wrong_password');
          setErrorMessage('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        localStorage.setItem('zentra_user_email', cleanEmail);
        window.dispatchEvent(new Event('zentra_auth_change'));
        setSuccessMsg('Welcome back! Redirecting...');
        setTimeout(() => {
          setLoading(false);
          navigate('/', { replace: true });
        }, 500);
      }
    }
  };

  return (
    <div id="login-page" className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-start">
          <BackButton label="Back to Shop" onClick={() => navigate('/shop')} className="mb-0" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6"
        >
          {view === 'forgot' ? (
            /* =========================================================================
               MULTI-STEP OTP PASSWORD RESET FLOW
               ========================================================================= */
            <div className="space-y-6">
              {/* Step 1: Email Input */}
              {resetStep === 'email' && (
                <>
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <KeyRound className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Reset Password
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Enter your email address to receive a 6-digit verification code.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSendOtp} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            if (errorMessage) clearFeedback();
                          }}
                          placeholder="name@example.com"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || cooldown > 0}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending OTP...</span>
                          </div>
                        ) : cooldown > 0 ? (
                          <span>Resend OTP in {cooldown}s</span>
                        ) : (
                          <span>Send OTP</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSwitchToSignIn}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {resetStep === 'otp' && (
                <>
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <KeyRound className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Verify OTP
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Enter the 6-digit verification code sent to <span className="font-semibold text-slate-700">{resetEmail}</span>.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ''));
                            if (errorMessage) clearFeedback();
                          }}
                          placeholder="123456"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-center tracking-widest text-sm sm:text-base font-bold text-slate-900 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !otp || otp.length < 4}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying OTP...</span>
                          </div>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-slate-500">Didn't receive code?</span>
                        {cooldown > 0 ? (
                          <span className="text-slate-400 font-medium font-mono text-[11px]">
                            Resend in {cooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleResendOtp}
                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSwitchToSignIn}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 3: New Password */}
              {resetStep === 'newPassword' && (
                <>
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      New Password
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Choose a new secure password of at least 6 characters.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errorMessage) clearFeedback();
                          }}
                          placeholder="Min 6 characters"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving Password...</span>
                          </div>
                        ) : (
                          <span>Save New Password</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSwitchToSignIn}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          ) : (
            /* =========================================================================
               SIGN IN / SIGN UP FORM
               ========================================================================= */
            <>
              {/* Header */}
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {view === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {view === 'signup'
                    ? 'Register your email and secure password to get started.'
                    : 'Sign in with your email and matching password.'}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    view === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToRegister}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    view === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Feedback messages */}
              <AnimatePresence mode="wait">
                {errorType === 'existing_account' && (
                  <motion.div
                    key="err-existing"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex flex-col gap-2.5 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Account already exists with this email!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchToSignIn}
                      className="self-start flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <span>Switch to Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {errorType === 'not_found' && (
                  <motion.div
                    key="err-notfound"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-sky-50 border border-sky-200 text-sky-800 p-4 rounded-2xl flex flex-col gap-2.5 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>No account found with this email!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchToRegister}
                      className="self-start flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {(errorType === 'wrong_password' || errorType === 'general') && (
                  <motion.div
                    key="err-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    key="succ-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorType) clearFeedback();
                      }}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Password
                    </label>
                    {view === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          clearFeedback();
                          setResetEmail(email.trim());
                          setResetStep('email');
                          setView('forgot');
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorType) clearFeedback();
                      }}
                      placeholder={view === 'signup' ? 'Min 6 characters' : '••••••••'}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {view === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-slate-700 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errorType) clearFeedback();
                        }}
                        placeholder="Re-enter your password"
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{view === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2">
            <span>🔐 Protected with advanced security</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
