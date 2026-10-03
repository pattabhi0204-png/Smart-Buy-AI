import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  UserCountryConfig,
  AuthProviderType,
} from '../types';
import {
  SUPPORTED_COUNTRIES,
  CountryInfo,
  LocalStoreApp,
  getCountryByCode,
} from '../data/countries';
import {
  ShieldCheck,
  Globe,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Search,
  Truck,
  RotateCcw,
  CreditCard,
  ShoppingBag,
  Zap,
  ChevronRight,
  ExternalLink,
  Laptop,
  Flame,
  Award,
  LogOut,
  X,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  MailCheck,
  RefreshCw,
  Copy,
} from 'lucide-react';
import {
  validateEmailFormat,
  generateVerificationCode,
  EmailValidationResult,
} from '../utils/emailValidator';

interface AuthAndCountryFlowProps {
  currentProfile: UserProfile | null;
  currentCountry: UserCountryConfig | null;
  onComplete: (profile: UserProfile, country: UserCountryConfig) => void;
  onClose?: () => void;
  initialStep?: 'LOGIN' | 'VERIFY_EMAIL' | 'DETAILS' | 'COUNTRY' | 'STORES';
}

type Step = 'LOGIN' | 'VERIFY_EMAIL' | 'DETAILS' | 'COUNTRY' | 'STORES';

