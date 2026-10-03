import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductIntake } from './components/ProductIntake';
import { CustomerNeedsForm } from './components/CustomerNeedsForm';
import { FitScoreCard } from './components/FitScoreCard';
import { NeedsMatrix } from './components/NeedsMatrix';
import { ProsConsGotchas } from './components/ProsConsGotchas';
import { PriceComparisonView } from './components/PriceComparisonView';
import { AlternativesSection } from './components/AlternativesSection';
import { ProductQAChat } from './components/ProductQAChat';
import { AuthAndCountryFlow } from './components/AuthAndCountryFlow';
import { CloudinaryHubModal } from './components/CloudinaryHubModal';
import { UserPreferences, ProductDecisionReport, UserProfile, UserCountryConfig, CloudinaryEfficiencyMetrics } from './types';
import { PRESET_DEMOS, PresetDemo } from './data/presets';
import { getCountryByCode } from './data/countries';
import { calculateEfficiencyMetrics } from './utils/cloudinary';
import { Sparkles, ArrowRight, ShieldCheck, Scale, History, RotateCcw, AlertCircle, ShoppingCart, Globe, Store, Truck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_PREFERENCES: UserPreferences = {
  budgetMin: undefined,
  budgetMax: undefined,
  currency: '$',
  primaryUsage: '',
  priorityFactors: ['Value for Money', 'Durability & Build Quality'],
  dealbreakers: [],
  experienceLevel: 'intermediate',
  usageFrequency: 'regular',
  longevityExpectation: '3-4 years',
  extraNotes: '',
};

export default function App() {
  // User Authentication & Country State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('wisepick_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userCountry, setUserCountry] = useState<UserCountryConfig | null>(() => {
    try {
      const saved = localStorage.getItem('wisepick_user_country');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal / Onboarding Flow state: open automatically if user hasn't set up country/profile
  const [showAuthCountryModal, setShowAuthCountryModal] = useState<boolean>(() => {
    try {
      const savedProf = localStorage.getItem('wisepick_user_profile');
      const savedCountry = localStorage.getItem('wisepick_user_country');
      return !savedProf || !savedCountry;
    } catch {
      return true;
    }
  });

  const [authFlowStep, setAuthFlowStep] = useState<'LOGIN' | 'VERIFY_EMAIL' | 'DETAILS' | 'COUNTRY' | 'STORES'>('LOGIN');
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);

  // Currency follows chosen country by default
  const [currency, setCurrency] = useState<string>(() => {
    if (userCountry?.currencySymbol) return userCountry.currencySymbol;
    return '$';
  });

  const [image, setImage] = useState<string | null>(null);
  const [cloudinaryMetrics, setCloudinaryMetrics] = useState<CloudinaryEfficiencyMetrics | null>(null);
  const [productName, setProductName] = useState('');
  const [productSpecs, setProductSpecs] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...INITIAL_PREFERENCES,
    currency: userCountry?.currencySymbol || '$',
  });

  const [activeReport, setActiveReport] = useState<ProductDecisionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ProductDecisionReport[]>([]);

  // Update currency when userCountry changes
  useEffect(() => {
    if (userCountry) {
      setCurrency(userCountry.currencySymbol);
      setPreferences((prev) => ({ ...prev, currency: userCountry.currencySymbol }));
    }
  }, [userCountry]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wisepick_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const saveToHistory = (report: ProductDecisionReport) => {
    setHistory((prev) => {
      const filtered = prev.filter((r) => r.product.name !== report.product.name);
      const updated = [report, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('wisepick_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist history', e);
      }
      return updated;
    });
  };

  const handleAuthAndCountryComplete = (profile: UserProfile, country: UserCountryConfig) => {
    setUserProfile(profile);
    setUserCountry(country);
    setCurrency(country.currencySymbol);
    setPreferences((prev) => ({ ...prev, currency: country.currencySymbol }));
    setShowAuthCountryModal(false);

    try {
      localStorage.setItem('wisepick_user_profile', JSON.stringify(profile));
      localStorage.setItem('wisepick_user_country', JSON.stringify(country));
    } catch (e) {
      console.error('Failed to persist auth/country', e);
    }
  };

  const handleSelectPreset = (preset: PresetDemo) => {
    setProductName(preset.name);
    setProductSpecs(preset.specsSnippet);
    setImage(preset.sampleImage);
    const estBytes = 1024 * 1024 * 3.4;
    const metrics = calculateEfficiencyMetrics(estBytes, 'optimized');
    setCloudinaryMetrics(metrics);
    setPreferences({
      ...preset.mockPreferences,
      currency,
    });
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!productName.trim() && !image && !productSpecs.trim()) {
      setError('Please upload a product photo or enter a product name/link to analyze.');
      return;
    }

    if (!preferences.primaryUsage.trim()) {
      setError('Please provide your primary use case so we can match the product to your actual routine.');
      return;
    }

    setLoading(true);
    setError(null);

    const countryPayload = userCountry
      ? {
          countryCode: userCountry.countryCode,
          countryName: userCountry.countryName,
          currencyCode: userCountry.currencyCode,
          currencySymbol: userCountry.currencySymbol,
          enabledStoreNames: getCountryByCode(userCountry.countryCode).popularStores
            .filter((s) => userCountry.enabledStoreIds.includes(s.id))
            .map((s) => s.name),
        }
      : undefined;

    try {
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          productNameOrQuery: productName.trim(),
          productSpecs: productSpecs.trim(),
          userPreferences: {
            ...preferences,
            currency,
          },
          currency,
          country: countryPayload,
          cloudinaryMetrics,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete analysis.');
      }

      setActiveReport(data);
      saveToHistory(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternative = (altName: string) => {
    setProductName(altName);
    setImage(null);
    setCloudinaryMetrics(null);
    setProductSpecs('');
    setActiveReport(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setActiveReport(null);
    setImage(null);
    setCloudinaryMetrics(null);
    setProductName('');
    setProductSpecs('');
    setError(null);
  };

  const handleScrollToAlternatives = () => {
    const el = document.getElementById('alternatives-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeCountryData = userCountry ? getCountryByCode(userCountry.countryCode) : null;

  return (
    <div className="min-h-screen bg-colorful-dark text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Onboarding / Auth / Country Modal Flow */}
      {showAuthCountryModal && (
        <AuthAndCountryFlow
          currentProfile={userProfile}
          currentCountry={userCountry}
          initialStep={authFlowStep}
          onComplete={handleAuthAndCountryComplete}
          onClose={userCountry ? () => setShowAuthCountryModal(false) : undefined}
        />
      )}

      {/* Cloudinary AI Control Hub Modal */}
      <CloudinaryHubModal
        isOpen={showCloudinaryModal}
        onClose={() => setShowCloudinaryModal(false)}
        activeMode={cloudinaryMetrics?.activeMode || 'optimized'}
        onSelectMode={(mode) => {
          if (image) {
            const savedCloud = localStorage.getItem('smartbuy_cloudinary_cloud') || undefined;
            fetch('/api/cloudinary/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image, mode, cloudName: savedCloud }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.metrics) setCloudinaryMetrics(data.metrics);
                if (data.cloudUrl) setImage(data.cloudUrl);
              })
              .catch(console.error);
          }
        }}
        currentCloudinaryUrl={cloudinaryMetrics?.cloudTransformUrl || (image?.startsWith('http') ? image : null)}
      />

      <Header
        onReset={handleReset}
        currency={currency}
        onCurrencyChange={(c) => {
          setCurrency(c);
          setPreferences((prev) => ({ ...prev, currency: c }));
        }}
        hasActiveReport={Boolean(activeReport)}
        userProfile={userProfile}
        userCountry={userCountry}
        onOpenAuthCountryFlow={(step = 'LOGIN') => {
          setAuthFlowStep(step);
          setShowAuthCountryModal(true);
        }}
        onOpenCloudinaryHub={() => setShowCloudinaryModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-zinc-100 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-100">Notice from AI Service</span>
                <span className="text-zinc-300 leading-relaxed block mt-0.5">{error}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Now</span>
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 font-medium text-xs rounded-lg hover:bg-zinc-800/60"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!activeReport ? (
            <motion.div
              key="intake-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Value Proposition Header */}
              <div className="text-center max-w-3xl mx-auto py-2 sm:py-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Smart Buy AI • Cloudinary AI Vision &amp; In-Country Deals
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
                  Drop a product picture. <span className="underline decoration-amber-500 decoration-wavy decoration-2">Buy smart, not hyped.</span>
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm mt-2.5 max-w-2xl mx-auto leading-relaxed">
                  Avoid marketing traps, confusing specs, and fake reviews. Drop any product photo or packaging, let Cloudinary AI isolate the hardware and boost spec clarity, and receive an unbiased fit score with localized in-country prices.
                </p>
              </div>

              {/* In-Country Logistics & Stores Active Banner */}
              {userCountry && activeCountryData && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/90 to-purple-950/30 border border-cyan-800/50 shadow-md gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl shrink-0">{userCountry.flag}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-zinc-100">
                          Shopping in {userCountry.countryName} ({userCountry.currencySymbol} {userCountry.currencyCode})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                          {userCountry.enabledStoreIds.length} Verified In-Country Retailers
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {activeCountryData.shippingHighlights}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-cyan-300 font-medium flex-wrap">
                        <span>Active Stores:</span>
                        {activeCountryData.popularStores
                          .filter((s) => userCountry.enabledStoreIds.includes(s.id))
                          .slice(0, 4)
                          .map((s) => (
                            <span key={s.id} className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 text-[10px]">
                              {s.name}
                            </span>
                          ))}
                        {userCountry.enabledStoreIds.length > 4 && (
                          <span className="text-zinc-400 text-[10px]">
                            +{userCountry.enabledStoreIds.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthFlowStep('STORES');
                        setShowAuthCountryModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Store className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Manage Stores</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthFlowStep('COUNTRY');
                        setShowAuthCountryModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Change Country</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Product Photo & Identification with Picture Dropping & Cloudinary AI */}
              <ProductIntake
                image={image}
                onImageChange={setImage}
                cloudinaryMetrics={cloudinaryMetrics}
                onCloudinaryMetricsChange={setCloudinaryMetrics}
                productName={productName}
                onProductNameChange={setProductName}
                productSpecs={productSpecs}
                onProductSpecsChange={setProductSpecs}
                onSelectPreset={handleSelectPreset}
                onOpenCloudinaryHub={() => setShowCloudinaryModal(true)}
              />

              {/* Step 2: Customer Needs & Real-World Preferences */}
              <CustomerNeedsForm
                preferences={preferences}
                onChange={setPreferences}
                currency={currency}
              />

              {/* Action Button */}
              <div className="flex flex-col items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all disabled:opacity-50 select-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      <span>Cross-Examining Specs &amp; Searching In-Country Prices...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-zinc-950" />
                      <span>
                        Analyze Product Fit &amp; Compare {userCountry ? `${userCountry.countryName} ` : ''}Prices
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-zinc-500 mt-2">
                  100% independent evaluation. No affiliate bias or sponsored rankings.
                </p>
              </div>

              {/* Session History (if previous analyses exist) */}
              {history.length > 0 && (
                <div className="pt-6 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span>Recent Product Evaluations in this Session</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {history.map((rep) => (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => {
                          setActiveReport(rep);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-3 bg-[#131519] rounded-xl border border-zinc-800 hover:border-zinc-700 text-left transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span className="font-semibold text-zinc-300">{rep.product.brand}</span>
                          <span className="font-bold text-amber-400">{rep.analysis.fitScore}% Fit</span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-300">
                          {rep.product.name}
                        </h4>
                        <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                          <span>{currency}{rep.pricing.lowestPrice.toFixed(2)}</span>
                          <span className="text-zinc-500 text-[10px]">View Report &rarr;</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="report-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back / Navigation Bar */}
              <div className="flex items-center justify-between bg-[#131519] p-3.5 rounded-xl border border-zinc-800/80 shadow-2xs flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-800/70 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Edit Needs / Inspect Another Product
                </button>
                <div className="text-xs text-zinc-400 hidden sm:flex items-center gap-2">
                  {userCountry && (
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                      {userCountry.flag} {userCountry.countryCode} Store Search
                    </span>
                  )}
                  <span>Evaluated for: <strong className="text-zinc-200">"{activeReport.userSnapshot?.primaryUsage || 'General Use'}"</strong></span>
                </div>
              </div>

              {/* 1. Core Fit Score & Verdict Headline Card */}
              <FitScoreCard
                product={activeReport.product}
                analysis={activeReport.analysis}
                productImage={activeReport.productImage}
                cloudinaryMetrics={activeReport.cloudinaryMetrics || cloudinaryMetrics}
                onScrollToAlternatives={handleScrollToAlternatives}
              />

              {/* 2. Needs vs Specs Matrix */}
              <NeedsMatrix
                matches={activeReport.analysis.specsVersusNeeds}
                keySpecs={activeReport.product.keySpecs}
              />

              {/* 3. Personalized Pros, Cons & Hidden Gotchas Unmasked */}
              <ProsConsGotchas
                pros={activeReport.analysis.pros}
                cons={activeReport.analysis.cons}
                hiddenGotchas={activeReport.analysis.hiddenGotchas}
              />

              {/* 4. Real-time Multi-Platform Price Comparison (Filtered by In-Country Stores) */}
              <PriceComparisonView
                pricing={activeReport.pricing}
                productName={activeReport.product.name}
                brand={activeReport.product.brand}
                model={activeReport.product.model}
                currency={currency}
                country={userCountry}
              />

              {/* 5. Smarter Alternatives tailored to their profile */}
              <AlternativesSection
                alternatives={activeReport.analysis.betterAlternatives}
                onSelectAlternative={handleSelectAlternative}
                currentProductName={activeReport.product.name}
                currentFitScore={activeReport.analysis.fitScore}
              />

              {/* 6. Interactive Unbiased Product Advisor Q&A */}
              <ProductQAChat
                product={activeReport.product}
                analysis={activeReport.analysis}
                userPreferences={activeReport.userSnapshot}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0c0e14] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Smart Buy AI</span>
            <span>•</span>
            <span>Empowering confident, unbiased consumer purchasing decisions with Cloudinary AI &amp; Gemini.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cloudinary AI Vision Pipeline</span>
            <span>•</span>
            <span>Independent &amp; Ad-Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
