/**
 * TrustMRR Full Scraper
 * Scrapes every startup listing from trustmrr.com
 * Extracts full data from RSC flight payloads embedded in HTML
 */

import { writeFileSync } from 'fs';

const BASE_URL = 'https://trustmrr.com';
const DELAY_MS = 800; // polite delay between requests

// ─── STEP 1: Extract all startup slugs from homepage ───
async function getAllSlugs() {
  console.log('[1/3] Fetching homepage to extract all startup slugs...');
  const res = await fetch(BASE_URL);
  const html = await res.text();
  
  // Extract slugs from /startup/{slug} links
  const slugRegex = /\/startup\/([a-z0-9-]+)/g;
  const slugs = new Set();
  let match;
  while ((match = slugRegex.exec(html)) !== null) {
    // Filter out obvious non-startup paths
    if (!['%5Bslug%5D'].includes(match[1])) {
      slugs.add(match[1]);
    }
  }
  
  console.log(`   Found ${slugs.size} unique startup slugs`);
  return [...slugs];
}

// ─── STEP 2: Parse RSC flight payload from HTML ───
function parseRSCPayload(html, slug) {
  const startup = {};
  
  // The RSC data is in self.__next_f.push() calls - DON'T unescape, work with raw strings
  // because the escaping is consistent and we can match against escaped patterns
  const rscChunks = [];
  const pushRegex = /self\.__next_f\.push\(\[1,"([^]*?)"\]\)/g;
  let m;
  while ((m = pushRegex.exec(html)) !== null) {
    rscChunks.push(m[1]);
  }
  
  // Also search raw HTML - the data is embedded there too
  const fullPayload = rscChunks.join('\n');
  // Use both raw HTML and RSC payload for matching
  const searchText = html;
  
  // Helper to extract field with escaped quotes (RSC format uses \" inside strings)
  function extractStr(field) {
    // Try multiple patterns: escaped quotes and normal quotes
    const patterns = [
      new RegExp(`"${field}":"([^"]*?)"`, 'i'),        // in raw HTML attributes
      new RegExp(`\\\\"${field}\\\\":\\\\"([^\\\\]*?)\\\\"`, 'i'),  // RSC escaped
      new RegExp(`"${field}":"([^"]*?)"`, 'i'),
    ];
    for (const pat of patterns) {
      const match = searchText.match(pat);
      if (match) return match[1];
    }
    return null;
  }
  
  function extractNum(field) {
    // Match field:number in both escaped and unescaped contexts
    const patterns = [
      new RegExp(`"${field}":([-\\d.]+)`),
      new RegExp(`\\\\"${field}\\\\":([-\\d.]+)`),
    ];
    for (const pat of patterns) {
      const match = searchText.match(pat);
      if (match) return parseFloat(match[1]);
    }
    return null;
  }
  
  function extractInt(field) {
    const val = extractNum(field);
    return val !== null ? Math.round(val) : null;
  }
  
  function extractBool(field) {
    const patterns = [
      new RegExp(`"${field}":(true|false)`),
      new RegExp(`\\\\"${field}\\\\":(true|false)`),
    ];
    for (const pat of patterns) {
      const match = searchText.match(pat);
      if (match) return match[1] === 'true';
    }
    return null;
  }
  
  // ─── IDENTITY ───
  const idMatch = searchText.match(/"_id":"([a-f0-9]{24})"/);
  if (!idMatch) {
    const idMatch2 = searchText.match(/\\"_id\\":\\"([a-f0-9]{24})\\"/);
    if (idMatch2) startup._id = idMatch2[1];
  } else {
    startup._id = idMatch[1];
  }
  
  // Name - from og:title
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  if (titleMatch) {
    const titleParts = titleMatch[1].split(' - ');
    startup.name = titleParts[0].trim();
  }
  
  startup.slug = slug;
  
  // Description from og:description
  const descMatch = html.match(/<meta property="og:description" content="([^"]*?)"/);
  if (descMatch) startup.description = descMatch[1]
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  
  startup.url = `${BASE_URL}/startup/${slug}`;
  
  // Website - try multiple patterns
  const webMatch = searchText.match(/\\"website\\":\\"(https?:[^\\]+)\\"/);
  if (webMatch) startup.website = webMatch[1].replace(/\\u002F/g, '/');
  else {
    const webMatch2 = searchText.match(/"website":"(https?:\/\/[^"]+)"/);
    if (webMatch2) startup.website = webMatch2[1];
  }
  
  // Status
  const status = extractStr('status');
  if (status && ['active', 'inactive', 'paused'].includes(status)) startup.status = status;
  
  // Country  
  const countryMatch = searchText.match(/\\"country\\":\\"([A-Z]{2})\\"/);
  if (countryMatch) startup.country = countryMatch[1];
  else {
    const cm2 = searchText.match(/"country":"([A-Z]{2})"/);
    if (cm2) startup.country = cm2[1];
  }
  
  // Founded date
  const founded = extractStr('foundedDate');
  if (founded) startup.foundedDate = founded;
  
  // ─── REVENUE DATA (case-sensitive: currentMrr not currentMRR) ───
  const totalRev = extractNum('currentTotalRevenue');
  if (totalRev !== null) startup.totalRevenue = totalRev;
  
  // Try both casings for MRR
  let mrr = extractNum('currentMrr');
  if (mrr === null) mrr = extractNum('currentMRR');
  if (mrr !== null) startup.mrr = mrr;
  
  const last30d = extractNum('currentLast30DaysRevenue');
  if (last30d !== null) startup.last30DaysRevenue = last30d;
  
  // Customer count - try both casings
  let custCount = extractInt('currentCustomerCount');
  if (custCount === null) custCount = extractInt('customerCount');
  if (custCount !== null) startup.customerCount = custCount;
  
  // Active subscriptions
  let activeSubs = extractInt('currentActiveSubscriptions');
  if (activeSubs === null) activeSubs = extractInt('activeSubscriptions');
  if (activeSubs !== null) startup.activeSubscriptions = activeSubs;
  
  // Profit margin
  const profitMargin = extractNum('profitMarginLast30Days');
  if (profitMargin !== null) startup.profitMarginLast30Days = profitMargin;
  
  // ─── GROWTH ───
  const growth30d = extractNum('cachedGrowth30d');
  if (growth30d !== null) startup.growth30d = Math.round(growth30d * 100) / 100;
  
  const mrrGrowth = extractNum('cachedGrowthMRR30d');
  if (mrrGrowth !== null) startup.mrrGrowth30d = Math.round(mrrGrowth * 100) / 100;
  
  // ─── RANK ───
  const rank = extractInt('rank');
  if (rank !== null) startup.rank = rank;
  
  // ─── CATEGORY ───
  // MCC
  const mcc = extractStr('mcc');
  if (mcc) startup.mcc = mcc;
  
  const sysCat = extractStr('category');
  if (sysCat && sysCat.length > 1 && sysCat.length < 50) startup.systemCategory = sysCat;
  
  const sysCatSlug = extractStr('categorySlug');
  if (sysCatSlug) startup.systemCategorySlug = sysCatSlug;
  
  const userCat = extractStr('userCategory');
  if (userCat) startup.userCategory = userCat;
  
  const userCatSlug = extractStr('userCategorySlug');
  if (userCatSlug) startup.userCategorySlug = userCatSlug;
  
  // AI Tags - look for tags array in escaped context
  const tagsMatch = searchText.match(/\\"tags\\":\[([^\]]*?)\]/);
  if (tagsMatch && tagsMatch[1]) {
    const tagValues = tagsMatch[1].match(/\\"([a-z0-9-]+)\\"/g);
    if (tagValues) startup.tags = tagValues.map(t => t.replace(/\\"/g, ''));
  }
  if (!startup.tags) {
    const tagsMatch2 = searchText.match(/"tags":\[([^\]]*?)\]/);
    if (tagsMatch2 && tagsMatch2[1]) {
      const tagValues = tagsMatch2[1].match(/"([a-z0-9-]+)"/g);
      if (tagValues) startup.tags = tagValues.map(t => t.replace(/"/g, ''));
    }
  }
  
  // ─── FOUNDER ───
  const founderName = extractStr('xFounderName');
  if (founderName) startup.founderName = founderName;
  
  const xHandle = extractStr('xHandle');
  if (xHandle) startup.founderTwitter = xHandle;
  
  const followers = extractInt('xFollowerCount');
  if (followers !== null) startup.founderFollowers = followers;
  
  const lookingCo = extractBool('lookingForCofounder');
  if (lookingCo !== null) startup.lookingForCofounder = lookingCo;
  
  // ─── PAYMENT / VERIFICATION ───
  const provider = extractStr('paymentProvider');
  if (provider) startup.paymentProvider = provider;
  
  const apiExpired = extractBool('apiKeyExpired');
  if (apiExpired !== null) startup.apiKeyExpired = apiExpired;
  
  const mor = extractBool('isMerchantOfRecord');
  if (mor !== null) startup.isMerchantOfRecord = mor;
  
  const revSync = extractStr('revenueLastSyncedAt');
  if (revSync) startup.revenueLastSyncedAt = revSync;
  
  const mrrSync = extractStr('mrrLastSyncedAt');
  if (mrrSync) startup.mrrLastSyncedAt = mrrSync;
  
  // ─── FOR SALE / ACQUISITION ───
  const onSale = extractBool('onSale');
  if (onSale !== null) startup.onSale = onSale;
  
  if (startup.onSale) {
    // Asking price - extract from askingPriceHistory
    const priceRegex = /\\"price\\":(\d+)/g;
    const prices = [];
    let pm;
    while ((pm = priceRegex.exec(searchText)) !== null) {
      prices.push(parseInt(pm[1]));
    }
    if (prices.length === 0) {
      const priceRegex2 = /"price":(\d+)/g;
      while ((pm = priceRegex2.exec(searchText)) !== null) {
        prices.push(parseInt(pm[1]));
      }
    }
    if (prices.length > 0) {
      startup.askingPrice = prices[prices.length - 1];
      startup.askingPriceHistory = prices;
    }
    
    const revMultiple = extractNum('cachedAcquireRevenueMultiple');
    if (revMultiple !== null) startup.revenueMultiple = Math.round(revMultiple * 100) / 100;
    
    const acquireScore = extractNum('cachedAcquireScore');
    if (acquireScore !== null) startup.acquireScore = Math.round(acquireScore * 1000) / 1000;
    
    const sellerMsg = extractStr('sellerMessage');
    if (sellerMsg) startup.sellerMessage = sellerMsg;
    
    const firstListed = extractStr('firstListedForSaleAt');
    if (firstListed) startup.firstListedForSaleAt = firstListed;
  }
  
  // ─── AI ENRICHMENT ───
  const vp = extractStr('valueProposition');
  if (vp && vp !== 'Unknown') startup.valueProposition = vp;
  
  const prob = extractStr('problemSolved');
  if (prob && prob !== 'Unknown') startup.problemSolved = prob;
  
  const pricing = extractStr('pricingModel');
  if (pricing && pricing !== 'Unknown') startup.pricingModel = pricing;
  
  const persona = extractStr('targetPersona');
  if (persona && persona !== 'Unknown') startup.targetPersona = persona;
  
  const bizType = extractStr('businessType');
  if (bizType && bizType !== 'Unknown') startup.businessType = bizType;
  
  const funding = extractStr('fundingStatus');
  if (funding && funding !== 'Unknown') startup.fundingStatus = funding;
  
  // ─── DATES ───
  const created = extractStr('createdAt');
  if (created) startup.createdAt = created;
  
  const updated = extractStr('updatedAt');
  if (updated) startup.updatedAt = updated;
  
  // ─── BRANDING ───
  const primaryColor = extractStr('primaryColor');
  if (primaryColor) startup.brandingPrimaryColor = primaryColor;
  
  const secondaryColor = extractStr('secondaryColor');
  if (secondaryColor && secondaryColor !== 'null') startup.brandingSecondaryColor = secondaryColor;
  
  // Icon/Logo
  const iconPatterns = [
    /\\"icon\\":\\"(https?:[^\\]+)\\"/,
    /"icon":"(https?:\/\/[^"]+)"/,
  ];
  for (const pat of iconPatterns) {
    const match = searchText.match(pat);
    if (match) {
      startup.iconUrl = match[1].replace(/\\u002F/g, '/');
      break;
    }
  }
  
  // ─── STEALTH / VISIBILITY ───
  const stealth = extractBool('stealthMode');
  if (stealth !== null) startup.stealthMode = stealth;
  
  const tier = extractStr('listingTier');
  if (tier) startup.listingTier = tier;
  
  // ─── COMPUTED FIELDS ───
  if (startup.mrr) {
    startup.estimatedARR = Math.round(startup.mrr * 12);
  }
  
  if (startup.totalRevenue && startup.customerCount && startup.customerCount > 0) {
    startup.revenuePerCustomer = Math.round((startup.totalRevenue / startup.customerCount) * 100) / 100;
  }
  
  if (startup.last30DaysRevenue && startup.activeSubscriptions && startup.activeSubscriptions > 0) {
    startup.avgRevenuePerSubscription = Math.round((startup.last30DaysRevenue / startup.activeSubscriptions) * 100) / 100;
  }
  
  // Compute revenue multiples for for-sale startups
  if (startup.onSale && startup.askingPrice && startup.estimatedARR) {
    startup.revenueMultiple = Math.round((startup.askingPrice / startup.estimatedARR) * 100) / 100;
  }
  if (startup.onSale && startup.askingPrice && startup.mrr) {
    startup.mrrMultiple = Math.round((startup.askingPrice / startup.mrr) * 100) / 100;
  }
  
  // Clean up HTML entities in description
  if (startup.description) {
    startup.description = startup.description
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\\n/g, ' ').trim();
  }
  if (startup.name) {
    startup.name = startup.name
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  }

  return startup;
}

