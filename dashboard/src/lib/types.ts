export interface Startup {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  url: string;
  website?: string;
  status?: string;
  country?: string;
  foundedDate?: string;
  totalRevenue?: number;
  mrr?: number;
  last30DaysRevenue?: number;
  estimatedARR?: number;
  profitMarginLast30Days?: number;
  growth30d?: number;
  mrrGrowth30d?: number;
  rank?: number;
  customerCount?: number;
  activeSubscriptions?: number;
  revenuePerCustomer?: number;
  avgRevenuePerSubscription?: number;
  systemCategory?: string;
  systemCategorySlug?: string;
  userCategory?: string;
  userCategorySlug?: string;
  mcc?: string;
  tags?: string[];
  founderName?: string;
  founderTwitter?: string;
  founderFollowers?: number;
  lookingForCofounder?: boolean;
  paymentProvider?: string;
  apiKeyExpired?: boolean;
  isMerchantOfRecord?: boolean;
  revenueLastSyncedAt?: string;
  mrrLastSyncedAt?: string;
  onSale?: boolean;
  askingPrice?: number;
  askingPriceHistory?: number[];
  revenueMultiple?: number;
  mrrMultiple?: number;
  acquireScore?: number;
  sellerMessage?: string;
  firstListedForSaleAt?: string;
  valueProposition?: string;
  problemSolved?: string;
  pricingModel?: string;
  targetPersona?: string;
  businessType?: string;
  fundingStatus?: string;
  brandingPrimaryColor?: string;
  brandingSecondaryColor?: string;
  iconUrl?: string;
  stealthMode?: boolean;
  listingTier?: string;
  createdAt?: string;
  updatedAt?: string;
  trustmrrRank: number;
}

export interface DatabaseSummary {
  totalMRR: number;
  totalRevenue: number;
  totalCustomers: number;
  totalSubscriptions: number;
  startupsWithMRR: number;
  startupsWithRevenue: number;
  startupsForSale: number;
  avgMRR: number;
  medianMRR: number;
}

export interface Database {
  metadata: {
    source: string;
    scrapedAt: string;
    cleanedAt: string;
    totalStartups: number;
    removedFakeEntries: number;
  };
  summary: DatabaseSummary & {
    categoriesBreakdown: Record<string, { count: number; totalMRR: number; avgMRR: number; startups: string[] }>;
    paymentProviders: Record<string, number>;
    businessTypes: Record<string, number>;
    pricingModels: Record<string, number>;
    forSaleBreakdown: {
      total: number;
      withAskingPrice: number;
      totalAskingValue: number;
      totalMRRForSale: number;
      avgRevenueMultiple: number | null;
      medianRevenueMultiple: number | null;
      priceRange: { min: number; max: number };
      listings: Array<{
        name: string;
        slug: string;
        mrr: number;
        askingPrice: number | null;
        revenueMultiple: number | null;
        mrrMultiple: number | null;
        category: string;
        sellerMessage: string | null;
      }>;
    };
    countryBreakdown: Record<string, { count: number; totalMRR: number }>;
    topStartupsByMRR: Array<{
      rank: number;
      name: string;
      mrr: number;
      estimatedARR: number;
      category: string;
      growth30d: number;
      onSale: boolean;
      askingPrice: number | null;
    }>;
  };
  startups: Startup[];
}

export type SortField = 'mrr' | 'totalRevenue' | 'growth30d' | 'customerCount' | 'activeSubscriptions' | 'askingPrice' | 'revenueMultiple' | 'name' | 'trustmrrRank';
export type SortDirection = 'asc' | 'desc';

export interface Filters {
  search: string;
  category: string;
  country: string;
  forSale: 'all' | 'yes' | 'no';
  mrrMin: string;
  mrrMax: string;
  paymentProvider: string;
  businessType: string;
  sortField: SortField;
  sortDirection: SortDirection;
}
