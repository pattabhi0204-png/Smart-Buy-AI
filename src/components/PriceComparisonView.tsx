import React, { useState } from 'react';
import { PricingOverview, StorePrice, UserCountryConfig } from '../types';
import { ShoppingCart, ExternalLink, Tag, Sparkles, Trophy, ShieldCheck, RefreshCw, Gift, Truck, CheckCircle, ArrowUpRight, Globe } from 'lucide-react';
import { resolveProductStoreUrl } from '../utils/productUrls';

interface PriceComparisonViewProps {
  pricing: PricingOverview;
  productName: string;
  brand: string;
  model: string;
  currency: string;
  country?: UserCountryConfig | null;
}

export const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({
  pricing,
  productName,
  brand,
  model,
  currency,
  country,
}) => {
  const [isSearchingGrounded, setIsSearchingGrounded] = useState(false);
  const [groundedResults, setGroundedResults] = useState<{
    summary: string;
    sources: { title: string; uri: string }[];
  } | null>(null);

  const handleFetchGroundedPrices = async () => {
    setIsSearchingGrounded(true);
    try {
      const res = await fetch('/api/search-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          brand,
          model,
          country,
          currency,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroundedResults(data);
      }
    } catch (err) {
      console.error('Failed to fetch grounded prices:', err);
    } finally {
      setIsSearchingGrounded(false);
    }
  };

  const formatPrice = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `${currency}${amount.toFixed(2)}`;
  };

  const potentialSavings =
    pricing.highestPrice && pricing.lowestPrice
      ? pricing.highestPrice - pricing.lowestPrice
      : 0;

  // Identify the best store object
  const bestStoreObj =
    pricing.stores.find((s) => s.platform.toLowerCase() === pricing.bestStore?.toLowerCase()) ||
    pricing.stores.find((s) => s.isLowestPrice) ||
    pricing.stores[0];

  const fullProductName = [brand, productName, model].filter(Boolean).join(' ').trim() || productName;
  const bestStoreProductUrl = bestStoreObj
    ? resolveProductStoreUrl(bestStoreObj.storeUrl, bestStoreObj.platform, fullProductName, country?.countryCode)
    : '#';

  const bestStoreReason =
    pricing.bestStoreReason ||
    `Verified lowest in-stock price at ${formatPrice(bestStoreObj?.price || pricing.lowestPrice)}, offering ${bestStoreObj?.returnPolicy || 'hassle-free return policy'} and reliable customer warranty.`;

  return (
    <div className="relative bg-[#10131a]/95 rounded-2xl border border-emerald-500/30 p-5 sm:p-7 shadow-xl space-y-6 overflow-hidden">
      {/* Colorful ambient glow backdrop */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-tl from-amber-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Real-Time Multi-Platform Price &amp; Deal Comparison
              </h3>
              <p className="text-xs text-zinc-400">
                Unbiased analysis across major retailers: comparing net prices, secret coupons, returns, and warranties.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFetchGroundedPrices}
          disabled={isSearchingGrounded}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl text-xs font-semibold transition-all shadow-md disabled:opacity-50 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          {isSearchingGrounded ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning Live E-Commerce Web...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Google Search Grounding
            </>
          )}
        </button>
      </div>

      {/* In-Country Logistics & Retailers Banner */}
      {country && (
        <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-zinc-900/90 via-cyan-950/20 to-zinc-900/90 border border-cyan-800/40 text-xs text-zinc-300 flex-wrap gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl">{country.flag}</span>
            <div>
              <span className="font-bold text-zinc-100">
                In-Country Shipping &amp; Pricing ({country.countryName}):
              </span>
              <span className="text-zinc-400 ml-1.5 hidden sm:inline">
                Comparing authorized domestic platforms that ship within {country.countryName} with local warranty.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Domestic Delivery in {country.currencyCode}</span>
          </span>
        </div>
      )}

      {/* 🏆 BEST WEBSITE RECOMMENDATION HERO SPOTLIGHT */}
      {bestStoreObj && (
        <div className="relative p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900/90 to-teal-950/50 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-black shadow-sm shadow-emerald-500/40">
                  <Trophy className="w-3.5 h-3.5 fill-black" />
                  BEST WEBSITE TO BUY
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Top Consumer Value &amp; Safety
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {bestStoreObj.platform}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {currency}{bestStoreObj.price.toFixed(2)}
                </span>
                {potentialSavings > 0 && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                    Saves you {formatPrice(potentialSavings)} vs highest retailer
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed max-w-3xl">
                {bestStoreReason}
              </p>

              {/* Best store highlight badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {bestStoreObj.specialOffer && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                    <Gift className="w-3 h-3 text-amber-400" />
                    {bestStoreObj.specialOffer}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  {bestStoreObj.returnPolicy || '30-day returns'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  {bestStoreObj.warrantyInfo || 'Standard manufacturer warranty'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                  <Truck className="w-3 h-3 text-emerald-400" />
                  {bestStoreObj.shippingInfo}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start lg:items-end justify-center">
              <a
                href={bestStoreProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] cursor-pointer"
              >
                <span>View Product on {bestStoreObj.platform}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-zinc-400 mt-1.5 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Direct deep search to product page
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Summary Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-zinc-900/90 border border-emerald-800/60 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Lowest In-Stock
          </span>
          <span className="text-xl font-black text-emerald-300 block mt-0.5">
            {formatPrice(pricing.lowestPrice)}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5">
            at {pricing.bestStore}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Market Average
          </span>
          <span className="text-xl font-black text-white block mt-0.5">
            {formatPrice(pricing.averagePrice)}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-0.5">Across {pricing.stores.length} platforms</span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/30 to-zinc-900/90 border border-amber-800/50 shadow-sm">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Potential Savings
          </span>
          <span className="text-xl font-black text-amber-300 block mt-0.5">
            {formatPrice(potentialSavings)}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-0.5">Compared to highest store</span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/30 to-zinc-900/90 border border-purple-800/50 shadow-sm">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
            Buy / Wait Verdict
          </span>
          <span className="text-xs font-bold text-purple-200 block mt-1 leading-snug">
            {pricing.priceRecommendation}
          </span>
        </div>
      </div>

      {/* Market Insight Note */}
      {pricing.marketInsight && (
        <div className="text-xs bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800/90 text-zinc-300 flex items-start gap-2.5">
          <Tag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-100">Pricing &amp; Refresh Cycle Insight: </span>
            {pricing.marketInsight}
          </div>
        </div>
      )}

      {/* All Retailers Comparison Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            All Retailer Offers &amp; Store Policies
          </h4>
          <span className="text-[11px] text-zinc-500">
            Sorted by net value &amp; consumer protection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricing.stores.map((store, i) => {
            const isBest = store.platform.toLowerCase() === pricing.bestStore?.toLowerCase() || store.isLowestPrice;
            const storeProductUrl = resolveProductStoreUrl(
              store.storeUrl,
              store.platform,
              fullProductName,
              country?.countryCode
            );

            return (
              <div
                key={i}
                className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                  isBest
                    ? 'bg-gradient-to-b from-emerald-950/30 via-zinc-900/90 to-zinc-950/95 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-900/80 hover:bg-zinc-900/95 border-zinc-800 hover:border-zinc-700 shadow-sm'
                }`}
              >
                <div>
                  {/* Retailer Name & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-white">
                      {store.platform}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {store.isLowestPrice && (
                        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-700/80">
                          Lowest Price
                        </span>
                      )}
                      {store.dealBadge && !store.isLowestPrice && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/80">
                          {store.dealBadge}
                        </span>
                      )}
                      {store.perksBadge && (
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/80">
                          {store.perksBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-white">
                      {currency}{store.price.toFixed(2)}
                    </span>
                    {store.originalPrice && store.originalPrice > store.price && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-500 line-through">
                          {currency}{store.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          ({Math.round(((store.originalPrice - store.price) / store.originalPrice) * 100)}% OFF)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Special Offer Highlight if available */}
                  {store.specialOffer && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{store.specialOffer}</span>
                    </div>
                  )}

                  {/* Store Details: Stock, Shipping, Return, Warranty */}
                  <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          store.inStock ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      <span className="font-semibold text-zinc-200">
                        {store.inStock ? 'In Stock & Ready to Ship' : 'Low Stock / Backorder'}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{store.condition}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{store.shippingInfo}</span>
                    </div>

                    {store.returnPolicy && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Returns: {store.returnPolicy}</span>
                      </div>
                    )}

                    {store.warrantyInfo && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Warranty: {store.warrantyInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visit Retailer Link */}
                <a
                  href={storeProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isBest
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80'
                  }`}
                >
                  <span>View Product on {store.platform}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded Live Search Results Modal/Drawer if fetched */}
      {groundedResults && (
        <div className="mt-4 p-5 rounded-2xl bg-[#0a0c10] text-zinc-100 border border-amber-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Live Google Search Grounding Analysis
            </span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">Real-time Retail Web Query</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
            {groundedResults.summary}
          </p>
          {groundedResults.sources.length > 0 && (
            <div className="pt-3 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-2">Verified Retail Sources:</span>
              <div className="flex flex-wrap gap-2">
                {groundedResults.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-700 transition-colors"
                  >
                    <span>{src.title || 'Source'}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

