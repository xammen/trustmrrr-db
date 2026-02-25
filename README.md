# ✩°｡⋆⸜ trustmrrr ⸝⋆｡°✩

**986 startups. every mrr. every revenue. scraped, verified, searchable.**

a dark, minimal dashboard for exploring the entire [trustmrr.com](https://trustmrr.com) database.
find deals, spot growth, track risk — all in one place ˚ʚ♡ɞ˚

```
                    ┌───────────────────┐
   986 startups ──► │  ༼ つ ╹ ╹ ༽つ      │  ──►  deal radar
                    │    trustmrrr      │  ──►  growth tracking
                    └───────────────────┘  ──►  risk signals
```

## ✦ what is this?

trustmrr has great data but no way to explore it all at once.
we scraped every single startup, built a dashboard, and made it searchable.

- **986 startups** with full MRR, revenue, subscribers, growth data
- **deal radar** — for-sale startups ranked by deal score (revenue multiple × stability × growth)
- **fastest growing** — top 20 startups by 30-day growth
- **at risk** — declining startups with danger signals
- **cofounders** — startups looking for a cofounder
- **whale risk** — flags startups where one customer = most of the revenue
- **deal map** — MRR vs asking price scatter, color-coded by median multiple
- **export** — CSV or JSON, filtered or full

## ✦ screenshots

> dark mode. monospace. hiii.boo aesthetic.

## ✦ stack

```
next.js 16        ──  app router, static export
tailwind 4        ──  dark theme, custom tokens
recharts          ──  bar charts, scatter plots
jetbrains mono    ──  because monospace is life
```

## ✦ run locally

```bash
cd dashboard
npm install
npm run dev
```

open [localhost:3000](http://localhost:3000)

## ✦ deploy

static export — works anywhere. built for cloudflare pages.

```bash
cd dashboard && npm run build
# output in dashboard/out/
```

cloudflare pages settings:
```
build command:       cd dashboard && npm install && npm run build
output directory:    dashboard/out
```

## ✦ data

the full database lives in [`trustmrr-database.json`](./trustmrr-database.json) (2.1MB).

```json
{
  "scrapedAt": "2026-02-25",
  "totalStartups": 986,
  "summary": {
    "totalMRR": 11600000,
    "totalRevenue": 1300000000,
    "forSale": 320,
    "categories": 20
  },
  "startups": [ ... ]
}
```

each startup includes: `name`, `slug`, `mrr`, `totalRevenue`, `activeSubscriptions`, `growth30d`, `askingPrice`, `onSale`, `country`, `category`, `founderName`, `lookingForCofounder`, `paymentProvider`, `businessType`, and more.

## ✦ scraper

```bash
node scraper-v2.mjs
```

discovers slugs from 26 source pages (homepage, /recent, /acquire, /stats, 20 categories, /cofounders, /open), then fetches each `/startup/{slug}` and parses the RSC flight payload. ~130 seconds for all 1032 pages.

## ✦ features

| feature | what it does |
|---|---|
| deal radar | ranks for-sale startups by deal score (lower = better deal) |
| fastest growing | top 20 by 30-day revenue growth, min $50 MRR |
| at risk | declining growth, expired APIs, crashing MRR |
| cofounders | startups actively looking for a cofounder |
| whale risk | `!!` extreme / `!` high — when ARPS/MRR ratio is dangerous |
| deal map | scatter plot: MRR vs price, green = below median multiple |
| charts | by category, by country, MRR distribution, MRR vs revenue |
| filters | search, category, country, sale status, payment, biz type, MRR range |
| export | CSV or JSON of current filtered view |

## ✦ credits

made by [xmn](https://hiii.boo) · data from [trustmrr.com](https://trustmrr.com)
