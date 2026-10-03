import React from 'react';
import { SpecMatch, KeySpec } from '../types';
import { Check, AlertCircle, ArrowUpRight, Minus } from 'lucide-react';

interface NeedsMatrixProps {
  matches: SpecMatch[];
  keySpecs: KeySpec[];
}

export const NeedsMatrix: React.FC<NeedsMatrixProps> = ({ matches, keySpecs }) => {
  const getStatusBadge = (status: SpecMatch['status']) => {
    switch (status) {
      case 'exceeds':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
            <ArrowUpRight className="w-3 h-3" /> Exceeds Need
          </span>
        );
      case 'meets':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/60">
            <Check className="w-3 h-3" /> Meets Need
          </span>
        );
      case 'falls_short':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-300 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-800/60">
            <AlertCircle className="w-3 h-3" /> Falls Short
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-700/60">
            <Minus className="w-3 h-3" /> Neutral / N/A
          </span>
        );
    }
  };

  return (
    <div className="bg-[#131519] rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-zinc-800/80 gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">
            Requirement vs. Specification Cross-Examination
          </h3>
          <p className="text-xs text-zinc-400">
            Direct comparison of what you asked for against the manufacturer's actual hardware delivery.
          </p>
        </div>
      </div>

      {/* Cross-examination table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/60">
              <th className="py-2.5 px-3 rounded-l-lg">Your Stated Requirement</th>
              <th className="py-2.5 px-3">What This Product Delivers</th>
              <th className="py-2.5 px-3 rounded-r-lg text-right">Alignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 text-xs">
            {matches.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-3 font-medium text-zinc-100 max-w-[200px]">
                  {item.requirement}
                </td>
                <td className="py-3 px-3 text-zinc-300 max-w-[280px]">
                  {item.productOffers}
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verified Key Hardware Specs Chips */}
      {keySpecs && keySpecs.length > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <h4 className="text-xs font-semibold text-zinc-300 mb-2">
            Verified Hardware Specs Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {keySpecs.map((spec, i) => (
              <div
                key={i}
                className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 text-xs"
              >
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide block truncate">
                  {spec.label}
                </span>
                <span className="font-medium text-zinc-100 block truncate" title={spec.value}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
