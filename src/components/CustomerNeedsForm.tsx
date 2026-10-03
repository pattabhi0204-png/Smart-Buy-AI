import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Sliders, Plus, X, AlertTriangle, Clock, Activity, DollarSign, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useVoice';

interface CustomerNeedsFormProps {
  preferences: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
  currency: string;
}

const COMMON_PRIORITIES = [
  'Long Battery Life',
  'Heavy Workload Performance',
  'Portability & Lightweight',
  'Durability & Build Quality',
  'Ease of Use (Simple Setup)',
  'Comfort for Daily Use',
  'Repairability / Upgradable',
  'Value for Money',
  'Low Noise / Silent',
  'High-End Display / Audio',
];

const COMMON_DEALBREAKERS = [
  'Overheats / Loud Fan',
  'Proprietary Cables or Ports',
  'Requires Paid Subscription',
  'Heavy / Bulky to Carry',
  'Non-Repairable / Soldered Parts',
  'Frequent Battery Degradation',
  'Complicated Maintenance / Cleaning',
  'Poor Customer Support / Warranty',
];

export const CustomerNeedsForm: React.FC<CustomerNeedsFormProps> = ({
  preferences,
  onChange,
  currency,
}) => {
  const [customPriority, setCustomPriority] = useState('');
  const [customDealbreaker, setCustomDealbreaker] = useState('');

  // Voice dictation for primary usage/routine
  const {
    isListening: isListeningUsage,
    hasSupport: hasSpeechSupport,
    error: speechError,
    startListening: startListeningUsage,
    stopListening: stopListeningUsage,
  } = useSpeechRecognition();

  const handleToggleVoiceUsage = () => {
    if (isListeningUsage) {
      stopListeningUsage();
    } else {
      startListeningUsage((spokenText) => {
        onChange({ ...preferences, primaryUsage: spokenText });
      });
    }
  };

  const togglePriority = (tag: string) => {
    const exists = preferences.priorityFactors.includes(tag);
    const updated = exists
      ? preferences.priorityFactors.filter((t) => t !== tag)
      : [...preferences.priorityFactors, tag];
    onChange({ ...preferences, priorityFactors: updated });
  };

  const addCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPriority.trim()) return;
    if (!preferences.priorityFactors.includes(customPriority.trim())) {
      onChange({
        ...preferences,
        priorityFactors: [...preferences.priorityFactors, customPriority.trim()],
      });
    }
    setCustomPriority('');
  };

  const toggleDealbreaker = (tag: string) => {
    const exists = preferences.dealbreakers.includes(tag);
    const updated = exists
      ? preferences.dealbreakers.filter((t) => t !== tag)
      : [...preferences.dealbreakers, tag];
    onChange({ ...preferences, dealbreakers: updated });
  };

  const addCustomDealbreaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDealbreaker.trim()) return;
    if (!preferences.dealbreakers.includes(customDealbreaker.trim())) {
      onChange({
        ...preferences,
        dealbreakers: [...preferences.dealbreakers, customDealbreaker.trim()],
      });
    }
    setCustomDealbreaker('');
  };

  return (
    <div className="bg-[#131519] rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">2</span>
          Your Real-World Needs &amp; Preferences
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tell us how you actually use the product so we can analyze if it suits you or if you're overpaying.
        </p>
      </div>

      <div className="space-y-5">
        {/* Primary Usage & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-7">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Primary Use Case &amp; Routine <span className="text-red-400">*</span>
              </label>
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={handleToggleVoiceUsage}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isListeningUsage
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
                  title={isListeningUsage ? 'Stop Voice Recording' : 'Speak Your Routine'}
                >
                  {isListeningUsage ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>Listening... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-amber-400" />
                      <span>Speak Routine</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={preferences.primaryUsage}
                onChange={(e) => onChange({ ...preferences, primaryUsage: e.target.value })}
                placeholder={isListeningUsage ? 'Listening... describe how and where you will use it' : 'e.g. Daily subway commute, open-office Zoom calls, and audiobooks'}
                className={`w-full pl-3.5 pr-11 py-2.5 rounded-xl border text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 bg-zinc-900/90 shadow-2xs transition-all ${
                  isListeningUsage
                    ? 'border-rose-500 ring-2 ring-rose-500/30'
                    : 'border-zinc-800 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={handleToggleVoiceUsage}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isListeningUsage
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 animate-pulse'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                  }`}
                  title={isListeningUsage ? 'Stop Listening' : 'Speak Routine'}
                >
                  {isListeningUsage ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListeningUsage && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded-lg">
                <span className="flex space-x-0.5 items-end h-3">
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_200ms] h-2/3 rounded" />
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_300ms] h-full rounded" />
                </span>
                <span>Speak your daily routine naturally (e.g. "I do 4K video editing and travel frequently")...</span>
              </div>
            )}

            {speechError && (
              <p className="text-[11px] text-amber-400 mt-1">{speechError}</p>
            )}
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
              Target Budget Range ({currency})
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-zinc-500 text-xs font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={preferences.budgetMin ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...preferences,
                      budgetMin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Min"
                  className="w-full pl-6 pr-2 py-2 rounded-xl border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-zinc-900/90 shadow-2xs"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-zinc-500 text-xs font-medium">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={preferences.budgetMax ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...preferences,
                      budgetMax: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Max"
                  className="w-full pl-6 pr-2 py-2 rounded-xl border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-zinc-900/90 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Factors */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            Top Priorities &amp; Must-Have Features (Click to select)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_PRIORITIES.map((tag) => {
              const selected = preferences.priorityFactors.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePriority(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-xs'
                      : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60'
                  }`}
                >
                  {selected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={customPriority}
              onChange={(e) => setCustomPriority(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomPriority(e)}
              placeholder="Add custom priority..."
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:border-amber-500 flex-1 bg-zinc-900/90"
            />
            <button
              type="button"
              onClick={addCustomPriority}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Dealbreakers */}
        <div>
          <label className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Strict Dealbreakers (Things you cannot tolerate)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_DEALBREAKERS.map((tag) => {
              const selected = preferences.dealbreakers.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDealbreaker(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? 'bg-red-600 text-white shadow-xs font-semibold'
                      : 'bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-900/50'
                  }`}
                >
                  {selected ? '✕ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={customDealbreaker}
              onChange={(e) => setCustomDealbreaker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomDealbreaker(e)}
              placeholder="Add custom dealbreaker..."
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:border-red-500 flex-1 bg-zinc-900/90"
            />
            <button
              type="button"
              onClick={addCustomDealbreaker}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Usage Details & Lifespan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-800/80">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Technical Experience
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  experienceLevel: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-800 text-zinc-200 text-xs bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="beginner" className="bg-zinc-900 text-zinc-200">Beginner (Prefers plug &amp; play)</option>
              <option value="intermediate" className="bg-zinc-900 text-zinc-200">Intermediate (Comfortable with settings)</option>
              <option value="enthusiast" className="bg-zinc-900 text-zinc-200">Power User / Enthusiast (Demanding)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              Usage Frequency
            </label>
            <select
              value={preferences.usageFrequency}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  usageFrequency: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-800 text-zinc-200 text-xs bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="occasional" className="bg-zinc-900 text-zinc-200">Occasional (A few times a week)</option>
              <option value="regular" className="bg-zinc-900 text-zinc-200">Regular (Daily standard usage)</option>
              <option value="heavy_daily" className="bg-zinc-900 text-zinc-200">Heavy Daily (Continuous multi-hour)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Target Longevity
            </label>
            <select
              value={preferences.longevityExpectation}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  longevityExpectation: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-800 text-zinc-200 text-xs bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="1-2 years" className="bg-zinc-900 text-zinc-200">1-2 Years (Quick upgrade cycle)</option>
              <option value="3-4 years" className="bg-zinc-900 text-zinc-200">3-4 Years (Average lifecycle)</option>
              <option value="5+ years" className="bg-zinc-900 text-zinc-200">5+ Years (Maximum durable investment)</option>
            </select>
          </div>
        </div>

        {/* Extra Notes */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Any Unique Constraints or Context (Optional)
          </label>
          <input
            type="text"
            value={preferences.extraNotes || ''}
            onChange={(e) => onChange({ ...preferences, extraNotes: e.target.value })}
            placeholder="e.g. I have small ears, wear glasses all day, live in a dusty humid climate, or need Linux compatibility"
            className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-zinc-900/90 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};
