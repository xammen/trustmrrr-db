"use client";

import { useEffect, useState } from "react";
import { useDatabase, useFilters, useFilteredStartups, useUniqueValues } from "@/lib/hooks";
import { StatsGrid } from "@/components/StatsGrid";
import { FilterBar } from "@/components/FilterBar";
import { StartupTable } from "@/components/StartupTable";
import { Charts } from "@/components/Charts";
import { QuickInsights } from "@/components/QuickInsights";

function Face() {
  const [eyes, setEyes] = useState("╹ ╹");

  useEffect(() => {
    function blink() {
      setEyes("─ ─");
      setTimeout(() => setEyes("╹ ╹"), 120);
    }

    function schedule() {
      const delay = 3000 + Math.random() * 5000;
      const t = setTimeout(() => {
        blink();
        if (Math.random() < 0.3) setTimeout(blink, 250);
        schedule();
      }, delay);
      return t;
    }

    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="text-text-secondary">
      ༼ つ {eyes} ༽つ
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-lg mb-2">
          <Face />
        </div>
        <div className="text-[0.7rem] text-text-dim">loading 986 startups...</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { db, loading } = useDatabase();
  const { filters, updateFilter, resetFilters, toggleSort, page, setPage, pageSize } = useFilters();

  if (loading || !db) return <LoadingScreen />;

  return <Dashboard db={db} filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} toggleSort={toggleSort} page={page} setPage={setPage} pageSize={pageSize} />;
}

function Dashboard({
  db,
  filters,
  updateFilter,
  resetFilters,
  toggleSort,
  page,
  setPage,
  pageSize,
}: {
  db: NonNullable<ReturnType<typeof useDatabase>["db"]>;
  filters: ReturnType<typeof useFilters>["filters"];
  updateFilter: ReturnType<typeof useFilters>["updateFilter"];
  resetFilters: ReturnType<typeof useFilters>["resetFilters"];
  toggleSort: ReturnType<typeof useFilters>["toggleSort"];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
}) {
  const filtered = useFilteredStartups(db.startups, filters);
  const unique = useUniqueValues(db.startups);

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-normal text-text-primary flex items-center gap-2">
                <Face />
                <span className="text-text-muted">trustmrrr</span>
              </h1>
              <p className="text-[0.7rem] text-text-dim mt-1">
                986 startups. every mrr. every revenue. scraped, verified,
                searchable.
              </p>
            </div>
            <a
              href="https://github.com/xammen/trustmrrr-db"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.65rem] text-text-dim hover:text-text-secondary border border-border rounded-sm px-2.5 py-1.5 transition-colors"
            >
              json
            </a>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* stats */}
        <StatsGrid db={db} />

        {/* charts */}
        <Charts db={db} />

        {/* filters + table + insights */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-4 min-w-0">
            <FilterBar
              filters={filters}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              categories={unique.categories}
              countries={unique.countries}
              providers={unique.providers}
              businessTypes={unique.businessTypes}
              resultCount={filtered.length}
              totalCount={db.startups.length}
            />
            <StartupTable
              startups={filtered}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              toggleSort={toggleSort}
              filters={filters}
            />
          </div>

          {/* sidebar */}
          <aside className="hidden lg:block">
            <QuickInsights db={db} />
          </aside>
        </div>
      </main>

      {/* footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-[0.6rem] text-text-dim">
            made by{" "}
            <a
              href="https://hiii.boo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              xmn
            </a>
          </div>
          <div className="text-[0.6rem] text-text-dim">
            data from{" "}
            <a
              href="https://trustmrr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              trustmrr.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
