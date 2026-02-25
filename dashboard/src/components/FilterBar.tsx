"use client";

import type { Filters } from "@/lib/types";
import { getCountryFlag } from "@/lib/format";

interface FilterBarProps {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  categories: string[];
  countries: string[];
  providers: string[];
  businessTypes: string[];
  resultCount: number;
  totalCount: number;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (v: string) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.6rem] text-text-muted uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-input border border-border rounded-sm px-2 py-1.5 text-[0.75rem] text-text-secondary focus:outline-none focus:border-border-hover appearance-none cursor-pointer"
      >
        <option value="all">all</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {renderOption ? renderOption(opt) : opt.toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({
  filters,
  updateFilter,
  resetFilters,
  categories,
  countries,
  providers,
  businessTypes,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const hasFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.country !== "all" ||
    filters.forSale !== "all" ||
    filters.mrrMin ||
    filters.mrrMax ||
    filters.paymentProvider !== "all" ||
    filters.businessType !== "all";

  return (
    <div className="space-y-3 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
      {/* search bar */}
      <div className="relative">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="search startups, founders, tags..."
          className="w-full bg-bg-input border border-border rounded-sm px-3 py-2.5 text-[0.8rem] text-text-primary placeholder:text-text-dim focus:outline-none focus:border-border-hover"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-text-dim">
          {resultCount}/{totalCount}
        </div>
      </div>

      {/* filter row */}
      <div className="flex flex-wrap gap-3 items-end">
        <SelectField
          label="category"
          value={filters.category}
          onChange={(v) => updateFilter("category", v)}
          options={categories}
        />
        <SelectField
          label="country"
          value={filters.country}
          onChange={(v) => updateFilter("country", v)}
          options={countries}
          renderOption={(c) => `${getCountryFlag(c)} ${c}`}
        />
        <SelectField
          label="for sale"
          value={filters.forSale}
          onChange={(v) => updateFilter("forSale", v as Filters["forSale"])}
          options={["yes", "no"]}
        />
        <SelectField
          label="payment"
          value={filters.paymentProvider}
          onChange={(v) => updateFilter("paymentProvider", v)}
          options={providers}
        />
        <SelectField
          label="business"
          value={filters.businessType}
          onChange={(v) => updateFilter("businessType", v)}
          options={businessTypes}
        />

        {/* mrr range */}
        <div className="flex flex-col gap-1">
          <label className="text-[0.6rem] text-text-muted uppercase tracking-wider">
            mrr range
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={filters.mrrMin}
              onChange={(e) => updateFilter("mrrMin", e.target.value)}
              placeholder="min"
              className="w-16 bg-bg-input border border-border rounded-sm px-2 py-1.5 text-[0.75rem] text-text-secondary focus:outline-none focus:border-border-hover"
            />
            <span className="text-text-dim text-[0.7rem]">–</span>
            <input
              type="text"
              value={filters.mrrMax}
              onChange={(e) => updateFilter("mrrMax", e.target.value)}
              placeholder="max"
              className="w-16 bg-bg-input border border-border rounded-sm px-2 py-1.5 text-[0.75rem] text-text-secondary focus:outline-none focus:border-border-hover"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-[0.7rem] text-text-muted hover:text-text-secondary border border-border rounded-sm px-2 py-1.5 transition-colors cursor-pointer"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
