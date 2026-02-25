"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Database, Startup, Filters, SortField, SortDirection } from "./types";

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "all",
  country: "all",
  forSale: "all",
  mrrMin: "",
  mrrMax: "",
  paymentProvider: "all",
  businessType: "all",
  sortField: "mrr",
  sortDirection: "desc",
};

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((data: Database) => {
        setDb(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  return { db, loading };
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const updateFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: SortField) => {
      setFilters((prev) => ({
        ...prev,
        sortField: field,
        sortDirection:
          prev.sortField === field
            ? prev.sortDirection === "desc"
              ? "asc"
              : "desc"
            : "desc",
      }));
    },
    []
  );

  return { filters, updateFilter, resetFilters, toggleSort, page, setPage, pageSize };
}

export function useFilteredStartups(startups: Startup[], filters: Filters) {
  return useMemo(() => {
    let result = [...startups];

    // search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.founderName?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.includes(q))
      );
    }

    // category
    if (filters.category !== "all") {
      result = result.filter(
        (s) =>
          (s.userCategory || s.systemCategory || "Unknown") === filters.category
      );
    }

    // country
    if (filters.country !== "all") {
      result = result.filter((s) => (s.country || "Unknown") === filters.country);
    }

    // for sale
    if (filters.forSale === "yes") {
      result = result.filter((s) => s.onSale === true);
    } else if (filters.forSale === "no") {
      result = result.filter((s) => !s.onSale);
    }

    // mrr range
    if (filters.mrrMin) {
      const min = parseFloat(filters.mrrMin);
      if (!isNaN(min)) result = result.filter((s) => (s.mrr || 0) >= min);
    }
    if (filters.mrrMax) {
      const max = parseFloat(filters.mrrMax);
      if (!isNaN(max)) result = result.filter((s) => (s.mrr || 0) <= max);
    }

    // payment provider
    if (filters.paymentProvider !== "all") {
      result = result.filter(
        (s) => (s.paymentProvider || "unknown") === filters.paymentProvider
      );
    }

    // business type
    if (filters.businessType !== "all") {
      result = result.filter(
        (s) => (s.businessType || "Unknown") === filters.businessType
      );
    }

    // sort
    result.sort((a, b) => {
      const dir = filters.sortDirection === "desc" ? -1 : 1;
      const field = filters.sortField;

      if (field === "name") {
        return dir * -1 * ((a.name || "").localeCompare(b.name || ""));
      }

      const aVal = (a[field] as number) || 0;
      const bVal = (b[field] as number) || 0;
      return (aVal - bVal) * dir;
    });

    return result;
  }, [startups, filters]);
}

export function useUniqueValues(startups: Startup[]) {
  return useMemo(() => {
    const categories = new Set<string>();
    const countries = new Set<string>();
    const providers = new Set<string>();
    const businessTypes = new Set<string>();

    startups.forEach((s) => {
      const cat = s.userCategory || s.systemCategory;
      if (cat) categories.add(cat);
      if (s.country) countries.add(s.country);
      if (s.paymentProvider) providers.add(s.paymentProvider);
      if (s.businessType) businessTypes.add(s.businessType);
    });

    return {
      categories: [...categories].sort(),
      countries: [...countries].sort(),
      providers: [...providers].sort(),
      businessTypes: [...businessTypes].sort(),
    };
  }, [startups]);
}
