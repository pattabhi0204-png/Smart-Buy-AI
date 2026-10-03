import React from 'react';
import { ProductSpecification, FitAnalysis, CloudinaryEfficiencyMetrics } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Award, Hourglass, Sparkles, TrendingUp, DollarSign, Cpu, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { CloudinaryLogo } from './CloudinaryLogo';

interface FitScoreCardProps {
  product: ProductSpecification;
  analysis: FitAnalysis;
  productImage?: string | null;
  cloudinaryMetrics?: CloudinaryEfficiencyMetrics | null;
  onScrollToAlternatives?: () => void;
}

export const FitScoreCard: React.FC<FitScoreCardProps> = ({
  product,
  analysis,
  productImage,
  cloudinaryMetrics,
  onScrollToAlternatives,
}) => {
  const { fitScore, verdict, verdictTitle, verdictSummary, valueForMoneyScore, longevityAssessment, scoreBreakdown } = analysis;

  // Derive sub-scores if not explicitly provided by fallback
  const featureFit = scoreBreakdown?.featureFit ?? Math.min(100, Math.max(20, fitScore + (fitScore > 75 ? 5 : -10)));
  const budgetFit = scoreBreakdown?.budgetFit ?? Math.min(100, Math.max(30, Math.round(valueForMoneyScore * 10)));
  const longevityFit = scoreBreakdown?.longevityFit ?? Math.min(100, Math.max(40, fitScore > 70 ? 85 : 55));
  const performanceFit = scoreBreakdown?.performanceFit ?? Math.min(100, Math.max(25, fitScore > 65 ? fitScore : 45));

  const getVerdictDetails = (v: FitAnalysis['verdict'], score: number) => {
    if (score >= 85) {
      return {
        label: 'Excellent Match (Recommended Buy)',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
        scoreColor: 'text-emerald-400 stroke-emerald-400',
        glowClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        icon: CheckCircle2,
        recommendation: 'Meets and exceeds your primary requirements with high confidence.',
        ratingTier: 'Tier A: Prime Choice',
      };
    }
    if (score >= 70) {
      return {
        label: 'Solid Match with Trade-offs',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
        scoreColor: 'text-amber-400 stroke-amber-400',
        glowClass: 'from-amber-500/20 via-orange-500/10 to-transparent',
        icon: AlertTriangle,
        recommendation: 'Viable option, but check the trade-offs and alternatives below before deciding.',
        ratingTier: 'Tier B: Good with Caveats',
      };
    }
    if (v === 'OVERKILL') {
      return {
        label: 'Overkill / Paying for Unneeded Power',
        badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10',
        scoreColor: 'text-indigo-400 stroke-indigo-400',
        glowClass: 'from-indigo-500/20 via-purple-500/10 to-transparent',
        icon: Sparkles,
        recommendation: 'You will overspend on specs you will not use. Check recommended alternatives to save money.',
        ratingTier: 'Tier C: Spec Overkill',
      };
    }
    if (v === 'UNDERPOWERED') {
      return {
        label: 'Underpowered for Your Workload',
        badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/10',
        scoreColor: 'text-orange-400 stroke-orange-400',
        glowClass: 'from-orange-500/20 via-red-500/10 to-transparent',
        icon: AlertTriangle,
        recommendation: 'This device will struggle or lag under your daily workflow. Choose an alternative with stronger specs.',
        ratingTier: 'Tier D: Underpowered',
      };
    }
    return {
      label: 'Poor Match / Not Recommended',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10',
      scoreColor: 'text-rose-400 stroke-rose-400',
      glowClass: 'from-rose-500/20 via-pink-500/10 to-transparent',
      icon: XCircle,
      recommendation: 'Violates your stated dealbreakers or budget. Strongly advise picking an alternative below.',
      ratingTier: 'Tier F: Mismatch',
    };
  };

  const config = getVerdictDetails(verdict, fitScore);
  const VerdictIcon = config.icon;

  // SVG Radial Progress math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fitScore / 100) * circumference;

  const hasMismatch = fitScore < 80 || verdict === 'NOT_RECOMMENDED' || verdict === 'UNDERPOWERED' || verdict === 'OVERKILL';

  return (
    <div className="relative bg-[#10131a]/95 rounded-2xl border border-zinc-800/90 overflow-hidden shadow-xl">
      {/* Dynamic colorful aurora backdrop glow */}
      <div className={`absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br ${config.glowClass} blur-3xl pointer-events-none rounded-full`} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative p-5 sm:p-7 space-y-6">
        {/* Top bar: Product Name & Category & Clear Rating Tier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {product.brand}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 font-medium">{product.category}</span>
              {product.model && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Mod: {product.model}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-800">
              {config.ratingTier}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}>
              <VerdictIcon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>
        </div>

        {/* Middle Core Grid: Visual Radial Percentage Meter & Verdict */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Circular Percentage Meter & Product Image */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/90 text-center relative overflow-hidden shadow-inner">
            {/* If product image is present, display it with Cloudinary AI badge */}
            {productImage && (
              <div className="w-full mb-3 flex flex-col items-center justify-center">
                <div className="relative rounded-xl overflow-hidden border border-blue-800/60 bg-zinc-950 max-h-40 w-full flex items-center justify-center p-2 group shadow-inner">
                  <img
                    src={productImage}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="max-h-36 object-contain"
                  />
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/85 border border-blue-500/50 text-[9px] font-mono text-cyan-300 font-bold flex items-center gap-1 backdrop-blur-xs">
                      <CloudinaryLogo size={11} />
                      <span>{cloudinaryMetrics?.appliedTransform || 'Cloudinary AI'}</span>
                    </span>
                  </div>
                  {cloudinaryMetrics?.percentageSaved && (
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 text-[9px] font-mono font-bold">
                        -{cloudinaryMetrics.percentageSaved}% Data Saved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="relative w-32 h-32 flex items-center justify-center mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-zinc-800/80"
                  strokeWidth="9"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className={`${config.scoreColor} transition-all duration-1000 ease-out`}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <div className="flex items-baseline">
                  <span className="text-4xl font-black tracking-tight text-white">{fitScore}</span>
                  <span className="text-lg font-bold text-amber-400 ml-0.5">%</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  Fit Score
                </span>
              </div>
            </div>

            <div className="w-full text-center">
              <span className="text-xs font-bold text-zinc-200 block">
                {fitScore >= 80 ? 'High Confidence Match' : fitScore >= 60 ? 'Moderate Compatibility' : 'Low Compatibility'}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-1 leading-snug">
                {config.recommendation}
              </span>
            </div>
          </div>

          {/* Verdict Summary & Sub-Percentage Gauges */}
          <div className="lg:col-span-8 space-y-4">
            {/* Verdict Headline and Summary Box */}
            <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 rounded-xl p-4 border border-zinc-800/80">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-1.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                {verdictTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {verdictSummary}
              </p>
            </div>

            {/* Clear Sub-Percentage Ratings for Customer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Feature Fit */}
              <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    Feature Fit
                  </span>
                  <span className="text-cyan-300 font-bold">{featureFit}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${featureFit}%` }} />
                </div>
              </div>

              {/* Budget Fit */}
              <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    Budget Fit
                  </span>
                  <span className="text-emerald-300 font-bold">{budgetFit}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${budgetFit}%` }} />
                </div>
              </div>

              {/* Longevity */}
              <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Hourglass className="w-3 h-3 text-purple-400" />
                    Longevity
                  </span>
                  <span className="text-purple-300 font-bold">{longevityFit}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${longevityFit}%` }} />
                </div>
              </div>

              {/* Performance */}
              <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    Workload Fit
                  </span>
                  <span className="text-amber-300 font-bold">{performanceFit}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${performanceFit}%` }} />
                </div>
              </div>
            </div>

            {/* Quick Value for Money & Lifespan tags */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <span className="text-zinc-400">Value for Money:</span>
                <span className="font-bold text-amber-300">{valueForMoneyScore}/10</span>
                <span className="text-[11px] text-zinc-500">
                  ({valueForMoneyScore >= 8 ? 'Great Value' : valueForMoneyScore >= 5 ? 'Fair' : 'Overpriced'})
                </span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <span className="text-zinc-400">Expected Lifespan:</span>
                <span className="font-semibold text-zinc-200">{longevityAssessment}</span>
              </div>
            </div>
          </div>

        </div>

        {/* If product has mismatches or trade-offs, show prominent colorful alert callout */}
        {hasMismatch && (
          <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-indigo-950/20">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-200 block">
                  Product Doesn't Fully Match Your Requirements ({fitScore}% Fit)
                </span>
                <span className="text-[11px] text-indigo-300/80 block">
                  This item has key trade-offs or falls short of your needs. We found smarter alternatives tailored for your exact routine!
                </span>
              </div>
            </div>

            {onScrollToAlternatives && (
              <button
                type="button"
                onClick={onScrollToAlternatives}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-indigo-500/25 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>View Better Alternatives</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

