"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteDebateSession } from "@/lib/api/debate";
import { CATEGORY_LABEL, VERDICT_LABEL } from "@/lib/types/debate";
import type { DebateCategory, DebateSession } from "@/lib/types/debate";

const VERDICT_STYLE: Record<NonNullable<DebateSession["verdict"]>, { bg: string; text: string; dot: string }> = {
  bull: { bg: "bg-positive/10 border-positive/20", text: "text-positive", dot: "bg-positive" },
  bear: { bg: "bg-negative/10 border-negative/20", text: "text-negative", dot: "bg-negative" },
  neutral: { bg: "bg-neutral/10 border-neutral/20", text: "text-neutral", dot: "bg-neutral" },
};

const FILTERS: (DebateCategory | "all")[] = ["all", "market", "financial", "technical", "macro", "synthesis"];

// Locale-independent format to avoid SSR/client hydration mismatch (AM/PM vs 오전/오후).
function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function HistoryTable({
  initialSessions,
  focusedSymbol = null,
  focusedSymbolName = null,
}: {
  initialSessions: DebateSession[];
  focusedSymbol?: string | null;
  focusedSymbolName?: string | null;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [filter, setFilter] = useState<DebateCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (q && !(`${s.symbol_name} ${s.symbol} ${CATEGORY_LABEL[s.category]}`.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [sessions, filter, search]);

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDebateSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setConfirmId(null);
    } catch {
      // keep row; surface nothing fancy for now
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h2 className="text-headline-lg text-on-surface mb-2">리포트 히스토리</h2>
          <p className="text-body-md text-on-surface-variant">저장된 AI 토론 분석 결과 및 리포트 목록입니다.</p>
          {focusedSymbol && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-label-md text-primary">
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              <span>
                <strong>{focusedSymbolName ?? focusedSymbol}</strong> 종목만 표시
              </span>
              <Link
                href="/history"
                className="ml-1 flex items-center justify-center w-5 h-5 rounded-full hover:bg-primary/20 transition-colors"
                aria-label="전체 토론 보기"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </Link>
            </div>
          )}
        </div>
        <div className="relative w-full md:w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="종목명 또는 카테고리 검색..."
            className="w-full bg-canvas-bg border border-card-border rounded-lg pl-10 pr-4 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary-btn focus:ring-1 focus:ring-primary-btn"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {FILTERS.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-label-md border transition-colors ${
                active
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-surface-container text-on-surface-variant border-card-border hover:bg-surface-variant/50"
              }`}
            >
              {c === "all" ? "전체" : CATEGORY_LABEL[c]}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card-bg rounded-[12px] border border-card-border shadow-deep-soft p-10 text-center text-body-md text-on-surface-variant">
          {sessions.length === 0
            ? "저장된 토론 세션이 아직 없습니다. 좌측 메뉴에서 새 토론을 시작해 보세요."
            : "조건에 맞는 세션이 없습니다."}
        </div>
      ) : (
        <div className="bg-card-bg rounded-[12px] border border-card-border shadow-deep-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-card-bg border-b border-card-border text-label-md text-on-surface-variant">
                <tr>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap">종목</th>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap">토론 주제</th>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap">결과</th>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap">저장일시</th>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap text-right">리포트 보기</th>
                  <th className="py-4 px-6 font-semibold whitespace-nowrap text-right">삭제</th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y divide-card-border">
                {visible.map((s) => {
                  const verdict = s.verdict ?? "neutral";
                  const style = VERDICT_STYLE[verdict];
                  return (
                    <tr key={s.id} className="hover:bg-card-border/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-canvas-bg border border-card-border flex items-center justify-center text-label-sm text-on-surface font-bold">
                            {s.symbol_name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{s.symbol_name}</div>
                            <div className="text-label-sm text-on-surface-variant">{s.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface">{CATEGORY_LABEL[s.category]}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-label-sm font-semibold border ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
                          {VERDICT_LABEL[verdict]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {fmtDateTime(s.started_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/debate/${s.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-btn border border-card-border text-label-md text-primary hover:bg-primary-btn/10 hover:border-primary-btn/50 transition-colors"
                        >
                          리포트 보기
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {confirmId === s.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="px-2 py-1.5 rounded-btn text-label-md text-error border border-error/40 hover:bg-error/10 transition-colors disabled:opacity-50"
                            >
                              {deletingId === s.id ? "삭제 중" : "확인"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              disabled={deletingId === s.id}
                              className="px-2 py-1.5 rounded-btn text-label-md text-on-surface-variant border border-card-border hover:bg-surface-variant/50 transition-colors"
                            >
                              취소
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(s.id)}
                            aria-label={`${s.symbol_name} 리포트 삭제`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-btn border border-card-border text-on-surface-variant hover:text-error hover:border-error/50 hover:bg-error/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
