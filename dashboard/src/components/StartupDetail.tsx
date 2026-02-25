"use client";

import { useEffect, useCallback } from "react";
import type { Startup } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMultiple,
  getGrowthColor,
  getCountryFlag,
  timeAgo,
} from "@/lib/format";

interface Props {
  startup: Startup;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-border/30">
      <span className="text-[0.65rem] text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[0.75rem] text-text-secondary text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

export function StartupDetail({ startup: s, onClose }: Props) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [handleEsc]);

  const cat = s.userCategory || s.systemCategory;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-slow" />

      {/* panel */}
      <div
        className="relative w-full max-w-lg max-h-[75vh] overflow-y-auto border border-border rounded-sm animate-slide-up"
        style={{ background: "#0e0e0e" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-4 border-b border-border" style={{ background: "#0e0e0e" }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {s.country && (
                <span className="text-base">{getCountryFlag(s.country)}</span>
              )}
              <h2 className="text-base font-normal text-text-primary truncate">
                {s.name || s.slug}
              </h2>
              {s.onSale && <span className="for-sale-tag">for sale</span>}
            </div>
            {s.description && (
              <p className="text-[0.7rem] text-text-muted leading-relaxed line-clamp-2">
                {s.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-secondary text-lg ml-3 shrink-0 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="p-4 space-y-4">
          {/* revenue section */}
          <div>
            <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
              revenue
            </div>
            <Field label="mrr" value={formatCurrency(s.mrr)} />
            <Field label="estimated arr" value={formatCurrency(s.estimatedARR)} />
            <Field label="total revenue" value={formatCurrency(s.totalRevenue)} />
            <Field label="last 30 days" value={formatCurrency(s.last30DaysRevenue)} />
            <Field
              label="profit margin"
              value={
                s.profitMarginLast30Days !== undefined
                  ? `${s.profitMarginLast30Days}%`
                  : undefined
              }
            />
            <Field
              label="30d growth"
              value={
                s.growth30d !== undefined ? (
                  <span className={getGrowthColor(s.growth30d)}>
                    {formatPercent(s.growth30d)}
                  </span>
                ) : undefined
              }
            />
            <Field
              label="mrr growth"
              value={
                s.mrrGrowth30d !== undefined ? (
                  <span className={getGrowthColor(s.mrrGrowth30d)}>
                    {formatPercent(s.mrrGrowth30d)}
                  </span>
                ) : undefined
              }
            />
          </div>

          {/* customers */}
          <div>
            <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
              customers
            </div>
            <Field label="customers" value={formatNumber(s.customerCount)} />
            <Field label="active subs" value={formatNumber(s.activeSubscriptions)} />
            <Field label="rev/customer" value={formatCurrency(s.revenuePerCustomer)} />
            <Field label="arps" value={formatCurrency(s.avgRevenuePerSubscription)} />
          </div>

          {/* acquisition */}
          {s.onSale && (
            <div>
              <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
                acquisition
              </div>
              <Field label="asking price" value={formatCurrency(s.askingPrice)} />
              <Field label="revenue multiple" value={formatMultiple(s.revenueMultiple)} />
              <Field label="mrr multiple" value={formatMultiple(s.mrrMultiple)} />
              <Field
                label="acquire score"
                value={s.acquireScore?.toFixed(2)}
              />
              {s.sellerMessage && (
                <div className="mt-2 p-2 border border-border/50 rounded-sm">
                  <div className="text-[0.6rem] text-text-dim uppercase tracking-wider mb-1">
                    seller message
                  </div>
                  <p className="text-[0.7rem] text-text-secondary leading-relaxed">
                    {s.sellerMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* details */}
          <div>
            <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
              details
            </div>
            <Field label="category" value={cat} />
            <Field label="rank" value={s.rank ? `#${s.rank}` : undefined} />
            <Field label="payment" value={s.paymentProvider} />
            <Field label="business type" value={s.businessType} />
            <Field label="pricing" value={s.pricingModel} />
            <Field label="target" value={s.targetPersona} />
            <Field label="funding" value={s.fundingStatus} />
            <Field label="tier" value={s.listingTier} />
            {s.tags && s.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {s.tags.map((t) => (
                  <span key={t} className="pill text-[0.6rem]">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* founder */}
          {s.founderName && (
            <div>
              <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
                founder
              </div>
              <Field label="name" value={s.founderName} />
              {s.founderTwitter && (
                <Field
                  label="twitter"
                  value={
                    <a
                      href={`https://x.com/${s.founderTwitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary transition-colors underline decoration-border-hover"
                    >
                      @{s.founderTwitter}
                    </a>
                  }
                />
              )}
              <Field
                label="followers"
                value={
                  s.founderFollowers
                    ? formatNumber(s.founderFollowers, true)
                    : undefined
                }
              />
              {s.lookingForCofounder && (
                <div className="mt-1">
                  <span className="pill pill-amber text-[0.6rem]">
                    looking for cofounder
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ai insights */}
          {(s.valueProposition || s.problemSolved) && (
            <div>
              <div className="text-[0.6rem] text-text-dim uppercase tracking-widest mb-2">
                insights
              </div>
              {s.valueProposition && (
                <div className="mb-2">
                  <div className="text-[0.6rem] text-text-dim mb-0.5">
                    value prop
                  </div>
                  <p className="text-[0.7rem] text-text-secondary leading-relaxed">
                    {s.valueProposition}
                  </p>
                </div>
              )}
              {s.problemSolved && (
                <div>
                  <div className="text-[0.6rem] text-text-dim mb-0.5">
                    problem solved
                  </div>
                  <p className="text-[0.7rem] text-text-secondary leading-relaxed">
                    {s.problemSolved}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* meta */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex gap-3 text-[0.6rem] text-text-dim">
              {s.revenueLastSyncedAt && (
                <span>synced {timeAgo(s.revenueLastSyncedAt)}</span>
              )}
              {s.apiKeyExpired && (
                <span className="text-amber">api expired</span>
              )}
            </div>
            <div className="flex gap-2">
              {s.website && (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] text-text-muted hover:text-text-secondary border border-border rounded-sm px-2 py-1 transition-colors"
                >
                  website
                </a>
              )}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.65rem] text-text-muted hover:text-text-secondary border border-border rounded-sm px-2 py-1 transition-colors"
              >
                trustmrr
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
