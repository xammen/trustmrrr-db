"use client";

import { useState } from "react";
import type { Startup, SortField, Filters } from "@/lib/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getGrowthColor,
  getCountryFlag,
} from "@/lib/format";
import { StartupDetail } from "./StartupDetail";

interface StartupTableProps {
  startups: Startup[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  toggleSort: (field: SortField) => void;
  filters: Filters;
}

function SortHeader({
  label,
  field,
  currentField,
  currentDir,
  onClick,
  align = "right",
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: string;
  onClick: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const active = currentField === field;
  return (
    <th
      className={`px-3 py-2.5 text-[0.6rem] uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-text-secondary ${
        align === "right" ? "text-right" : "text-left"
      } ${active ? "text-text-secondary" : "text-text-muted"}`}
      onClick={() => onClick(field)}
    >
      <span className="inline-flex items-center gap-1">
        {align === "right" && active && (
          <span className="text-[0.5rem]">
            {currentDir === "desc" ? "▼" : "▲"}
          </span>
        )}
        {label}
        {align === "left" && active && (
          <span className="text-[0.5rem]">
            {currentDir === "desc" ? "▼" : "▲"}
          </span>
        )}
      </span>
    </th>
  );
}

export function StartupTable({
  startups,
  page,
  setPage,
  pageSize,
  toggleSort,
  filters,
}: StartupTableProps) {
  const [selected, setSelected] = useState<Startup | null>(null);

  const totalPages = Math.ceil(startups.length / pageSize);
  const visible = startups.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div
        className="border border-border rounded-sm overflow-hidden animate-fade-in"
        style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[0.75rem]">
            <thead>
              <tr className="border-b border-border" style={{ background: "#0c0c0c" }}>
                <th className="px-3 py-2.5 text-[0.6rem] text-text-muted uppercase tracking-wider text-left w-8">
                  #
                </th>
                <SortHeader
                  label="startup"
                  field="name"
                  currentField={filters.sortField}
                  currentDir={filters.sortDirection}
                  onClick={toggleSort}
                  align="left"
                />
                <SortHeader
                  label="mrr"
                  field="mrr"
                  currentField={filters.sortField}
                  currentDir={filters.sortDirection}
                  onClick={toggleSort}
                />
                <SortHeader
                  label="revenue"
                  field="totalRevenue"
                  currentField={filters.sortField}
                  currentDir={filters.sortDirection}
                  onClick={toggleSort}
                />
                <SortHeader
                  label="growth"
                  field="growth30d"
                  currentField={filters.sortField}
                  currentDir={filters.sortDirection}
                  onClick={toggleSort}
                />
                <SortHeader
                  label="subs"
                  field="activeSubscriptions"
                  currentField={filters.sortField}
                  currentDir={filters.sortDirection}
                  onClick={toggleSort}
                />
                <th className="px-3 py-2.5 text-[0.6rem] text-text-muted uppercase tracking-wider text-right">
                  category
                </th>
                <th className="px-3 py-2.5 text-[0.6rem] text-text-muted uppercase tracking-wider text-right">
                  sale
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, i) => {
                const rank = (page - 1) * pageSize + i + 1;
                const cat = s.userCategory || s.systemCategory || "";
                return (
                  <tr
                    key={s._id || s.slug}
                    className="table-row border-b border-border/50 cursor-pointer"
                    onClick={() => setSelected(s)}
                  >
                    <td className="px-3 py-2 text-text-dim text-[0.65rem]">
                      {rank}
                    </td>
                    <td className="px-3 py-2 text-left max-w-[200px]">
                      <div className="flex items-center gap-2">
                        {s.country && (
                          <span className="text-[0.7rem] shrink-0">
                            {getCountryFlag(s.country)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="text-text-primary truncate text-[0.75rem]">
                            {s.name || s.slug}
                          </div>
                          {s.founderName && (
                            <div className="text-[0.6rem] text-text-dim truncate">
                              {s.founderName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-normal text-text-primary tabular-nums">
                      {s.mrr ? formatCurrency(s.mrr, true) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-text-secondary tabular-nums">
                      {s.totalRevenue ? formatCurrency(s.totalRevenue, true) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${getGrowthColor(s.growth30d)}`}>
                      {s.growth30d !== undefined && s.growth30d !== null
                        ? formatPercent(s.growth30d)
                        : <span className="text-text-dim">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-text-secondary tabular-nums">
                      {s.activeSubscriptions
                        ? formatNumber(s.activeSubscriptions, true)
                        : <span className="text-text-dim">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {cat && (
                        <span className="pill text-[0.6rem]">{cat}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {s.onSale && (
                        <span className="for-sale-tag">
                          {s.askingPrice
                            ? formatCurrency(s.askingPrice, true)
                            : "listed"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border" style={{ background: "#0c0c0c" }}>
            <div className="text-[0.65rem] text-text-dim">
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, startups.length)} of{" "}
              {startups.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-[0.7rem] text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed border border-border rounded-sm transition-colors cursor-pointer"
              >
                prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-[0.65rem] rounded-sm border transition-colors cursor-pointer ${
                      p === page
                        ? "border-border-hover text-text-primary bg-bg-card"
                        : "border-transparent text-text-dim hover:text-text-secondary"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-[0.7rem] text-text-muted hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed border border-border rounded-sm transition-colors cursor-pointer"
              >
                next
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <StartupDetail startup={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
