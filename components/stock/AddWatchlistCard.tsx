"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createWatchlist } from "@/lib/api/watchlist";
import { searchTickers } from "@/lib/api/market";
import type { TickerSearchItem } from "@/lib/types/market";

export default function AddWatchlistCard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerSearchItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchTickers(q, 8));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function add(symbol: string, name?: string) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await createWatchlist(symbol);
      setSuccess(`${name ?? res.watchlist.ticker_name_kr ?? symbol} 추가 완료 — 데이터 수집 시작`);
      setQuery("");
      setResults([]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-card shadow-deep-soft p-5">
      <h3 className="text-headline-sm text-on-surface mb-4 flex items-center">
        <span className="material-symbols-outlined mr-2 text-primary">add_circle</span>
        관심 종목 추가
      </h3>
      <div className="relative mb-3">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목명 또는 코드 검색 (예: 삼성, 005930)"
          className="w-full bg-input-bg border border-card-border text-on-surface text-body-sm rounded-btn py-2 pl-10 pr-4 focus:outline-none focus:border-primary-btn focus:ring-1 focus:ring-primary-btn transition"
        />
      </div>

      {results.length > 0 && (
        <ul className="mb-3 border border-card-border rounded-btn divide-y divide-card-border/50 max-h-60 overflow-y-auto">
          {results.map((t) => (
            <li key={t.symbol}>
              <button
                type="button"
                disabled={busy}
                onClick={() => add(t.symbol, t.name_kr)}
                className="w-full text-left px-3 py-2 hover:bg-card-border/40 transition-colors flex justify-between items-center disabled:opacity-50"
              >
                <span className="text-body-sm text-on-surface font-medium">{t.name_kr}</span>
                <span className="text-label-sm text-on-surface-variant">{t.symbol} · {t.market}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-label-sm text-error mb-2">{error}</p>}
      {success && <p className="text-label-sm text-secondary mb-2">{success}</p>}
    </div>
  );
}
