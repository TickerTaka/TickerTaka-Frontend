// Types mirror backend schemas/debate.py + schemas/watchlist.py shapes.

export type DebateCategory =
  | "technical"
  | "financial"
  | "market"
  | "macro"
  | "synthesis";

export type DebateStatus = "pending" | "running" | "completed" | "failed";

export type DebateRound = "opening" | "rebuttal" | "closing" | "summary";

export type AgentRole = "bull" | "bear" | "moderator" | "system";

export type SourceType =
  | "news"
  | "filing"
  | "price"
  | "financial"
  | "technical";

export interface Evidence {
  id?: string;
  source_type: SourceType;
  source_url: string | null;
  source_label: string | null;
  source_title: string | null;
  excerpt: string;
  retrieved_at: string;
}

// Matches DebateStatementResponse from backend (flat shape).
export interface AgentStatement {
  id: string; // synthesized on the frontend (session_id + round_order)
  session_id: string;
  round: DebateRound;
  round_order: number;
  agent_role: AgentRole;
  content: string;
  model_used: string;
  evidence_count: number;
  evidences: Evidence[]; // backend returns evidence_count only; kept for UI compat (empty)
  created_at?: string;
}

export interface ModeratorSummary {
  session_id: string;
  summary_content: string;
  key_points: string[];
}

// Frontend-friendly session view (decoded from DebateSessionResponse).
export interface DebateSession {
  id: string;
  user_id: string;
  symbol: string;
  symbol_name: string;
  category: DebateCategory;
  status: DebateStatus;
  started_at: string;
  completed_at: string | null;
  verdict?: "bull" | "bear" | "neutral";
}

export interface DebateDetail {
  session: DebateSession;
  statements: AgentStatement[];
  summary: ModeratorSummary | null;
  bull_strength?: number;
  bear_strength?: number;
}

export interface StartDebateRequest {
  user_id: string;
  symbol: string;
  category: DebateCategory;
  avg_price?: number | null;
}

export const CATEGORY_LABEL: Record<DebateCategory, string> = {
  technical: "기술적 분석",
  financial: "재무 건전성",
  market: "성장성 분석",
  macro: "뉴스·이슈",
  synthesis: "종합 분석",
};

export const VERDICT_LABEL: Record<NonNullable<DebateSession["verdict"]>, string> = {
  bull: "Bull 우세",
  bear: "Bear 우세",
  neutral: "Neutral",
};
