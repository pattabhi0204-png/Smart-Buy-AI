import React from 'react';
import { AlternativeProduct } from '../types';
import { Shuffle, ArrowRight, Sparkles, Check, DollarSign, Target, ShieldCheck, Zap } from 'lucide-react';

interface AlternativesSectionProps {
  alternatives: AlternativeProduct[];
  onSelectAlternative: (altName: string) => void;
  currentProductName?: string;
  currentFitScore?: number;
}

export const AlternativesSection: React.FC<AlternativesSectionProps> = ({
  alternatives,
  onSelectAlternative,
  currentProductName,
  currentFitScore,
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div id="alternatives-section" className="relative bg-[#10131a]/95 rounded-2xl border border-indigo-500/30 p-5 sm:p-7 shadow-xl overflow-hidden">
      {/* Luminous colorful aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Better Alternatives Tailored to Your Requirements
                </h3>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  {alternatives.length} Matches Found
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentFitScore && currentFitScore < 80
                  ? `Because "${currentProductName || 'the inspected product'}" has notable compromises, these options specifically solve your unmet needs.`
                  : `Curated options that offer either superior value, better durability, or higher specs for your exact routine.`}
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {alternatives.map((alt, i) => {
            const matchScore = alt.matchScore ?? (92 - i * 3);
            const isTopChoice = i === 0;

            return (
              <div
                key={i}
                className={`relative rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                  isTopChoice
                    ? 'bg-gradient-to-b from-indigo-950/40 via-zinc-900/90 to-zinc-950/95 border-indigo-500/50 shadow-lg shadow-indigo-950/30'
                    : 'bg-zinc-900/80 hover:bg-zinc-900/95 border-zinc-800 hover:border-zinc-700/80 shadow-sm'
                }`}
              >
                {/* Top Badge for Top Choice */}
                {isTopChoice && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold py-1 px-3 text-center uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>#1 Recommended Alternative</span>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Brand & Match Percentage */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {alt.brand}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {alt.priceDifference && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                          {alt.priceDifference}
                        </span>
                      )}
                      <span className="text-xs font-black text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {matchScore}% Fit
                      </span>
                    </div>
                  </div>

                  {/* Product Title & Price */}
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
                      {alt.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-base font-extrabold text-amber-300">
                        {alt.estimatedPrice}
                      </span>
                      <span className="text-[11px] text-zinc-400">Est. Retail</span>
                    </div>
                  </div>

                  {/* Why it is better for the customer */}
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3 text-indigo-400" />
                      Why it beats your current pick
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {alt.whyBetter}
                    </p>
                  </div>

                  {/* Key Advantage Pill */}
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-indigo-200 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-white block text-[11px]">Primary Advantage:</strong>
                      <span className="text-zinc-300 text-xs leading-tight">{alt.keyAdvantage}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: 1-Click Switch */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectAlternative(alt.name)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isTopChoice
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <span>Switch &amp; Inspect This Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

