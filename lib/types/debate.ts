// Types mirror backend schemas/debate.py + schemas/watchlist.py shapes.

export type DebateCategory =
  | "technical"
  | "financial"
  | "market"
  | "macro"
  | "synthesis";

export type DebateStatus = "pending" | "running" | "completed" | "failed";

// Legacy rounds (opening/closing) kept for older sessions; new graph uses
// claim / rebuttal / counter_rebuttal / summary.
export type DebateRound =
  | "opening"
  | "claim"
  | "rebuttal"
  | "counter_rebuttal"
  | "closing"
  | "summary";

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
  topic_index?: number; // 4-turn graph indexes which agenda topic this is
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
  notion_page_id?: string | null;
  notion_page_url?: string | null;
  notion_published_at?: string | null;
}

export interface DebateDetail {
  session: DebateSession;
  statements: AgentStatement[];
  summary: ModeratorSummary | null;
  bull_strength?: number;
  bear_strength?: number;
}

export type DecisionAgent = "moderator" | "judge";

export interface StartDebateRequest {
  user_id: string;
  symbol: string;
  category: DebateCategory;
  decision_agent?: DecisionAgent;
}

// Shape returned by POST /api/debates/sessions — minimal metadata, no statements.
export interface DebateSessionMeta {
  session_id: string;
  user_id: string;
  symbol: string;
  symbol_name?: string;
  category: DebateCategory;
  status: DebateStatus;
  started_at: string;
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
