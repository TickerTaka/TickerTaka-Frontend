"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteDebateSession, getDebateDetail } from "@/lib/api/debate";
import { CATEGORY_LABEL, VERDICT_LABEL } from "@/lib/types/debate";
import type { AgentStatement, DebateCategory, DebateSession } from "@/lib/types/debate";

type Verdict = NonNullable<DebateSession["verdict"]>;

const VERDICT_STYLE: Record<Verdict, { bg: string; text: string; dot: string }> = {
  bull: { bg: "bg-secondary/10 border-secondary/30", text: "text-secondary", dot: "bg-secondary" },
  bear: { bg: "bg-error/10 border-error/30", text: "text-error", dot: "bg-error" },
  neutral: { bg: "bg-surface-variant border-outline-variant", text: "text-on-surface-variant", dot: "bg-on-surface-variant" },
};

const FILTERS: (DebateCategory | "all")[] = ["all", "market", "financial", "technical", "macro", "synthesis"];

// 토론 결론 모드를 localStorage에서 읽음 (DebateSetup에서 저장됨).
function readDecisionMode(sessionId: string): "moderator" | "judge" | null {
  try {
    const v = localStorage.getItem(`tt:decision:${sessionId}`);
    if (v === "judge" || v === "moderator") return v;
  } catch {
    /* ignore */
  }
  return null;
}

// DebateSummaryBlock과 동일한 가중치 — evidence 수 + 내용 길이로 강세/약세 계산.
function computeVerdict(statements: AgentStatement[]): Verdict {
  const weight = (s: AgentStatement) => {
    const ev = s.evidence_count ?? 0;
    const len = s.content?.length ?? 0;
    return ev * 3 + Math.min(15, len / 200);
  };
  const bullW = statements
    .filter((s) => s.agent_role === "bull")
    .reduce((a, s) => a + weight(s), 0);
  const bearW = statements
    .filter((s) => s.agent_role === "bear")
    .reduce((a, s) => a + weight(s), 0);
  if (bullW === 0 && bearW === 0) return "neutral";
  const ratio = bullW / (bullW + bearW);
  if (ratio > 0.55) return "bull";
  if (ratio < 0.45) return "bear";
  return "neutral";
}

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
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [filter, setFilter] = useState<DebateCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  // 판사 모드 세션만 detail을 fetch해 statements 강도로 verdict 계산. 사회자는 무조건 중립.
  const [verdictBySession, setVerdictBySession] = useState<Record<string, Verdict>>({});

  useEffect(() => {
    let cancelled = false;
    sessions.forEach((s) => {
      if (s.status !== "completed") return;
      const mode = readDecisionMode(s.id);
      if (mode !== "judge") return; // 사회자/미지정은 모두 중립으로 둠
      getDebateDetail(s.id)
        .then((detail) => {
          if (cancelled) return;
          const v = computeVerdict(detail.statements);
          setVerdictBySession((prev) => ({ ...prev, [s.id]: v }));
        })
        .catch(() => {
          /* 실패 시 그냥 중립으로 둠 */
        });
    });
    return () => {
      cancelled = true;
    };
  }, [sessions]);

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
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_1.3fr_1.2fr_1.4fr_80px] gap-3 px-6 py-4 bg-card-bg border-b border-card-border text-label-md text-on-surface-variant font-semibold">
            <span>종목</span>
            <span>토론 주제</span>
            <span>결과</span>
            <span>저장일시</span>
            <span className="text-right">삭제</span>
          </div>

          {/* Clickable rows */}
          <ul className="flex flex-col">
            {visible.map((s) => {
              const verdict: Verdict = verdictBySession[s.id] ?? "neutral";
              const style = VERDICT_STYLE[verdict];
              return (
                <li key={s.id} className="border-b border-card-border last:border-b-0">
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/debate/${s.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/debate/${s.id}`);
                      }
                    }}
                    aria-label={`${s.symbol_name} ${CATEGORY_LABEL[s.category]} 리포트 보기`}
                    className="group relative grid grid-cols-[1.6fr_1.3fr_1.2fr_1.4fr_80px] gap-3 items-center px-6 py-4 cursor-pointer text-body-md transition-all duration-150 ease-out hover:bg-primary/10 hover:translate-x-1 hover:shadow-md focus:outline-none focus-visible:bg-primary/10 focus-visible:translate-x-1"
                  >
                    {/* 좌측 강조 바 (호버 시 등장) */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 rounded-r bg-primary transition-all duration-150 ease-out group-hover:h-2/3 group-focus-visible:h-2/3"
                    />

                    {/* 종목 */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-canvas-bg border border-card-border flex items-center justify-center text-label-sm text-on-surface font-bold group-hover:border-primary/40 transition-colors">
                        {s.symbol_name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {s.symbol_name}
                        </div>
                        <div className="text-label-sm text-on-surface-variant">{s.symbol}</div>
                      </div>
                    </div>

                    <span className="text-on-surface">{CATEGORY_LABEL[s.category]}</span>

                    <span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-label-sm font-semibold border ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
                        {VERDICT_LABEL[verdict]}
                      </span>
                    </span>

                    <span className="text-on-surface-variant">{fmtDateTime(s.started_at)}</span>

                    {/* 삭제 (블록 클릭 차단) */}
                    <span
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {confirmId === s.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onDelete(s.id)}
                            disabled={deletingId === s.id}
                            className="px-2 py-1.5 rounded-btn text-label-md text-secondary border border-secondary/40 hover:bg-secondary/10 transition-colors disabled:opacity-50"
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
                          className="inline-flex items-center justify-center w-8 h-8 rounded-btn border border-card-border text-on-surface-variant hover:text-secondary hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
