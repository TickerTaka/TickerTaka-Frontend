import type { Sentiment } from "@/lib/types/market";

const SENTIMENT_UI: Record<Sentiment, { label: string; cls: string; dot: string }> = {
  // 이 코드베이스의 토큰: text-secondary = 빨강(상승), text-error = 파랑(하락)
  positive: { label: "호재", cls: "text-secondary bg-secondary-container/15 border-secondary/30", dot: "bg-secondary" },
  negative: { label: "악재", cls: "text-error bg-error-container/15 border-error/30", dot: "bg-error" },
  neutral:  { label: "중립", cls: "text-on-surface-variant bg-surface-variant border-outline-variant", dot: "bg-on-surface-variant" },
  mixed:    { label: "혼조", cls: "text-tertiary bg-tertiary/10 border-tertiary/30", dot: "bg-tertiary" },
};

const IMPACT_LABEL = ["강한 악재", "악재", "중립", "호재", "강한 호재"];

export function impactLabel(score: number): string {
  const idx = Math.max(0, Math.min(4, score + 2));
  return IMPACT_LABEL[idx];
}

export function sentimentBorderColor(s: Sentiment | null): string {
  switch (s) {
    case "positive": return "border-l-secondary";  // 호재 = 빨강
    case "negative": return "border-l-error";       // 악재 = 파랑
    case "neutral":  return "border-l-outline-variant";
    case "mixed":    return "border-l-tertiary";
    default:         return "border-l-card-border";
  }
}

interface Props {
  sentiment: Sentiment | null;
  impactScore?: number | null;
  confidence?: number | null;
  size?: "sm" | "md";
}

export default function SentimentTag({ sentiment, impactScore, confidence, size = "sm" }: Props) {
  if (sentiment === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm border border-outline-variant/40 text-on-surface-variant bg-surface-variant/40">
        <span className="material-symbols-outlined text-[12px] animate-pulse">progress_activity</span>
        분석 중
      </span>
    );
  }
  const ui = SENTIMENT_UI[sentiment];
  const padding = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded text-label-sm border font-semibold ${ui.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`} />
      {ui.label}
      {typeof impactScore === "number" && (
        <span className="opacity-80">· {impactLabel(impactScore)}</span>
      )}
      {typeof confidence === "number" && confidence > 0 && (
        <span className="opacity-70">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  );
}
