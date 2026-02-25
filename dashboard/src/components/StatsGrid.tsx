"use client";

import { useEffect, useState } from "react";
import type { Database } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}

function StatCard({ label, value, sub, delay = 0 }: StatCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`border border-border rounded-sm p-4 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{ background: "#0e0e0e" }}
    >
      <div className="text-[0.65rem] text-text-muted uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-lg font-normal text-text-primary">{value}</div>
      {sub && (
        <div className="text-[0.7rem] text-text-muted mt-1">{sub}</div>
      )}
    </div>
  );
}

export function StatsGrid({ db }: { db: Database }) {
  const s = db.summary;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <StatCard
        label="startups"
        value={formatNumber(db.metadata.totalStartups)}
        sub={`${s.startupsWithMRR} with mrr`}
        delay={0}
      />
      <StatCard
        label="total mrr"
        value={formatCurrency(s.totalMRR, true)}
        sub={`avg ${formatCurrency(s.avgMRR, true)} / med ${formatCurrency(s.medianMRR, true)}`}
        delay={60}
      />
      <StatCard
        label="total revenue"
        value={formatCurrency(s.totalRevenue, true)}
        sub={`${s.startupsWithRevenue} reporting`}
        delay={120}
      />
      <StatCard
        label="for sale"
        value={String(s.startupsForSale)}
        sub={`${formatCurrency(s.forSaleBreakdown.totalAskingValue, true)} total`}
        delay={180}
      />
      <StatCard
        label="subscriptions"
        value={formatNumber(s.totalSubscriptions, true)}
        sub={`${formatNumber(s.totalCustomers, true)} customers`}
        delay={240}
      />
      <StatCard
        label="med. multiple"
        value={s.forSaleBreakdown.medianRevenueMultiple ? `${s.forSaleBreakdown.medianRevenueMultiple}x` : "—"}
        sub={`avg ${s.forSaleBreakdown.avgRevenueMultiple ? s.forSaleBreakdown.avgRevenueMultiple + "x" : "—"}`}
        delay={300}
      />
    </div>
  );
}
