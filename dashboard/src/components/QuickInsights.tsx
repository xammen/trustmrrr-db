"use client";

import type { Database } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

export function QuickInsights({ db }: { db: Database }) {
  const s = db.summary;

  // top 5 for-sale deals (best revenue multiples)
  const bestDeals = s.forSaleBreakdown.listings
    ?.filter((l: { revenueMultiple: number | null; mrr: number }) => l.revenueMultiple && l.revenueMultiple > 0 && l.mrr > 0)
    .sort((a: { revenueMultiple: number | null }, b: { revenueMultiple: number | null }) => (a.revenueMultiple || 99) - (b.revenueMultiple || 99))
    .slice(0, 5);

  // payment providers
  const topProviders = Object.entries(s.paymentProviders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // business types
  const topBizTypes = Object.entries(s.businessTypes)
    .filter(([k]) => k !== "Unknown")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // pricing models
  const topPricing = Object.entries(s.pricingModels)
    .filter(([k]) => k !== "Unknown")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div
      className="space-y-4 animate-fade-in"
      style={{ animationDelay: "500ms", animationFillMode: "backwards" }}
    >
      {/* best deals */}
      <div className="border border-border rounded-sm p-3" style={{ background: "#0e0e0e" }}>
        <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-3">
          best deals (lowest multiple)
        </div>
        <div className="space-y-2">
          {bestDeals?.map((d: { slug: string; name: string; mrr: number; askingPrice: number | null; revenueMultiple: number | null }) => (
            <div key={d.slug} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[0.7rem] text-text-secondary truncate">
                  {d.name}
                </div>
                <div className="text-[0.6rem] text-text-dim">
                  {formatCurrency(d.mrr, true)}/mo
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-[0.7rem] text-text-primary">
                  {formatCurrency(d.askingPrice, true)}
                </div>
                <div className="text-[0.6rem] text-green">
                  {d.revenueMultiple?.toFixed(1)}x
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* payment providers */}
      <div className="border border-border rounded-sm p-3" style={{ background: "#0e0e0e" }}>
        <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-3">
          payment providers
        </div>
        <div className="space-y-1.5">
          {topProviders.map(([name, count]) => {
            const pct = ((count as number) / db.metadata.totalStartups) * 100;
            return (
              <div key={name} className="flex items-center gap-2">
                <div className="text-[0.7rem] text-text-secondary flex-1 truncate">
                  {name}
                </div>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-text-dim rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[0.6rem] text-text-dim w-8 text-right">
                  {count as number}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* business types */}
      <div className="border border-border rounded-sm p-3" style={{ background: "#0e0e0e" }}>
        <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-3">
          business types
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topBizTypes.map(([name, count]) => (
            <span key={name} className="pill text-[0.6rem]">
              {name} <span className="text-text-dim">{count as number}</span>
            </span>
          ))}
        </div>
      </div>

      {/* pricing models */}
      <div className="border border-border rounded-sm p-3" style={{ background: "#0e0e0e" }}>
        <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-3">
          pricing models
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topPricing.map(([name, count]) => (
            <span key={name} className="pill text-[0.6rem]">
              {name} <span className="text-text-dim">{count as number}</span>
            </span>
          ))}
        </div>
      </div>

      {/* scrape info */}
      <div className="text-[0.55rem] text-text-dim leading-relaxed px-1">
        scraped from trustmrr.com on{" "}
        {new Date(db.metadata.scrapedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        . {db.metadata.totalStartups} startups, {db.metadata.removedFakeEntries}{" "}
        fake entries filtered. data may not be real-time.
      </div>
    </div>
  );
}
