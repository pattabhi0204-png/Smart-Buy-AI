import React from 'react';
import { ProConItem, HiddenGotcha } from '../types';
import { ThumbsUp, ThumbsDown, ShieldAlert, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface ProsConsGotchasProps {
  pros: ProConItem[];
  cons: ProConItem[];
  hiddenGotchas: HiddenGotcha[];
}

export const ProsConsGotchas: React.FC<ProsConsGotchasProps> = ({
  pros,
  cons,
  hiddenGotchas,
}) => {
  return (
    <div className="space-y-6">
      {/* Hidden Gotchas & Fluff Unmasked - Prominent Banner */}
      <div className="bg-amber-950/25 border border-amber-800/60 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              Hidden Gotchas &amp; Marketing Fluff Unmasked
            </h3>
            <p className="text-xs text-amber-200/80">
              Critical nuances that marketing pages conceal or bury in fine print.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {hiddenGotchas.map((gotcha, idx) => {
            const isHigh = gotcha.severity === 'high';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHigh
                    ? 'bg-red-950/40 border-red-900/60 text-red-200'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-zinc-100">
                    {isHigh ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    {gotcha.warning}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      isHigh
                        ? 'bg-red-950/80 text-red-300 border-red-800/80'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                    }`}
                  >
                    {gotcha.severity}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {gotcha.whyItMatters}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personalized Pros */}
        <div className="bg-[#131519] rounded-2xl border border-zinc-800/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Tailored Advantages (Why It Fits You)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Features directly aligning with your priorities
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pros.map((pro, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 flex items-start gap-2.5"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-zinc-100 block mb-0.5">
                    {pro.title}
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    {pro.explanation}
                  </p>
                  {pro.matchedNeed && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      Matched Need: {pro.matchedNeed}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candid Cons & Real-World Friction */}
        <div className="bg-[#131519] rounded-2xl border border-zinc-800/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-red-950/60 text-red-300 border border-red-800/50 flex items-center justify-center">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Candid Drawbacks &amp; Potential Frustrations
              </h3>
              <p className="text-[11px] text-zinc-400">
                Where this device might let you down
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {cons.map((con, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-red-950/20 border border-red-900/50 flex items-start gap-2.5"
              >
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-zinc-100 block mb-0.5">
                    {con.title}
                  </span>
                  <p className="text-zinc-300 leading-relaxed">
                    {con.explanation}
                  </p>
                  {con.impactOnUser && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                      Impact on You: {con.impactOnUser}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
