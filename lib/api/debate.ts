// Maps backend POST/GET /api/debates onto the frontend DebateDetail shape.
// Backend returns DebateSessionResponse (flat). We transform it into
// { session, statements, summary } so the existing components keep working.

import { DEFAULT_USER_ID, apiDelete, apiGet, apiPost, isMockMode } from "@/lib/api/client";
import { listWatchlist } from "@/lib/api/watchlist";
import { MOCK_SESSIONS, MOCK_TICKERS, buildMockDetail } from "@/lib/mock/debate-data";
import type {
  AgentStatement,
  DebateCategory,
  DebateDetail,
  DebateSession,
  DebateStatus,
  ModeratorSummary,
  StartDebateRequest,
} from "@/lib/types/debate";

export interface TickerOption {
  symbol: string;
  name: string;
}

// Backend wire shapes (matching app/schemas/debate.py).
interface BackendStatement {
  agent_role: string;
  round: string;
  round_order: number;
  content: string;
  model_used: string;
  evidence_count: number;
}

interface BackendSessionResponse {
  session_id: string;
  user_id: string;
  symbol: string;
  category: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  summary_content: string | null;
  key_points: string[];
  statements: BackendStatement[];
  // optional enrichment if backend adds it later
  symbol_name?: string;
}

function toDetail(raw: BackendSessionResponse, fallbackName?: string): DebateDetail {
  const session: DebateSession = {
    id: raw.session_id,
    user_id: raw.user_id,
    symbol: raw.symbol,
    symbol_name: raw.symbol_name ?? fallbackName ?? raw.symbol,
    category: raw.category as DebateCategory,
    status: raw.status as DebateStatus,
    started_at: raw.started_at ?? new Date().toISOString(),
    completed_at: raw.completed_at,
  };

  const statements: AgentStatement[] = raw.statements.map((s) => ({
    id: `${raw.session_id}-${s.round_order}`,
    session_id: raw.session_id,
    round: s.round as AgentStatement["round"],
    round_order: s.round_order,
    agent_role: s.agent_role as AgentStatement["agent_role"],
    content: s.content,
    model_used: s.model_used,
    evidence_count: s.evidence_count,
    evidences: [],
  }));

  const summary: ModeratorSummary | null = raw.summary_content
    ? {
        session_id: raw.session_id,
        summary_content: raw.summary_content,
        key_points: raw.key_points ?? [],
      }
    : null;

  // Derive a rough bull/bear strength score from the closing-round statement count
  // until the backend exposes one. Keeps UI bars meaningful.
  const bullCount = statements.filter((s) => s.agent_role === "bull").length;
  const bearCount = statements.filter((s) => s.agent_role === "bear").length;
  const bull_strength = clamp(Math.round((bullCount / Math.max(1, bullCount + bearCount)) * 5), 0, 5);
  const bear_strength = clamp(5 - bull_strength, 0, 5);

  return { session, statements, summary, bull_strength, bear_strength };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export async function listTickers(): Promise<TickerOption[]> {
  if (isMockMode()) return MOCK_TICKERS;
  // Backend has no /tickers endpoint — derive from the user's watchlist.
  // Swallow errors (e.g. missing seed user) so the page can still render an
  // empty-state instead of 500ing.
  try {
    const items = await listWatchlist();
    return items.map((item) => ({
      symbol: item.symbol,
      name: item.ticker_name_kr ?? item.symbol,
    }));
  } catch {
    return [];
  }
}

interface BackendDebateListItem {
  session_id: string;
  user_id: string;
  symbol: string;
  symbol_name: string | null;
  category: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  summary_content: string | null;
}

export async function listDebateSessions(): Promise<DebateSession[]> {
  if (isMockMode()) return MOCK_SESSIONS;
  const res = await apiGet<{ items: BackendDebateListItem[] }>(`/api/debates?limit=50`);
  return res.items.map((it) => ({
    id: it.session_id,
    user_id: it.user_id,
    symbol: it.symbol,
    symbol_name: it.symbol_name ?? it.symbol,
    category: it.category as DebateCategory,
    status: it.status as DebateStatus,
    started_at: it.started_at ?? new Date().toISOString(),
    completed_at: it.completed_at,
  }));
}

export async function deleteDebateSession(sessionId: string): Promise<void> {
  if (isMockMode()) {
    const idx = MOCK_SESSIONS.findIndex((s) => s.id === sessionId);
    if (idx >= 0) MOCK_SESSIONS.splice(idx, 1);
    return;
  }
  await apiDelete(`/api/debates/${sessionId}`);
}

export async function getDebateDetail(sessionId: string): Promise<DebateDetail> {
  if (isMockMode()) {
    const session = MOCK_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_SESSIONS[0];
    return buildMockDetail(session);
  }
  const raw = await apiGet<BackendSessionResponse>(`/api/debates/${sessionId}`);
  return toDetail(raw);
}

export async function startDebate(req: StartDebateRequest): Promise<DebateDetail> {
  if (isMockMode()) {
    const ticker = MOCK_TICKERS.find((t) => t.symbol === req.symbol) ?? MOCK_TICKERS[0];
    const session: DebateSession = {
      id: `sess-${Date.now()}`,
      user_id: req.user_id,
      symbol: ticker.symbol,
      symbol_name: ticker.name,
      category: req.category,
      status: "running",
      started_at: new Date().toISOString(),
      completed_at: null,
    };
    MOCK_SESSIONS.unshift({ ...session, status: "completed", verdict: "bull", completed_at: new Date().toISOString() });
    return buildMockDetail(session);
  }
  const payload = {
    user_id: req.user_id || DEFAULT_USER_ID,
    symbol: req.symbol,
    category: req.category,
    avg_price: req.avg_price ?? null,
  };
  const raw = await apiPost<typeof payload, BackendSessionResponse>("/api/debates", payload);
  return toDetail(raw);
}
