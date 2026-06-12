import NotionPublishButton from "./NotionPublishButton";
import type { DebateDetail } from "@/lib/types/debate";

export default function DebateSummaryBlock({ detail }: { detail: DebateDetail }) {
  const { session, summary, bull_strength = 0, bear_strength = 0 } = detail;
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

  return (
    <div className="bg-gradient-to-br from-card-bg to-surface-container rounded-xl border border-primary/30 shadow-deep-soft overflow-hidden">
      <div className="p-[20px] border-b border-card-border flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">insights</span>
          최종 토론 요약
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
        {/* Moderator summary */}
        <div className="flex gap-stack-md">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
          </div>
          <div className="flex-1">
            <p className="text-label-md text-primary mb-2">Moderator AI</p>
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              {summary.summary_content}
            </p>
          </div>
        </div>

        {/* Key points */}
        {summary.key_points.length > 0 && (
          <div className="bg-surface-container rounded-lg border border-outline-variant/40 p-stack-md">
            <p className="text-label-md text-on-surface-variant mb-2">핵심 포인트</p>
            <ul className="flex flex-col gap-2">
              {summary.key_points.map((p, i) => (
                <li key={i} className="flex gap-2 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                    chevron_right
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strength bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <StrengthBar label="Bull (강세)" value={bull_strength} tone="bull" />
          <StrengthBar label="Bear (약세)" value={bear_strength} tone="bear" />
        </div>
      </div>
    </div>
  );
}

function StrengthBar({ label, value, tone }: { label: string; value: number; tone: "bull" | "bear" }) {
  const pct = Math.round((Math.min(5, Math.max(0, value)) / 5) * 100);
  const color = tone === "bull" ? "bg-secondary" : "bg-error";
  const textColor = tone === "bull" ? "text-secondary" : "text-error";
  const border = tone === "bull" ? "border-secondary/30" : "border-error/30";
  return (
    <div className={`bg-card-bg border ${border} rounded-lg p-stack-md flex flex-col gap-2`}>
      <div className="flex justify-between items-center">
        <span className={`text-label-md ${textColor}`}>{label}</span>
        <span className={`text-body-md font-bold ${textColor}`}>{value} / 5</span>
      </div>
      <div className="h-2 rounded-full bg-surface-variant overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
