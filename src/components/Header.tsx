import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Scale, Globe, User, ChevronDown, Store, ExternalLink } from 'lucide-react';
import { UserProfile, UserCountryConfig } from '../types';
import { getCountryByCode } from '../data/countries';
import { CloudinaryLogo } from './CloudinaryLogo';

interface HeaderProps {
  onReset: () => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
  hasActiveReport: boolean;
  userProfile: UserProfile | null;
  userCountry: UserCountryConfig | null;
  onOpenAuthCountryFlow: (step?: 'LOGIN' | 'VERIFY_EMAIL' | 'DETAILS' | 'COUNTRY' | 'STORES') => void;
  onOpenCloudinaryHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  currency,
  onCurrencyChange,
  hasActiveReport,
  userProfile,
  userCountry,
  onOpenAuthCountryFlow,
  onOpenCloudinaryHub,
}) => {
  const [showStoresDropdown, setShowStoresDropdown] = useState(false);
  const activeCountryData = userCountry ? getCountryByCode(userCountry.countryCode) : null;

  return (
    <header className="border-b border-zinc-800/80 bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-zinc-900 to-cyan-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-zinc-100 tracking-tight">
                Smart Buy AI
              </span>
              <button
                type="button"
                onClick={onOpenCloudinaryHub}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full hover:bg-blue-900/60 transition-colors cursor-pointer"
                title="Open Cloudinary AI Hub"
              >
                <CloudinaryLogo size={13} />
                <span>Cloudinary AI Vision</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Visual Picture Drop • Cloudinary AI Engine • Local Prices
            </p>
          </div>
        </div>

        {/* Center/Right controls: Cloudinary AI Hub, Country, In-Country Stores & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloudinary AI Hub Quick Button */}
          {onOpenCloudinaryHub && (
            <button
              type="button"
              onClick={onOpenCloudinaryHub}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-600/50 bg-blue-950/50 hover:bg-blue-900/50 text-xs text-blue-200 transition-all cursor-pointer shadow-xs group"
              title="Cloudinary AI Hub: Background Removal, Saliency & Format Optimization"
            >
              <CloudinaryLogo size={16} />
              <span className="font-bold hidden md:inline text-blue-300">Cloudinary AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline" />
            </button>
          )}
          {/* Country Selector Button */}
          {userCountry ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => onOpenAuthCountryFlow('COUNTRY')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-xs text-zinc-200 transition-all cursor-pointer shadow-xs group"
                title="Change Country & Regional Shipping Stores"
              >
                <span className="text-base leading-none">{userCountry.flag}</span>
                <span className="font-bold hidden sm:inline">{userCountry.countryName}</span>
                <span className="text-[11px] text-amber-400 font-mono font-semibold">
                  ({userCountry.currencySymbol})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuthCountryFlow('COUNTRY')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 text-xs text-amber-300 font-bold transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Select Country</span>
            </button>
          )}

          {/* In-Country Stores badge & dropdown */}
          {userCountry && activeCountryData && (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setShowStoresDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-950/70 text-xs text-cyan-300 transition-all cursor-pointer"
                title="View In-Country Websites & Shipping Apps"
              >
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-[11px]">
                  {userCountry.enabledStoreIds.length} Stores in {userCountry.countryCode}
                </span>
                <ChevronDown className="w-3 h-3 text-cyan-400/80" />
              </button>

              {showStoresDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowStoresDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-[#0e1017] border border-cyan-800/60 shadow-2xl z-40 space-y-2 backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                        <span>{userCountry.flag}</span>
                        <span>In-Country Stores</span>
                      </span>
                      <button
                        onClick={() => {
                          setShowStoresDropdown(false);
                          onOpenAuthCountryFlow('STORES');
                        }}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {activeCountryData.popularStores.map((store) => {
                        const isEnabled = userCountry.enabledStoreIds.includes(store.id);
                        return (
                          <div
                            key={store.id}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              isEnabled ? 'bg-zinc-900/90 text-zinc-200' : 'text-zinc-600'
                            }`}
                          >
                            <span className="font-semibold">{store.name}</span>
                            <span className="text-[10px] text-zinc-400">{store.typicalDelivery}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-2 flex items-center justify-between">
                      <span>Domestic warranty guaranteed</span>
                      <span className="text-emerald-400">✓ In-stock check</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Profile avatar & button */}
          {userProfile ? (
            <button
              type="button"
              onClick={() => onOpenAuthCountryFlow('DETAILS')}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-zinc-750 bg-zinc-900/90 hover:border-amber-500/50 transition-all cursor-pointer"
              title="View / Edit Shopping Profile"
            >
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                />
                {userProfile.isEmailVerified && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-900 absolute -bottom-0.5 -right-0.5 shadow-xs"
                    title="Verified Account Email"
                  />
                )}
              </div>
              <span className="text-xs font-semibold text-zinc-200 hidden md:inline truncate max-w-[100px]">
                {userProfile.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuthCountryFlow('LOGIN')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* New Product Reset button */}
          {hasActiveReport && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700/90 rounded-xl transition-colors border border-zinc-750 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Product</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