// ─── STEP 3: Fetch and parse each startup page ───
async function scrapeStartup(slug, index, total) {
  const url = `${BASE_URL}/startup/${slug}`;
  console.log(`   [${index + 1}/${total}] Scraping ${slug}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (!res.ok) {
      console.log(`   ⚠️  ${slug}: HTTP ${res.status}`);
      return null;
    }
    
    const html = await res.text();
    const data = parseRSCPayload(html, slug);
    
    // Quick validation
    const fields = Object.keys(data).length;
    const hasRevenue = data.totalRevenue || data.mrr || data.last30DaysRevenue;
    console.log(`   ✓ ${slug}: ${fields} fields${hasRevenue ? `, MRR: $${Math.round(data.mrr || 0).toLocaleString()}` : ' (no revenue data)'}`);
    
    return data;
  } catch (err) {
    console.log(`   ✗ ${slug}: ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── MAIN ───
async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║    TrustMRR Full Database Scraper    ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  
  const startTime = Date.now();
  
  // Step 1: Get all slugs
  const slugs = await getAllSlugs();
  console.log(`\n[2/3] Scraping ${slugs.length} startup detail pages...\n`);
  
  // Step 2: Scrape each one
  const startups = [];
  let failures = 0;
  
  for (let i = 0; i < slugs.length; i++) {
    const data = await scrapeStartup(slugs[i], i, slugs.length);
    if (data) {
      startups.push(data);
    } else {
      failures++;
    }
    
    // Polite delay
    if (i < slugs.length - 1) {
      await sleep(DELAY_MS);
    }
  }
  
  // Step 3: Sort by MRR descending
  startups.sort((a, b) => (b.mrr || 0) - (a.mrr || 0));
  
  // Add rank based on sort
  startups.forEach((s, i) => {
    s.trustmrrRank = i + 1;
  });
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n[3/3] Writing JSON output...\n`);
  
  // Build final output
  const output = {
    metadata: {
      source: 'trustmrr.com',
      scrapedAt: new Date().toISOString(),
      totalStartups: startups.length,
      failedScrapes: failures,
      scrapeDurationSeconds: parseFloat(elapsed),
      dataFields: [
        'name', 'slug', 'description', 'website', 'url', 'status', 'country', 'foundedDate',
        'totalRevenue', 'mrr', 'last30DaysRevenue', 'estimatedARR', 'profitMarginLast30Days',
        'growth30d', 'mrrGrowth30d', 'rank',
        'customerCount', 'activeSubscriptions', 'revenuePerCustomer', 'avgRevenuePerSubscription',
        'systemCategory', 'userCategory', 'tags',
        'founderName', 'founderTwitter', 'founderFollowers', 'lookingForCofounder',
        'paymentProvider', 'apiKeyExpired', 'revenueLastSyncedAt',
        'onSale', 'askingPrice', 'askingPriceHistory', 'revenueMultiple', 'acquireScore', 'sellerMessage',
        'valueProposition', 'problemSolved', 'pricingModel', 'targetPersona', 'businessType', 'fundingStatus',
        'brandingPrimaryColor', 'stealthMode', 'listingTier'
      ]
    },
    summary: {
      totalMRR: startups.reduce((sum, s) => sum + (s.mrr || 0), 0),
      totalRevenue: startups.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
      totalCustomers: startups.reduce((sum, s) => sum + (s.customerCount || 0), 0),
      totalSubscriptions: startups.reduce((sum, s) => sum + (s.activeSubscriptions || 0), 0),
      startupsForSale: startups.filter(s => s.onSale).length,
      avgMRR: Math.round(startups.reduce((sum, s) => sum + (s.mrr || 0), 0) / startups.filter(s => s.mrr).length),
      medianMRR: (() => {
        const mrrs = startups.filter(s => s.mrr).map(s => s.mrr).sort((a, b) => a - b);
        const mid = Math.floor(mrrs.length / 2);
        return mrrs.length % 2 !== 0 ? Math.round(mrrs[mid]) : Math.round((mrrs[mid - 1] + mrrs[mid]) / 2);
      })(),
      categoriesBreakdown: (() => {
        const cats = {};
        startups.forEach(s => {
          const cat = s.userCategory || s.systemCategory || 'Unknown';
          if (!cats[cat]) cats[cat] = { count: 0, totalMRR: 0, startups: [] };
          cats[cat].count++;
          cats[cat].totalMRR += (s.mrr || 0);
          cats[cat].startups.push(s.name || s.slug);
        });
        return Object.entries(cats)
          .sort(([,a], [,b]) => b.totalMRR - a.totalMRR)
          .reduce((obj, [k, v]) => {
            obj[k] = { ...v, totalMRR: Math.round(v.totalMRR), avgMRR: Math.round(v.totalMRR / v.count) };
            return obj;
          }, {});
      })(),
      paymentProviders: (() => {
        const providers = {};
        startups.forEach(s => {
          const p = s.paymentProvider || 'unknown';
          providers[p] = (providers[p] || 0) + 1;
        });
        return providers;
      })(),
      businessTypes: (() => {
        const types = {};
        startups.forEach(s => {
          const t = s.businessType || 'Unknown';
          types[t] = (types[t] || 0) + 1;
        });
        return types;
      })(),
      pricingModels: (() => {
        const models = {};
        startups.forEach(s => {
          const m = s.pricingModel || 'Unknown';
          models[m] = (models[m] || 0) + 1;
        });
        return models;
      })(),
      forSaleBreakdown: (() => {
        const forSale = startups.filter(s => s.onSale);
        const withMultiples = forSale.filter(s => s.revenueMultiple);
        const multiples = withMultiples.map(s => s.revenueMultiple).sort((a, b) => a - b);
        const mid = Math.floor(multiples.length / 2);
        return {
          total: forSale.length,
          totalAskingValue: forSale.reduce((s, x) => s + (x.askingPrice || 0), 0),
          totalMRRForSale: Math.round(forSale.reduce((s, x) => s + (x.mrr || 0), 0)),
          avgRevenueMultiple: withMultiples.length > 0 ? Math.round((multiples.reduce((s, m) => s + m, 0) / multiples.length) * 100) / 100 : null,
          medianRevenueMultiple: multiples.length > 0 ? (multiples.length % 2 !== 0 ? multiples[mid] : Math.round(((multiples[mid-1] + multiples[mid]) / 2) * 100) / 100) : null,
          priceRange: {
            min: forSale.length > 0 ? Math.min(...forSale.filter(s => s.askingPrice).map(s => s.askingPrice)) : 0,
            max: forSale.length > 0 ? Math.max(...forSale.filter(s => s.askingPrice).map(s => s.askingPrice)) : 0,
          },
          categoriesForSale: (() => {
            const cats = {};
            forSale.forEach(s => {
              const cat = s.userCategory || s.systemCategory || 'Unknown';
              if (!cats[cat]) cats[cat] = 0;
              cats[cat]++;
            });
            return cats;
          })(),
          listings: forSale.map(s => ({
            name: s.name,
            slug: s.slug,
            mrr: Math.round(s.mrr || 0),
            askingPrice: s.askingPrice,
            revenueMultiple: s.revenueMultiple,
            mrrMultiple: s.mrrMultiple,
            category: s.userCategory || s.systemCategory || 'Unknown',
            sellerMessage: s.sellerMessage || null,
          })).sort((a, b) => (b.mrr || 0) - (a.mrr || 0)),
        };
      })(),
      countryBreakdown: (() => {
        const countries = {};
        startups.forEach(s => {
          const c = s.country || 'Unknown';
          if (!countries[c]) countries[c] = { count: 0, totalMRR: 0 };
          countries[c].count++;
          countries[c].totalMRR += (s.mrr || 0);
        });
        return Object.entries(countries)
          .sort(([,a], [,b]) => b.totalMRR - a.totalMRR)
          .reduce((obj, [k, v]) => {
            obj[k] = { ...v, totalMRR: Math.round(v.totalMRR) };
            return obj;
          }, {});
      })(),
      topStartupsByMRR: startups.slice(0, 20).map(s => ({
        rank: s.trustmrrRank,
        name: s.name,
        mrr: Math.round(s.mrr || 0),
        estimatedARR: s.estimatedARR,
        category: s.userCategory || s.systemCategory || 'Unknown',
        growth30d: s.growth30d,
        onSale: s.onSale || false,
        askingPrice: s.askingPrice || null,
      })),
    },
    startups: startups
  };
  
  // Write the output
  const jsonStr = JSON.stringify(output, null, 2);
  writeFileSync('trustmrr-database.json', jsonStr, 'utf8');
  
  const fileSizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
  
  console.log('════════════════════════════════════════');
  console.log(`✅ SCRAPE COMPLETE`);
  console.log(`   Startups scraped: ${startups.length}/${slugs.length}`);
  console.log(`   Failed: ${failures}`);
  console.log(`   Duration: ${elapsed}s`);
  console.log(`   File: trustmrr-database.json (${fileSizeMB} MB)`);
  console.log(`   Total MRR tracked: $${Math.round(output.summary.totalMRR).toLocaleString()}`);
  console.log(`   Total Revenue tracked: $${Math.round(output.summary.totalRevenue).toLocaleString()}`);
  console.log('════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
