"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWatchlist } from "@/lib/api/watchlist";
import { getStockDetail, getStockQuote } from "@/lib/api/market";
import type { WatchlistItem } from "@/lib/types/watchlist";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface PriceInfo {
  close: number | null;
  changeRate: number | null;
  date: string | null;
  isDelayed?: boolean;
}

export default function WatchlistTable({
  initialItems,
}: {
  initialItems: WatchlistItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [priceBySymbol, setPriceBySymbol] = useState<Record<string, PriceInfo>>({});
  const [confirmTarget, setConfirmTarget] = useState<WatchlistItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 페이지 로딩 차단 없이, 마운트 후 지연 현재가(quote API)를 병렬로 받아온다.
  // 백엔드는 Redis 캐시(장중 5분/장외 30분)라 빠르게 응답하지만, yfinance가
  // 429 rate-limit으로 실패하는 일이 있어서 그땐 일봉 종가(getStockDetail)로 fallback.
  useEffect(() => {
    let cancelled = false;
    items.forEach((w) => {
      getStockQuote(w.symbol)
        .then((q) => {
          if (cancelled) return;
          setPriceBySymbol((prev) => ({
            ...prev,
            [w.symbol]: {
              close: q.price ?? null,
              changeRate: q.change_rate ?? null,
              date: q.ts ?? null,
              isDelayed: q.is_delayed,
            },
          }));
        })
        .catch(() => {
          // quote 실패 → 일봉 종가 fallback. 이것마저 실패하면 "—" 표시.
          getStockDetail(w.symbol)
            .then((d) => {
              if (cancelled) return;
              const p = d.latest_price;
              setPriceBySymbol((prev) => ({
                ...prev,
                [w.symbol]: {
                  close: p?.close ?? null,
                  changeRate: p?.change_rate ?? null,
                  date: p?.date ?? null,
                  isDelayed: true,
                },
              }));
            })
            .catch(() => {
              if (cancelled) return;
              setPriceBySymbol((prev) => ({
                ...prev,
                [w.symbol]: { close: null, changeRate: null, date: null },
              }));
            });
        });
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  // ESC로 모달 닫기
  useEffect(() => {
    if (!confirmTarget) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && busy === null) setConfirmTarget(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmTarget, busy]);

  async function onConfirmDelete() {
    if (!confirmTarget) return;
    const symbol = confirmTarget.symbol;
    setBusy(symbol);
    setError(null);
    try {
      await deleteWatchlist(symbol);
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
      setConfirmTarget(null);
      // 삭제 후 dashboard server component(가격 정보 등) 재실행을 위해 라우터 refresh
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      setError(msg);
      console.error("[deleteWatchlist] failed:", e);
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-body-sm text-on-surface-variant">
        아직 추가된 관심 종목이 없습니다. 우측 카드에서 종목을 추가해 주세요.
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-[1.4fr_1fr_1.6fr_1fr_80px] gap-3 px-5 py-3 bg-card-bg border-b border-card-border text-label-md text-on-surface-variant">
        <span>종목명</span>
        <span>종목코드</span>
        <span className="text-right">현재가</span>
        <span className="text-right">추가일</span>
        <span className="text-right">삭제</span>
      </div>

      {/* Clickable card rows */}
      <ul className="flex flex-col">
        {items.map((w) => (
          <li key={w.id} className="border-b border-card-border last:border-b-0">
            <div
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/stock/${w.symbol}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/stock/${w.symbol}`);
                }
              }}
              aria-label={`${w.ticker_name_kr ?? w.symbol} 상세 보기`}
              className="group relative grid grid-cols-[1.4fr_1fr_1.6fr_1fr_80px] gap-3 items-center px-5 py-3 cursor-pointer text-body-sm transition-all duration-150 ease-out hover:bg-primary/10 hover:translate-x-1 hover:shadow-md focus:outline-none focus-visible:bg-primary/10 focus-visible:translate-x-1"
            >
              {/* 좌측 강조 바 (호버 시 등장) */}
              <span
                aria-hidden
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 rounded-r bg-primary transition-all duration-150 ease-out group-hover:h-2/3 group-focus-visible:h-2/3"
              />

              <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                {w.ticker_name_kr ?? w.symbol}
              </span>
              <span className="text-on-surface-variant">{w.symbol}</span>
              <PriceCell price={priceBySymbol[w.symbol]} />
              <span className="text-right text-on-surface-variant">{fmtDate(w.created_at)}</span>
              <span className="text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmTarget(w);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  aria-label={`${w.ticker_name_kr ?? w.symbol} 관심 종목 삭제`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-btn border border-card-border text-on-surface-variant hover:text-secondary hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>

      {confirmTarget && (
        <ConfirmDeleteModal
          name={confirmTarget.ticker_name_kr ?? confirmTarget.symbol}
          symbol={confirmTarget.symbol}
          busy={busy === confirmTarget.symbol}
          error={error}
          onCancel={() => {
            if (busy !== null) return;
            setConfirmTarget(null);
            setError(null);
          }}
          onConfirm={onConfirmDelete}
        />
      )}
    </>
  );
}

function PriceCell({ price }: { price?: PriceInfo }) {
  if (!price) {
    // 아직 fetch 안 끝남 — 로딩 스켈레톤
    return (
      <span className="text-right inline-flex justify-end">
        <span className="inline-block w-16 h-4 bg-surface-variant/40 rounded animate-pulse" />
      </span>
    );
  }
  if (price.close === null) {
    return <span className="text-right text-on-surface-variant">—</span>;
  }
  const change = price.changeRate;
  const isUp = (change ?? 0) > 0;
  const isDown = (change ?? 0) < 0;
  // 한국식: 상승 = 빨강(secondary), 하락 = 파랑(error)
  const tone = isUp
    ? "text-secondary"
    : isDown
      ? "text-error"
      : "text-on-surface";
  const arrow = isUp ? "▲" : isDown ? "▼" : "";
  return (
    <span className="text-right flex flex-col items-end leading-tight">
      <span className={`font-semibold ${tone}`}>
        {price.close.toLocaleString("ko-KR")}원
      </span>
      {change !== null && (
        <span className={`text-label-sm ${tone}`}>
          {arrow} {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

function ConfirmDeleteModal({
  name,
  symbol,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  name: string;
  symbol: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        disabled={busy}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-lg bg-card-bg rounded-xl border border-card-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-7 flex flex-col gap-5 items-center text-center">
          <h3
            id="delete-modal-title"
            className="text-headline-sm text-on-surface"
          >
            관심 종목 삭제
          </h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-nowrap">
            <span className="font-semibold text-on-surface">{name}</span>
            <span className="text-on-surface-variant"> ({symbol})</span>
            을(를) 관심 종목에서 삭제하시겠습니까?
          </p>

          {error && (
            <p className="text-body-sm text-error bg-error-container/10 border border-error/30 rounded p-2 max-w-full break-words">
              {error}
            </p>
          )}

          <div className="flex justify-center gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-5 py-2 rounded-btn text-label-md text-on-surface-variant border border-card-border hover:bg-surface-variant/50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              autoFocus
              className="px-5 py-2 rounded-btn text-label-md font-semibold text-white bg-secondary hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {busy && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              {busy ? "삭제 중" : "삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
