"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteWatchlist } from "@/lib/api/watchlist";
import type { WatchlistItem } from "@/lib/types/watchlist";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function WatchlistTable({ initialItems }: { initialItems: WatchlistItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [confirmSymbol, setConfirmSymbol] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onDelete(symbol: string) {
    setBusy(symbol);
    try {
      await deleteWatchlist(symbol);
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
      setConfirmSymbol(null);
    } catch {
      /* keep row on failure */
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-card-bg border-b border-card-border">
            <th className="px-5 py-3 text-label-md text-on-surface-variant font-normal">종목명</th>
            <th className="px-5 py-3 text-label-md text-on-surface-variant font-normal">종목코드</th>
            <th className="px-5 py-3 text-label-md text-on-surface-variant font-normal">메모</th>
            <th className="px-5 py-3 text-label-md text-on-surface-variant font-normal text-right">추가일</th>
            <th className="px-5 py-3 text-label-md text-on-surface-variant font-normal text-right">삭제</th>
          </tr>
        </thead>
        <tbody className="text-body-sm">
          {items.map((w) => (
            <tr key={w.id} className="border-b border-card-border/50 hover:bg-card-border/30 transition-colors">
              <td className="px-5 py-3 font-semibold text-on-surface">
                <Link href={`/stock/${w.symbol}`} className="hover:text-primary">
                  {w.ticker_name_kr ?? w.symbol}
                </Link>
              </td>
              <td className="px-5 py-3 text-on-surface-variant">{w.symbol}</td>
              <td className="px-5 py-3 text-on-surface-variant">{w.memo ?? "—"}</td>
              <td className="px-5 py-3 text-right text-on-surface-variant">{fmtDate(w.created_at)}</td>
              <td className="px-5 py-3 text-right">
                {confirmSymbol === w.symbol ? (
                  <span className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDelete(w.symbol)}
                      disabled={busy === w.symbol}
                      className="px-2 py-1 rounded-btn text-label-sm text-negative border border-negative/40 hover:bg-negative/10 transition-colors disabled:opacity-50"
                    >
                      {busy === w.symbol ? "삭제 중" : "확인"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSymbol(null)}
                      disabled={busy === w.symbol}
                      className="px-2 py-1 rounded-btn text-label-sm text-on-surface-variant border border-card-border hover:bg-surface-variant/50 transition-colors"
                    >
                      취소
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSymbol(w.symbol)}
                    aria-label={`${w.ticker_name_kr ?? w.symbol} 관심 종목 삭제`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-btn border border-card-border text-on-surface-variant hover:text-negative hover:border-negative/50 hover:bg-negative/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
