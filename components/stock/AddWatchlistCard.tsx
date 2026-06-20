"use client";

import { useEffect, useRef, useState } from "react";
import { createWatchlist } from "@/lib/api/watchlist";
import { searchTickers } from "@/lib/api/market";
import type { TickerSearchItem } from "@/lib/types/market";

type ResultModal =
  | { kind: "success"; name: string; symbol: string }
  | { kind: "error"; message: string }
  | null;

// 전체 새로고침(F5) 후 모달을 띄우기 위해 sessionStorage에 결과를 잠깐 저장한다.
const PENDING_KEY = "tt:watchlist-add-result";

export default function AddWatchlistCard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerSearchItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ResultModal>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 sessionStorage에 직전 결과가 있으면 모달 띄우고 키 제거
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_KEY);
      const parsed = JSON.parse(raw) as ResultModal;
      if (parsed) setModal(parsed);
    } catch {
      /* ignore */
    }
  }, []);

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

  // ESC로 모달 닫기
  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  async function add(symbol: string, name?: string) {
    setBusy(true);
    setModal(null);
    try {
      const res = await createWatchlist(symbol);
      const displayName = name ?? res.watchlist.ticker_name_kr ?? symbol;
      // 성공 결과를 sessionStorage에 잠깐 저장 → 새로고침 후 마운트 시 모달 띄움
      try {
        sessionStorage.setItem(
          PENDING_KEY,
          JSON.stringify({ kind: "success", name: displayName, symbol }),
        );
      } catch {
        /* sessionStorage 막혔으면 그냥 새로고침만 */
      }
      // F5 누른 것처럼 전체 페이지 새로고침
      window.location.reload();
    } catch (e) {
      // 실패는 새로고침 없이 즉시 모달
      const message = e instanceof Error ? e.message : "추가 실패";
      setModal({ kind: "error", message });
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bg-card-bg border border-card-border rounded-card shadow-deep-soft p-5">
        <h3 className="text-headline-sm text-on-surface mb-4">
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
          <ul className="mb-1 border border-card-border rounded-btn max-h-60 overflow-y-auto">
            {results.map((t) => (
              <li key={t.symbol} className="border-b border-card-border last:border-b-0">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => add(t.symbol, t.name_kr)}
                  className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors flex justify-between items-center disabled:opacity-50"
                >
                  <span className="text-body-sm text-on-surface font-medium">{t.name_kr}</span>
                  <span className="text-label-sm text-on-surface-variant">{t.symbol} · {t.market}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <ResultModal
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function ResultModal({
  modal,
  onClose,
}: {
  modal: NonNullable<ResultModal>;
  onClose: () => void;
}) {
  const isSuccess = modal.kind === "success";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-result-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-card-bg rounded-xl border border-card-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-7 flex flex-col gap-4 items-center text-center">
          {isSuccess ? (
            <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[28px]">error</span>
            </div>
          )}

          <h3
            id="add-result-title"
            className="text-headline-sm text-on-surface"
          >
            {isSuccess ? "관심 종목 추가 완료" : "추가 실패"}
          </h3>

          {isSuccess ? (
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-nowrap">
              <span className="font-semibold text-on-surface">{modal.name}</span>
              <span className="text-on-surface-variant"> ({modal.symbol})</span>
              을(를) 관심 종목에 추가했습니다.
            </p>
          ) : (
            <p className="text-body-md text-on-surface-variant leading-relaxed break-words">
              {modal.message}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-2 px-6 py-2 rounded-btn text-label-md font-semibold text-white bg-primary-btn hover:opacity-90 transition-opacity"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
