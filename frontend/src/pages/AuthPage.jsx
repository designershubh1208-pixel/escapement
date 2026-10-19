import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Smartphone, 
  KeyRound, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Check,
  ArrowUpRight,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const AuthPage = ({ defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(defaultMode);

  // Remember me toggle
  const [rememberMe, setRememberMe] = useState(true);

  // Credentials Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otpInputsRef = useRef([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || '/dashboard/chat';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Read error message from query param (e.g. from OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [location.search]);

  // Resend OTP countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle OTP digit changes
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // Step 1: Submit Email + Password to initiate verification
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    // If registering, name is required
    if (mode === 'register' && (!name || !name.trim())) {
      setError('Please enter your Full Name to create an account.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await sendOtp({
        email: cleanEmail,
        password,
        name: mode === 'register' ? name.trim() : null,
        purpose: mode,
      });
      setOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(data.cooldown_seconds || 30);
      setSuccessMsg(data.message || `Verification code sent to ${data.email || cleanEmail}`);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit Email OTP to complete login or registration
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({
        email: email.trim().toLowerCase(),
        password,
        otpCode: fullOtp,
        purpose: mode,
        name: mode === 'register' ? name.trim() : null,
      });
      setSuccessMsg('Authentication verified! Entering dashboard...');
      setTimeout(() => {
        navigate('/dashboard/chat', { replace: true });
      }, 700);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // OAuth triggers
  const handleGoogleAuth = () => {
    window.location.href = 'http://localhost:5001/api/auth/google/login';
  };

  const handleGithubAuth = () => {
    window.location.href = 'http://localhost:5001/api/auth/github/login';
  };



  return (
    <div className="min-h-screen bg-[#f8f9f6] dark:bg-[#070908] text-[#0a0b0a] dark:text-white flex flex-col justify-between selection:bg-[#0066ff] selection:text-white relative overflow-hidden transition-colors duration-300 p-4 sm:p-6 lg:p-8">
      
      {/* Ambient Radial Lighting in Canvas Corners */}
      <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#0066ff]/10 dark:bg-[#0066ff]/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-[#0066ff]/10 dark:bg-[#0066ff]/15 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Top Header Controls */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 px-2 z-20">
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-mono text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all bg-black/[0.02] dark:bg-white/[0.03]"
          >
            <span>Exit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container - Split View with Unique 3D Security Illustration */}
      <main className="w-full max-w-7xl mx-auto my-auto py-4 z-10 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ======================================================== */}
          {/* LEFT PANEL: PURE 3D ISOLATED ILLUSTRATION (NO CARD / BOX) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 w-full flex items-center justify-center py-4 lg:pr-6 select-none relative">
            {/* Subtle Ambient Radial Lighting Glow behind illustration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[220px] bg-[#0066ff]/20 dark:bg-[#0066ff]/35 rounded-full blur-[100px] pointer-events-none" />

            {/* Pure Floating 3D Transparent Ribbon & Artifacts Illustration */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 0.5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,102,255,0.25)] dark:drop-shadow-[0_25px_50px_rgba(0,102,255,0.45)]"
            >
              <img 
                src="/auth-panoramic-transparent.png" 
                alt="3D Financial Defense Illustration" 
                className="w-full h-auto max-h-[540px] object-contain pointer-events-none"
              />
            </motion.div>
          </div>


          {/* ======================================================== */}
          {/* RIGHT PANEL: FORM MATCHING REFERENCE                     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-[460px] px-2 sm:px-6">
              
              {/* Heading */}
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0a0b0a] dark:text-white tracking-tight mb-2">
                  {mode === 'login' ? 'Sign in to Escapement' : 'Sign up to Escapement'}
                </h2>
                <p className="text-[#0a0b0a]/60 dark:text-white/60 text-sm">
                  {mode === 'login' 
                    ? 'Enter your data to Sign in your account.' 
                    : 'Enter your data to register your account.'}
                </p>
              </div>

              {/* Social Login Buttons: Google & GitHub */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl bg-white dark:bg-[#111412] hover:bg-black/[0.03] dark:hover:bg-[#181c19] border border-black/10 dark:border-white/10 text-[#0a0b0a] dark:text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="truncate">{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubAuth}
                  className="flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl bg-white dark:bg-[#111412] hover:bg-black/[0.03] dark:hover:bg-[#181c19] border border-black/10 dark:border-white/10 text-[#0a0b0a] dark:text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="truncate">{mode === 'login' ? 'Sign in with GitHub' : 'Sign up with GitHub'}</span>
                </button>
              </div>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-black/10 dark:border-white/10 w-full" />
                <span className="bg-[#f8f9f6] dark:bg-[#070907] px-4 text-xs font-mono text-[#0a0b0a]/40 dark:text-white/40 uppercase">
                  Or
                </span>
                <div className="border-t border-black/10 dark:border-white/10 w-full" />
              </div>

              {/* Error and Success Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{error}</p>
                      {error.includes('Please sign up first') && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('register');
                            setError('');
                            setOtpSent(false);
                          }}
                          className="mt-1.5 text-xs font-bold underline text-[#0066ff] hover:brightness-110"
                        >
                          Switch to Sign Up Now →
                        </button>
                      )}
                      {error.includes('already exists') && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setError('');
                            setOtpSent(false);
                          }}
                          className="mt-1.5 text-xs font-bold underline text-[#0066ff] hover:brightness-110"
                        >
                          Switch to Sign In Now →
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3.5 rounded-xl bg-[#0066ff]/10 border border-[#0066ff]/25 text-[#0066ff] dark:text-blue-400 text-xs flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ======================================================== */}
              {/* UNIFIED FLOW: EMAIL & PASSWORD -> OTP VERIFICATION       */}
              {/* ======================================================== */}
              {!otpSent ? (
                /* Step 1: Email, Password (and Name for Sign Up) */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-medium text-[#0a0b0a]/80 dark:text-white/80 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-black/30 dark:text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Sarah Jenkins"
                          required
                          className="w-full bg-white dark:bg-[#121613] border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#0a0b0a] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:border-[#0066ff] focus:outline-none focus:ring-1 focus:ring-[#0066ff]/30 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#0a0b0a]/80 dark:text-white/80 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/30 dark:text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Sarahw12@mail.com"
                        required
                        className="w-full bg-white dark:bg-[#121613] border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#0a0b0a] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:border-[#0066ff] focus:outline-none focus:ring-1 focus:ring-[#0066ff]/30 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0a0b0a]/80 dark:text-white/80 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-black/30 dark:text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-white dark:bg-[#121613] border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-[#0a0b0a] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:border-[#0066ff] focus:outline-none focus:ring-1 focus:ring-[#0066ff]/30 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0a0b0a]/40 dark:text-white/40 hover:text-[#0a0b0a] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-[#0a0b0a]/70 dark:text-white/70 hover:text-[#0a0b0a] dark:hover:text-white cursor-pointer select-none"
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#0066ff] text-white' : 'border border-black/30 dark:border-white/30'}`}>
                        {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>Remember me</span>
                    </button>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions will be sent to your email.')}
                        className="text-[#0a0b0a]/50 dark:text-white/50 hover:text-[#0a0b0a] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Forget Password?
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-4 px-6 rounded-2xl bg-[#0066ff] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <span>{mode === 'login' ? 'Sign in' : 'Sign up'}</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit Email OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 text-xs">
                    <p className="text-[#0a0b0a]/70 dark:text-white/70">
                      We sent a 6-digit verification code to:
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <strong className="text-[#0a0b0a] dark:text-white font-mono text-sm">{email}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpDigits(['', '', '', '', '', '']);
                          setError('');
                        }}
                        className="text-[#0066ff] hover:underline font-bold text-xs font-mono cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-between gap-2 my-2" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono bg-white dark:bg-[#121613] border border-black/15 dark:border-white/15 focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff] rounded-2xl text-[#0a0b0a] dark:text-white focus:outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  {/* Resend Cooldown */}
                  <div className="flex items-center justify-between text-xs text-[#0a0b0a]/60 dark:text-white/60">
                    <span>Didn't get the code?</span>
                    {countdown > 0 ? (
                      <span className="font-mono text-[#0a0b0a]/40 dark:text-white/40">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-[#0066ff] hover:underline font-bold cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full py-4 px-6 rounded-2xl bg-[#0066ff] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>{mode === 'login' ? 'Verify & Sign in' : 'Verify & Complete Sign up'}</span>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Switcher: Do you have an account ? Sign up */}
              <div className="text-center mt-6">
                <p className="text-xs text-[#0a0b0a]/60 dark:text-white/60">
                  {mode === 'login' ? 'Do you have an account ?' : 'Already have an account ?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                      setSuccessMsg('');
                      setOtpSent(false);
                      setOtpDigits(['', '', '', '', '', '']);
                    }}
                    className="text-[#0a0b0a] dark:text-white font-bold hover:underline ml-1 cursor-pointer"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-7xl mx-auto py-2 text-center z-10 text-[11px] font-mono text-[#0a0b0a]/40 dark:text-white/30">
        Escapement • Deterministic Economic Agent Security
      </footer>

    </div>
  );
};

export default AuthPage;
