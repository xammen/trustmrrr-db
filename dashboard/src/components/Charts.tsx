"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import type { Database, Startup } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

const CHART_COLORS = ["#333", "#3a3a3a", "#444", "#4a4a4a", "#555", "#5a5a5a", "#666", "#6a6a6a", "#777", "#888"];

type ChartView = "categories" | "countries" | "distribution" | "scatter";

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border rounded-sm px-2 py-1.5 text-[0.65rem]" style={{ background: "#111" }}>
      <div className="text-text-secondary mb-0.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-text-primary">
          {p.name === "mrr" || p.name === "totalMRR"
            ? formatCurrency(p.value, true)
            : formatNumber(p.value)}
        </div>
      ))}
    </div>
  );
}

function CategoriesChart({ db }: { db: Database }) {
  const data = useMemo(() => {
    return Object.entries(db.summary.categoriesBreakdown)
      .slice(0, 12)
      .map(([name, val]) => ({
        name: name.length > 14 ? name.slice(0, 12) + "…" : name,
        totalMRR: val.totalMRR,
        count: val.count,
      }));
  }, [db]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#555" }}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#444" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={50}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "#151515" }} />
        <Bar dataKey="totalMRR" name="mrr" radius={[2, 2, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CountriesChart({ db }: { db: Database }) {
  const data = useMemo(() => {
    return Object.entries(db.summary.countryBreakdown)
      .filter(([k]) => k !== "Unknown")
      .slice(0, 15)
      .map(([code, val]) => ({
        name: code,
        totalMRR: val.totalMRR,
        count: val.count,
      }));
  }, [db]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#555" }}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#444" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={50}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "#151515" }} />
        <Bar dataKey="totalMRR" name="mrr" radius={[2, 2, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistributionChart({ startups }: { startups: Startup[] }) {
  const data = useMemo(() => {
    const buckets = [
      { name: "$0", min: 0, max: 0 },
      { name: "$1-100", min: 1, max: 100 },
      { name: "$100-500", min: 100, max: 500 },
      { name: "$500-1K", min: 500, max: 1000 },
      { name: "$1K-5K", min: 1000, max: 5000 },
      { name: "$5K-10K", min: 5000, max: 10000 },
      { name: "$10K-50K", min: 10000, max: 50000 },
      { name: "$50K-100K", min: 50000, max: 100000 },
      { name: "$100K+", min: 100000, max: Infinity },
    ];

    return buckets.map((b) => ({
      name: b.name,
      count: startups.filter((s) => {
        const m = s.mrr || 0;
        return m >= b.min && (b.max === Infinity ? true : m < b.max);
      }).length,
    }));
  }, [startups]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 8, fill: "#555" }}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          angle={-20}
          textAnchor="end"
          height={45}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#444" }}
          tickLine={false}
          axisLine={false}
          width={35}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "#151515" }} />
        <Bar dataKey="count" name="startups" radius={[2, 2, 0, 0]} fill="#555" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ScatterPlot({ startups }: { startups: Startup[] }) {
  const data = useMemo(() => {
    return startups
      .filter((s) => s.mrr && s.mrr > 0 && s.totalRevenue && s.totalRevenue > 0)
      .map((s) => ({
        name: s.name || s.slug,
        mrr: s.mrr!,
        revenue: s.totalRevenue!,
        subs: s.activeSubscriptions || 1,
      }))
      .slice(0, 300);
  }, [startups]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="mrr"
          name="MRR"
          tick={{ fontSize: 9, fill: "#444" }}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          tickFormatter={(v) => formatCurrency(v, true)}
          scale="log"
          domain={["auto", "auto"]}
        />
        <YAxis
          dataKey="revenue"
          name="Revenue"
          tick={{ fontSize: 9, fill: "#444" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCurrency(v, true)}
          scale="log"
          domain={["auto", "auto"]}
          width={55}
        />
        <ZAxis dataKey="subs" range={[20, 400]} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="border border-border rounded-sm px-2 py-1.5 text-[0.65rem]" style={{ background: "#111" }}>
                <div className="text-text-secondary mb-0.5">{d.name}</div>
                <div className="text-text-primary">MRR: {formatCurrency(d.mrr, true)}</div>
                <div className="text-text-primary">Rev: {formatCurrency(d.revenue, true)}</div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#555" opacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function Charts({ db }: { db: Database }) {
  const [view, setView] = useState<ChartView>("categories");

  const tabs: { key: ChartView; label: string }[] = [
    { key: "categories", label: "by category" },
    { key: "countries", label: "by country" },
    { key: "distribution", label: "mrr distribution" },
    { key: "scatter", label: "mrr vs revenue" },
  ];

  return (
    <div
      className="border border-border rounded-sm animate-fade-in"
      style={{ background: "#0e0e0e", animationDelay: "350ms", animationFillMode: "backwards" }}
    >
      {/* tabs */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-3 py-2 text-[0.65rem] transition-colors whitespace-nowrap cursor-pointer ${
              view === tab.key
                ? "text-text-secondary border-b border-text-muted"
                : "text-text-dim hover:text-text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className="p-3">
        {view === "categories" && <CategoriesChart db={db} />}
        {view === "countries" && <CountriesChart db={db} />}
        {view === "distribution" && <DistributionChart startups={db.startups} />}
        {view === "scatter" && <ScatterPlot startups={db.startups} />}
      </div>
    </div>
  );
}