const PERSONAS = [
  {
    id: 'enthusiast',
    title: 'Power User & Tech Enthusiast',
    desc: 'Benchmark-driven, thermal checks, port selection & hardware longevity',
    icon: Flame,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'creator',
    title: 'Professional & Creator',
    desc: 'Color-accurate displays, multitasking, video export & battery stability',
    icon: Laptop,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'value_hunter',
    title: 'Student & Value Hunter',
    desc: 'Maximum performance per dollar, student discounts & durable builds',
    icon: Zap,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'casual',
    title: 'Everyday Pragmatist',
    desc: 'Intuitive, hassle-free devices with zero complicated setup or tweaking',
    icon: Award,
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40',
  },
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const AuthAndCountryFlow: React.FC<AuthAndCountryFlowProps> = ({
  currentProfile,
  currentCountry,
  onComplete,
  onClose,
  initialStep = 'LOGIN',
}) => {
  const [step, setStep] = useState<Step>(
    currentProfile ? (initialStep === 'LOGIN' ? 'COUNTRY' : initialStep) : 'LOGIN'
  );

  // Form State - default to empty or current profile to support real user details
  const [name, setName] = useState(currentProfile?.name || '');
  const [email, setEmail] = useState(currentProfile?.email || '');
  const [password, setPassword] = useState('');
  const [authProvider, setAuthProvider] = useState<AuthProviderType>(
    currentProfile?.authProvider || 'google'
  );
  const [selectedPersona, setSelectedPersona] = useState(
    currentProfile?.persona || 'Power User & Tech Enthusiast'
  );
  const [avatar, setAvatar] = useState(currentProfile?.avatar || AVATARS[0]);

  // Email Validation & Security Verification State
  const [emailError, setEmailError] = useState('');
  const [activeVerificationCode, setActiveVerificationCode] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isEmailVerified, setIsEmailVerified] = useState(
    currentProfile?.isEmailVerified ?? (currentProfile ? true : false)
  );
  const [showSimulatedCodeBanner, setShowSimulatedCodeBanner] = useState(false);

  // OTP input refs
  const otp0Ref = useRef<HTMLInputElement>(null);
  const otp1Ref = useRef<HTMLInputElement>(null);
  const otp2Ref = useRef<HTMLInputElement>(null);
  const otp3Ref = useRef<HTMLInputElement>(null);
  const otp4Ref = useRef<HTMLInputElement>(null);
  const otp5Ref = useRef<HTMLInputElement>(null);
  const otpRefs = [otp0Ref, otp1Ref, otp2Ref, otp3Ref, otp4Ref, otp5Ref];

  // Resend countdown timer
  useEffect(() => {
    if (step !== 'VERIFY_EMAIL' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Focus first input on entering VERIFY_EMAIL
  useEffect(() => {
    if (step === 'VERIFY_EMAIL') {
      setTimeout(() => {
        otp0Ref.current?.focus();
      }, 100);
    }
  }, [step]);

  // Interactive Real OAuth Modal State
  const [oauthModal, setOauthModal] = useState<'google' | 'facebook' | 'apple' | null>(null);
  const [oauthEmailInput, setOauthEmailInput] = useState('');
  const [oauthNameInput, setOauthNameInput] = useState('');
  const [oauthError, setOauthError] = useState('');

  // Country Selection State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    currentCountry?.countryCode || 'US'
  );
  const [countrySearch, setCountrySearch] = useState('');

  // Selected Country object
  const activeCountry = getCountryByCode(selectedCountryCode);

  // Enabled Stores in country
  const [enabledStoreIds, setEnabledStoreIds] = useState<string[]>(() => {
    if (currentCountry && currentCountry.countryCode === selectedCountryCode) {
      return currentCountry.enabledStoreIds;
    }
    return activeCountry.popularStores.map((s) => s.id);
  });

  // Handle country switch update stores
  const handleSelectCountry = (country: CountryInfo) => {
    setSelectedCountryCode(country.code);
    setEnabledStoreIds(country.popularStores.map((s) => s.id));
    setStep('STORES');
  };

  // Toggle store
  const toggleStore = (storeId: string) => {
    setEnabledStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleOpenOAuth = (provider: 'google' | 'facebook' | 'apple') => {
    setOauthModal(provider);
    setOauthError('');
    if (provider === 'google') {
      setOauthEmailInput(email || 'pattabhi0204@gmail.com');
      setOauthNameInput(name || 'Pattabhi Raman');
    } else if (provider === 'facebook') {
      setOauthEmailInput(email || '');
      setOauthNameInput(name || '');
    } else {
      setOauthEmailInput(email || '');
      setOauthNameInput(name || '');
    }
  };

  const handleConfirmOAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = oauthEmailInput.trim();
    const validation = validateEmailFormat(cleanEmail);
    if (!validation.isValid) {
      setOauthError(validation.message);
      return;
    }
    const provider = oauthModal || 'google';
    setAuthProvider(provider);
    setEmail(cleanEmail);
    const cleanName = oauthNameInput.trim() || cleanEmail.split('@')[0];
    setName(cleanName);
    setIsEmailVerified(true);
    if (provider === 'google') setAvatar(AVATARS[1]);
    else if (provider === 'facebook') setAvatar(AVATARS[3]);
    else setAvatar(AVATARS[2]);

    setOauthModal(null);
    setStep('DETAILS');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEmailFormat(email);
    if (!validation.isValid) {
      setEmailError(validation.message);
      return;
    }

    if (!password.trim()) {
      setEmailError('Please enter or create an account password.');
      return;
    }

    if (password.length < 4) {
      setEmailError('Password should be at least 4 characters long.');
      return;
    }

    setEmailError('');
    setAuthProvider('email');
    if (!name.trim()) {
      const derived = email.split('@')[0].replace(/[0-9_.-]+/g, ' ').trim();
      setName(derived ? derived.charAt(0).toUpperCase() + derived.slice(1) : 'Shopper');
    }

    // Generate real 6-digit verification code & dispatch
    const newCode = generateVerificationCode();
    setActiveVerificationCode(newCode);
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError('');
    setResendCooldown(45);
    setShowSimulatedCodeBanner(true);
    setStep('VERIFY_EMAIL');
  };

  const handleAutoFillCode = () => {
    if (!activeVerificationCode) return;
    const digits = activeVerificationCode.slice(0, 6).split('');
    setCodeDigits(digits);
    setCodeError('');
    otp5Ref.current?.focus();
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const nextDigits = [...codeDigits];
      nextDigits[index] = '';
      setCodeDigits(nextDigits);
      return;
    }

    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split('');
      const nextDigits = [...codeDigits];
      pasteDigits.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d;
      });
      setCodeDigits(nextDigits);
      const targetIdx = Math.min(pasteDigits.length, 5);
      otpRefs[targetIdx].current?.focus();
      return;
    }

    const singleDigit = cleaned.charAt(cleaned.length - 1);
    const nextDigits = [...codeDigits];
    nextDigits[index] = singleDigit;
    setCodeDigits(nextDigits);
    setCodeError('');

    if (index < 5 && singleDigit) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    const nextDigits = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      nextDigits[i] = d;
    });
    setCodeDigits(nextDigits);
    const targetIdx = Math.min(digits.length, 5);
    otpRefs[targetIdx].current?.focus();
  };

  const handleVerifyCodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = codeDigits.join('');
    if (entered.length < 6) {
      setCodeError('Please enter all 6 digits of the verification code.');
      return;
    }
    if (entered !== activeVerificationCode) {
      setCodeError('Incorrect PIN. The 6 digits entered do not match the code dispatched to your email.');
      return;
    }

    setCodeError('');
    setCodeSuccess(true);
    setIsEmailVerified(true);
    setTimeout(() => {
      setCodeSuccess(false);
      setStep('DETAILS');
    }, 700);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    const newCode = generateVerificationCode();
    setActiveVerificationCode(newCode);
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError('');
    setResendCooldown(45);
    setShowSimulatedCodeBanner(true);
    otp0Ref.current?.focus();
  };

  const handleDemoLogin = () => {
    setAuthProvider('demo');
    setName('Demo Shopper');
    setEmail('guest.shopper@wisepick.ai');
    setIsEmailVerified(true);
    setAvatar(AVATARS[0]);
    setStep('DETAILS');
  };

  const handleFinishDetails = () => {
    setStep('COUNTRY');
  };

  const handleFinalSubmit = () => {
    const finalProfile: UserProfile = {
      id: currentProfile?.id || 'usr_' + Date.now(),
      name: name.trim() || 'Tech Shopper',
      email: email.trim() || 'shopper@example.com',
      avatar: avatar || AVATARS[0],
      authProvider,
      persona: selectedPersona,
      joinedAt: currentProfile?.joinedAt || new Date().toLocaleDateString(),
      isEmailVerified: isEmailVerified || true,
      emailVerifiedAt: currentProfile?.emailVerifiedAt || new Date().toISOString(),
    };

    const finalCountryConfig: UserCountryConfig = {
      countryCode: activeCountry.code,
      countryName: activeCountry.name,
      flag: activeCountry.flag,
      currencySymbol: activeCountry.symbol,
      currencyCode: activeCountry.currencyCode,
      enabledStoreIds: enabledStoreIds.length > 0
        ? enabledStoreIds
        : activeCountry.popularStores.map((s) => s.id),
    };

    onComplete(finalProfile, finalCountryConfig);
  };

  const filteredCountries = SUPPORTED_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.continent.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.currencyCode.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const emailValidation = validateEmailFormat(email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-xl">
      {/* Dynamic colorful glowing background flares */}
      <div className="fixed top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-[#0c0e14]/95 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden my-auto backdrop-blur-md">
        {/* Top Progress / Steps Ribbon */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-gradient-to-r from-zinc-900/60 via-zinc-900/30 to-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">WisePick AI</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Global Shopping Advisor
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Unbiased technical specs &amp; regional in-country e-commerce pricing
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Tracker */}
        <div className="grid grid-cols-4 px-6 pt-4 pb-2 gap-2 text-xs border-b border-zinc-800/50">
          {[
            { id: 'LOGIN', label: '1. Sign In & Verify' },
            { id: 'DETAILS', label: '2. Your Profile' },
            { id: 'COUNTRY', label: '3. Country' },
            { id: 'STORES', label: '4. Local Stores' },
          ].map((s, idx) => {
            const stepsOrder: Step[] = ['LOGIN', 'DETAILS', 'COUNTRY', 'STORES'];
            const isLoginOrVerify = step === 'LOGIN' || step === 'VERIFY_EMAIL';
            const currentIndex = isLoginOrVerify ? 0 : stepsOrder.indexOf(step);
            const isCompleted = currentIndex > idx;
            const isCurrent = (idx === 0 && isLoginOrVerify) || step === s.id;

            return (
              <button
                key={s.id}
                type="button"
                disabled={!currentProfile && idx > currentIndex}
                onClick={() => {
                  if (currentProfile || idx <= currentIndex) {
                    if (idx === 0) setStep('LOGIN');
                    else setStep(s.id as Step);
                  }
                }}
                className={`py-1.5 px-2 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-zinc-800/60'
                    : 'text-zinc-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span className="truncate">{s.label.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: LOGIN */}
        {step === 'LOGIN' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Sponsorship Consumer Advocate</span>
              </div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight">
                Welcome to WisePick AI
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sign in with verified credentials to get authentic product evaluations, in-country pricing, and scam protection.
              </p>
            </div>

            {/* Authentic Social Authentication Buttons */}
            <div className="space-y-2.5 max-w-md mx-auto">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOpenOAuth('google')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-cyan-950/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (OAuth 2.0)</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOpenOAuth('facebook')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleOpenOAuth('apple')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-zinc-100" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.79-11.67-14.24-6.42-10.08-11.45-21.2-15.09-33.36-3.64-12.16-5.46-23.75-5.46-34.77 0-14.02 3.51-25.9 10.53-35.63 7.02-9.73 16.03-14.7 27.04-14.92 4.48 0 9.5 1.15 15.06 3.45 5.56 2.3 9.4 3.52 11.52 3.66 2.01-.14 6.01-1.43 12.01-3.88 6-2.45 11.05-3.53 15.15-3.24 16.54 1.15 28.53 7.6 35.97 19.34-14.54 8.84-21.68 21.03-21.43 36.56.24 12.16 4.88 22.37 13.92 30.63 4.14 3.82 8.84 6.7 14.1 8.64-2.88 8.65-6.57 17.06-11.06 25.24zM119.22 31.84c0-7.3 2.66-14.38 7.98-21.24 5.32-6.86 11.96-10.6 19.92-11.22.25 1.07.38 2.21.38 3.42 0 7.37-2.8 14.66-8.41 21.87-5.61 7.21-12.24 11.03-19.87 11.45z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Security Guarantee Banner */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-700/50 text-left max-w-md mx-auto space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Original Account Password Protection</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Legitimate web apps will <strong>never</strong> ask for your master Google or Facebook passwords in a form. Real Google and Facebook accounts authenticate securely via tokenized <strong>OAuth 2.0 Single Sign-On</strong> where your credentials stay with Google and Meta.
              </p>
            </div>

            <div className="relative flex items-center justify-center max-w-md mx-auto">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-[#0c0e14] px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold shrink-0">
                or sign in with email &amp; password
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>

            {/* Email Form with Live Syntax, Typo & Domain Verification */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 max-w-md mx-auto">
              {emailError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{emailError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-300">
                    Your Real Email Address
                  </label>
                  {email && emailValidation.isValid && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid Email Format
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    required
                    placeholder="e.g. pattabhi0204@gmail.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-zinc-900/90 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none transition-all ${
                      email && !emailValidation.isValid && email.length > 3
                        ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : email && emailValidation.isValid
                        ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-zinc-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Did you mean typo correction */}
                {emailValidation.suggestedCorrection && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Did you mean <strong>{emailValidation.suggestedCorrection}</strong>?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(emailValidation.suggestedCorrection!);
                        setEmailError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] cursor-pointer shrink-0 transition-colors"
                    >
                      Apply Fix
                    </button>
                  </div>
                )}

                {/* Real-time Syntax Error Note */}
                {!emailValidation.isValid && email.length > 3 && !emailValidation.suggestedCorrection && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{emailValidation.message}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-300">
                    Account Password
                  </label>
                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    App-specific password
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setEmailError('');
                    }}
                    required
                    placeholder="Enter or create your account password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                  Notice: To keep your accounts safe, create a unique password for WisePick. Never reuse your personal Gmail master password.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verify Email &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access */}
            <div className="text-center pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs text-amber-400/90 hover:text-amber-300 inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Demo Mode (Guest Access)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1.5: EMAIL & ACCOUNT VERIFICATION */}
        {step === 'VERIFY_EMAIL' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-md mx-auto">
            {/* Back button */}
            <div>
              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 relative shadow-inner">
                <MailCheck className="w-7 h-7 text-amber-400" />
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center absolute -top-1 -right-1 border-2 border-zinc-900 shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight">
                Verify Your Account Email
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We've dispatched a 6-digit confirmation security PIN to verify that your account email is authentic, active, and belongs to you:
              </p>

              {/* Target Email Badge with Edit */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-xs text-amber-300 font-mono">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep('LOGIN')}
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 underline ml-1 cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Simulated Live Dispatch Notification Banner */}
            {showSimulatedCodeBanner && activeVerificationCode && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-emerald-950/50 border border-emerald-500/40 text-left space-y-2.5 shadow-lg shadow-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>WisePick Security Dispatch</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-mono">Real-time simulator</span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-zinc-950/70 p-3 rounded-xl border border-emerald-800/40">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Your 6-Digit PIN:</p>
                    <p className="text-xl font-mono font-black text-emerald-300 tracking-widest">
                      {activeVerificationCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Auto-fill PIN</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Simulated real-time inbox delivery for instant verification. You can type each digit or click "Auto-fill PIN".
                </p>
              </div>
            )}

            {/* 6-Digit Code Input Form */}
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-center text-xs font-semibold text-zinc-300">
                  Enter the 6-Digit Verification PIN
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {codeDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border bg-zinc-900 text-zinc-100 focus:outline-none transition-all ${
                        codeError
                          ? 'border-rose-500 ring-2 ring-rose-500/30'
                          : codeSuccess
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300'
                          : digit
                          ? 'border-amber-500/80 ring-2 ring-amber-500/20'
                          : 'border-zinc-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {codeError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{codeError}</span>
                </div>
              )}

              {codeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/50 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Email &amp; Account Verified Successfully! Redirecting...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={codeSuccess}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Account &amp; Proceed</span>
              </button>

              {/* Resend Action with Countdown */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-500">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="font-semibold text-amber-400 hover:text-amber-300 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend PIN in ${resendCooldown}s`
                      : 'Resend Verification PIN'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: USER DETAILS ("ur details") */}
        {step === 'DETAILS' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-zinc-100">
                Customize Your Shopping Profile
              </h3>
              <p className="text-xs text-zinc-400">
                We tune specifications, budget tolerances, and advice around who you are.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Account Email
                    </label>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                    placeholder="e.g. alex@example.com"
                  />
                </div>
              </div>

              {/* Choose Avatar */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATARS.map((avUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(avUrl)}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === avUrl
                          ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt="Avatar" className="w-full h-full object-cover" />
                      {avatar === avUrl && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shopping Persona selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Shopping &amp; Tech Persona
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPersona === p.title;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPersona(p.title)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-zinc-800/90 border-amber-500/80 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br border shrink-0 ${p.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-zinc-100">{p.title}</h4>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleFinishDetails}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
              >
                <span>Select Your Country</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COUNTRY SELECTION ("and then it must ask country") */}
        {step === 'COUNTRY' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                <Globe className="w-3 h-3" />
                <span>Geographic Pricing &amp; Logistics</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100">
                Which Country Do You Belong To?
              </h3>
              <p className="text-xs text-zinc-400">
                Choose your country so we can localize currency, tax expectations, local warranties, and verified shipping retailers.
              </p>
            </div>

            {/* Search Country Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country, currency, or continent..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountryCode === c.code;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/70 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                            {c.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">
                            {c.currencyCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {c.popularStores.length} In-country retailers • {c.symbol}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-amber-400' : 'text-zinc-600'
                    }`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={() => setStep('STORES')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
              >
                <span>View In-Country Stores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IN-COUNTRY WEBSITES & SHIPPING APPS */}
        {step === 'STORES' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeCountry.flag}</span>
                  <h3 className="text-xl font-bold text-zinc-100">
                    In-Country Websites &amp; Delivery Apps ({activeCountry.name})
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  The assistant will query real-time prices &amp; availability <strong className="text-amber-300">only across stores that ship in {activeCountry.name}</strong> with domestic warranty.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep('COUNTRY')}
                className="text-[11px] text-amber-400 hover:underline shrink-0"
              >
                Change Country
              </button>
            </div>

            {/* Shipping Logistics Highlight Banner */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-300">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Domestic Logistics:</strong> {activeCountry.shippingHighlights}
              </span>
            </div>

            {/* Stores List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {activeCountry.popularStores.map((store) => {
                const isEnabled = enabledStoreIds.includes(store.id);

                return (
                  <div
                    key={store.id}
                    onClick={() => toggleStore(store.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isEnabled
                        ? 'bg-zinc-900/90 border-zinc-700 hover:border-amber-500/50 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-850 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox indicator */}
                      <div
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                          isEnabled
                            ? 'bg-amber-500 border-amber-400 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-800'
                        }`}
                      >
                        {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-100">{store.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">({store.domain})</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                            ✓ Ships in {activeCountry.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{store.tagline}</p>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-cyan-400" />
                            {store.typicalDelivery}
                          </span>
                          <span className="flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            {store.returnWindow} Return
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-purple-400" />
                            {store.paymentMethods.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                        {store.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('COUNTRY')}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ← Back to Country
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Continue to Product Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Interactive OAuth Dialog Modal */}
        {oauthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-[#12151e] border border-zinc-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  {oauthModal === 'google' && (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  )}
                  {oauthModal === 'facebook' && (
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                  )}
                  {oauthModal === 'apple' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.79-11.67-14.24-6.42-10.08-11.45-21.2-15.09-33.36-3.64-12.16-5.46-23.75-5.46-34.77 0-14.02 3.51-25.9 10.53-35.63 7.02-9.73 16.03-14.7 27.04-14.92 4.48 0 9.5 1.15 15.06 3.45 5.56 2.3 9.4 3.52 11.52 3.66 2.01-.14 6.01-1.43 12.01-3.88 6-2.45 11.05-3.53 15.15-3.24 16.54 1.15 28.53 7.6 35.97 19.34-14.54 8.84-21.68 21.03-21.43 36.56.24 12.16 4.88 22.37 13.92 30.63 4.14 3.82 8.84 6.7 14.1 8.64-2.88 8.65-6.57 17.06-11.06 25.24zM119.22 31.84c0-7.3 2.66-14.38 7.98-21.24 5.32-6.86 11.96-10.6 19.92-11.22.25 1.07.38 2.21.38 3.42 0 7.37-2.8 14.66-8.41 21.87-5.61 7.21-12.24 11.03-19.87 11.45z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {oauthModal === 'google' && 'Sign in with Google'}
                      {oauthModal === 'facebook' && 'Sign in with Facebook'}
                      {oauthModal === 'apple' && 'Sign in with Apple ID'}
                    </h4>
                    <span className="text-[11px] text-zinc-400">WisePick AI OAuth 2.0 Client</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOauthModal(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Password Protection & OAuth Security Explainer */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/40 text-[11px] text-emerald-200/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified Identity Protocol (OAuth 2.0)</span>
                </div>
                <p className="leading-relaxed">
                  Your master account password is encrypted and never accessed by WisePick AI. Identity authentication is confirmed directly with {oauthModal === 'google' ? 'Google' : oauthModal === 'facebook' ? 'Meta' : 'Apple'}.
                </p>
              </div>

              {/* Account Form */}
              <form onSubmit={handleConfirmOAuth} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Your {oauthModal === 'google' ? 'Gmail / Google' : oauthModal === 'facebook' ? 'Facebook' : 'Apple'} Account Email
                    </label>
                    {oauthEmailInput && validateEmailFormat(oauthEmailInput).isValid && (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={oauthEmailInput}
                      onChange={(e) => {
                        setOauthEmailInput(e.target.value);
                        setOauthError('');
                      }}
                      required
                      placeholder={oauthModal === 'google' ? 'e.g. pattabhi0204@gmail.com' : 'e.g. yourname@domain.com'}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                    />
                  </div>
                  {(() => {
                    const oauthVal = validateEmailFormat(oauthEmailInput);
                    if (oauthVal.suggestedCorrection) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setOauthEmailInput(oauthVal.suggestedCorrection!);
                            setOauthError('');
                          }}
                          className="mt-1.5 text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Did you mean <strong>{oauthVal.suggestedCorrection}</strong>? Tap to fix</span>
                        </button>
                      );
                    }
                    if (oauthEmailInput && !oauthVal.isValid && oauthEmailInput.length > 3) {
                      return (
                        <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{oauthVal.message}</span>
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={oauthNameInput}
                      onChange={(e) => setOauthNameInput(e.target.value)}
                      placeholder="e.g. Pattabhi Raman"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {oauthError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{oauthError}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setOauthModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <span>Authorize &amp; Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
