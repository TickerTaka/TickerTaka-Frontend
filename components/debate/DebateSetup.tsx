"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDebateSession } from "@/lib/api/debate";
import type { DebateCategory } from "@/lib/types/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";
import type { TickerOption } from "@/lib/api/debate";
import { DEFAULT_USER_ID } from "@/lib/api/client";

const CATEGORY_OPTIONS: DebateCategory[] = [
  "market",
  "financial",
  "technical",
  "macro",
  "synthesis",
];

export default function DebateSetup({ tickers }: { tickers: TickerOption[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState(tickers[0]?.symbol ?? "");
  const [category, setCategory] = useState<DebateCategory>("market");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTickers = tickers.length > 0;

  async function onStart() {
    setSubmitting(true);
    setError(null);
    try {
      const meta = await createDebateSession({
        user_id: DEFAULT_USER_ID,
        symbol,
        category,
      });
      router.push(`/debate/${meta.session_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "토론 시작 실패");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-card-bg rounded-xl border border-card-border p-[20px] shadow-deep-soft flex flex-col gap-stack-lg">
      <div>
        <h2 className="text-headline-sm mb-stack-sm text-on-surface">토론 설정</h2>
        {hasTickers ? (
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-canvas-bg border border-card-border rounded px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {tickers.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.name} ({t.symbol})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            먼저 대시보드에서 관심 종목을 추가해 주세요.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-stack-sm">
        <label className="text-label-md text-on-surface-variant">주제</label>
        <div className="flex flex-col gap-1">
          {CATEGORY_OPTIONS.map((c) => (
            <label key={c} className="flex items-center gap-stack-sm cursor-pointer group">
              <input
                type="radio"
                name="topic"
                checked={category === c}
                onChange={() => setCategory(c)}
                className="w-4 h-4 accent-primary"
              />
              <span
                className={`text-body-md ${
                  category === c ? "text-on-surface" : "text-on-surface-variant"
                } group-hover:text-primary transition-colors`}
              >
                {CATEGORY_LABEL[c]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-body-sm text-error bg-error-container/10 border border-error/30 rounded p-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={submitting || !symbol}
        className="w-full py-stack-sm bg-primary-btn hover:opacity-90 disabled:opacity-60 text-white text-body-md font-bold rounded-lg transition-colors flex justify-center items-center gap-1"
      >
        {submitting ? "시작 중..." : "토론 시작"}
      </button>
    </div>
  );
}
