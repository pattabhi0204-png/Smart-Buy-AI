export interface UserPreferences {
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  primaryUsage: string;
  priorityFactors: string[];
  dealbreakers: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'enthusiast';
  usageFrequency: 'occasional' | 'regular' | 'heavy_daily';
  longevityExpectation: string;
  extraNotes?: string;
}

export interface KeySpec {
  label: string;
  value: string;
  importance: 'high' | 'medium' | 'low';
}

export interface ProductSpecification {
  name: string;
  brand: string;
  model: string;
  category: string;
  summary: string;
  keySpecs: KeySpec[];
  advertisedHighlights: string[];
  confidence: number;
}

export interface SpecMatch {
  requirement: string;
  productOffers: string;
  status: 'exceeds' | 'meets' | 'falls_short' | 'neutral';
}

export interface ProConItem {
  title: string;
  explanation: string;
  matchedNeed?: string;
  impactOnUser?: string;
}

export interface HiddenGotcha {
  warning: string;
  whyItMatters: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AlternativeProduct {
  name: string;
  brand: string;
  estimatedPrice: string;
  whyBetter: string;
  keyAdvantage: string;
  matchScore?: number;
  priceDifference?: string;
  unmetNeedSolved?: string;
}

export interface ScoreBreakdown {
  featureFit: number;
  budgetFit: number;
  longevityFit: number;
  performanceFit: number;
}

export interface FitAnalysis {
  fitScore: number; // 0 - 100
  verdict: 'STRONG_MATCH' | 'MODERATE_MATCH' | 'NOT_RECOMMENDED' | 'OVERKILL' | 'UNDERPOWERED';
  verdictTitle: string;
  verdictSummary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  hiddenGotchas: HiddenGotcha[];
  specsVersusNeeds: SpecMatch[];
  longevityAssessment: string;
  valueForMoneyScore: number; // 1 - 10
  betterAlternatives: AlternativeProduct[];
  scoreBreakdown?: ScoreBreakdown;
}

export interface StorePrice {
  platform: string;
  price: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  condition: 'Brand New' | 'Certified Refurbished' | 'Open Box';
  shippingInfo: string;
  dealBadge?: string;
  storeUrl: string;
  isLowestPrice?: boolean;
  specialOffer?: string;
  returnPolicy?: string;
  warrantyInfo?: string;
  perksBadge?: string;
}

export interface PricingOverview {
  stores: StorePrice[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  bestStore: string;
  bestStoreReason?: string;
  priceRecommendation: string;
  marketInsight: string;
  priceConfidence: 'verified' | 'estimated';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CloudinaryEfficiencyMetrics {
  originalBytes: number;
  optimizedBytes: number;
  bytesSaved: number;
  percentageSaved: number;
  inferenceSpeedup: string;
  cloudTransformUrl?: string;
  detectedTags?: string[];
  activeMode: CloudinaryAiMode;
  appliedTransform: string;
}

export type CloudinaryAiMode =
  | 'optimized'      // f_auto,q_auto,c_limit
  | 'bg_removed'     // e_background_removal (studio isolation)
  | 'smart_crop'     // c_crop,g_auto:subject
  | 'enhanced'       // e_improve,e_sharpen
  | 'spec_ocr'       // e_upscale,e_sharpen (specs & label OCR clarity)
  | 'original';

export interface ProductDecisionReport {
  id: string;
  timestamp: string;
  product: ProductSpecification;
  analysis: FitAnalysis;
  pricing: PricingOverview;
  userSnapshot: UserPreferences;
  groundingSources?: GroundingSource[];
  productImage?: string;
  cloudinaryMetrics?: CloudinaryEfficiencyMetrics;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type AuthProviderType = 'google' | 'apple' | 'facebook' | 'email' | 'demo';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  authProvider: AuthProviderType;
  persona: string;
  joinedAt: string;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
}

export interface UserCountryConfig {
  countryCode: string;
  countryName: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  enabledStoreIds: string[];
}
