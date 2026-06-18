"use client";

import { useEffect, useMemo, useState } from "react";
import NotionPublishButton from "./NotionPublishButton";
import type { AgentStatement, DebateDetail } from "@/lib/types/debate";

type ConclusionMode = "moderator" | "judge";

const JUDGE_DISCLAIMER =
  "제가 제공해 드리는 정보는 단순 참고용이며, 이를 바탕으로 한 실제 매매나 투자 집행은 전적으로 사용자의 주체적인 결정과 책임하에 이루어져야 합니다.";

export default function DebateSummaryBlock({ detail }: { detail: DebateDetail }) {
  const { session, summary } = detail;
  // Compute from statements so the bars are meaningful for both live and
  // already-completed sessions (the backend doesn't return bull/bear strength).
  const { bull: bull_strength, bear: bear_strength } = useMemo(
    () => computeStrengths(detail.statements),
    [detail.statements],
  );
  // Conclusion mode is decided at debate-start time. The backend doesn't echo
  // it back, so DebateSetup stashes the choice in localStorage keyed by
  // session_id and we read it back here. Default: moderator (legacy sessions).
  const [mode, setMode] = useState<ConclusionMode>("moderator");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tt:decision:${session.id}`);
      if (saved === "judge" || saved === "moderator") setMode(saved);
    } catch {
      /* ignore */
    }
  }, [session.id]);

  if (!summary) return null;
  const isCompleted = session.status === "completed";

  const verdict =
    bull_strength > bear_strength ? "bull" : bear_strength > bull_strength ? "bear" : "neutral";
  const verdictLabel =
    verdict === "bull" ? "강세 우위" : verdict === "bear" ? "약세 우위" : "중립";
  const verdictTone =
    verdict === "bull"
      ? "text-secondary bg-secondary-container/15 border-secondary/30"
      : verdict === "bear"
        ? "text-error bg-error-container/15 border-error/30"
        : "text-on-surface-variant bg-surface-variant border-outline-variant";

  const isJudge = mode === "judge";
  const headerIcon = isJudge ? "gavel" : "insights";
  const headerLabel = isJudge ? "판사의 판결" : "최종 토론 요약";
  const speakerLabel = isJudge ? "Judge AI" : "Moderator AI";
  const speakerIcon = isJudge ? "balance" : "psychology";

  const judgeVerdictLine =
    verdict === "bull"
      ? "본 토론을 종합한 결과, **강세론(Bull)** 측 주장이 더 설득력 있다고 판단합니다."
      : verdict === "bear"
        ? "본 토론을 종합한 결과, **약세론(Bear)** 측 주장이 더 설득력 있다고 판단합니다."
        : "본 토론은 양측의 주장이 팽팽하여 어느 한쪽의 손을 들기 어려운 **중립** 상태입니다.";

  return (
    <div className="bg-gradient-to-br from-card-bg to-surface-container rounded-xl border border-primary/30 shadow-deep-soft overflow-hidden">
      <div className="p-[20px] border-b border-card-border flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">{headerIcon}</span>
          {headerLabel}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-label-md font-semibold border ${verdictTone}`}>
            {verdictLabel}
          </span>
          <NotionPublishButton
            sessionId={session.id}
            initialUrl={session.notion_page_url ?? null}
            disabled={!isCompleted}
          />
        </div>
      </div>

      <div className="p-[24px] flex flex-col gap-stack-lg">
        {/* Judge mode disclaimer (required) — top */}
        {isJudge && (
          <div className="bg-secondary/5 border border-secondary/30 rounded-lg p-stack-md flex gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
              info
            </span>
            <p className="text-body-sm text-on-surface leading-relaxed">
              {JUDGE_DISCLAIMER}
            </p>
          </div>
        )}

        {/* Conclusion body */}
        <div className="flex gap-stack-md">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
              isJudge
                ? "bg-tertiary/15 border-tertiary/50"
                : "bg-primary/20 border-primary/50"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isJudge ? "text-tertiary" : "text-primary"
              }`}
            >
              {speakerIcon}
            </span>
          </div>
          <div className="flex-1">
            <p
              className={`text-label-md mb-2 ${
                isJudge ? "text-tertiary" : "text-primary"
              }`}
            >
              {speakerLabel}
            </p>
            {isJudge && (
              <p className="text-body-lg text-on-surface font-semibold mb-3">
                {renderBoldLine(judgeVerdictLine)}
              </p>
            )}
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              {summary.summary_content}
            </p>
          </div>
        </div>

        {/* Key points */}
        {summary.key_points.length > 0 && (
          <div className="bg-surface-container rounded-lg border border-outline-variant/40 p-stack-md">
            <p className="text-label-md text-on-surface-variant mb-2">
              {isJudge ? "판결 근거" : "핵심 포인트"}
            </p>
            <ul className="flex flex-col gap-2">
              {summary.key_points.map((p, i) => (
                <li key={i} className="flex gap-2 text-body-md text-on-surface">
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isJudge ? "text-tertiary" : "text-primary"
                    }`}
                  >
                    {isJudge ? "label_important" : "chevron_right"}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

function computeStrengths(statements: AgentStatement[]): { bull: number; bear: number } {
  // The 4-turn graph (claim → rebuttal → counter → counter, × 3 topics) gives
  // Bull and Bear identical statement counts, so a count-based score would be
  // a constant 3/2 for every debate. Score by evidence grounding and content
  // depth instead — both are real signals of who argued more strongly.
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
  const total = bullW + bearW;
  if (total === 0) return { bull: 0, bear: 0 };
  const bullBars = Math.round((bullW / total) * 5);
  return {
    bull: Math.max(0, Math.min(5, bullBars)),
    bear: Math.max(0, Math.min(5, 5 - bullBars)),
  };
}

function renderBoldLine(line: string) {
  // very small **bold** renderer for the judge verdict line
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-tertiary">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

