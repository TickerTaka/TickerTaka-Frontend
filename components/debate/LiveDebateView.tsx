"use client";

import { useEffect, useRef, useState } from "react";
import DebateChat from "./DebateChat";
import DebateSummaryBlock from "./DebateSummaryBlock";
import { debateStreamUrl } from "@/lib/api/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";
import type {
  AgentRole,
  AgentStatement,
  DebateDetail,
  DebateRound,
  DebateSession,
} from "@/lib/types/debate";

interface Props {
  initial: DebateDetail;
}

// --- Wire shapes for the SSE events the backend emits ---
interface SseSessionStarted {
  session_id: string;
  symbol: string;
  symbol_name?: string;
  category: string;
  status: string;
}
interface SseStatement {
  session_id: string;
  agent_role: string;
  round: string;
  round_order: number;
  topic_index?: number;
  content: string;
  model_used: string;
  evidence_count?: number;
}
interface SseSummary {
  session_id: string;
  summary_content: string;
  key_points: string[];
}
interface SseDone {
  session_id: string;
  status: string;
  summary_content?: string;
  key_points?: string[];
}
interface SseError {
  session_id: string;
  status: string;
  message: string;
}
interface SseStage {
  session_id: string;
  node: string;
  stage: string;
}
interface SseAgenda {
  session_id: string;
  agenda: string[];
}

export default function LiveDebateView({ initial }: Props) {
  const [detail, setDetail] = useState<DebateDetail>(initial);
  const [agenda, setAgenda] = useState<string[]>([]);
  const [stage, setStage] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Open the stream once per session. We must NOT depend on session.status,
    // because the first incoming event (session_started) flips status from
    // "pending" → "running", which would otherwise re-run this effect, close
    // the live EventSource, and make the backend mark the debate as failed.
    if (initial.session.status === "completed" || initial.session.status === "failed") return;

    const url = debateStreamUrl(initial.session.id);
    const es = new EventSource(url);
    esRef.current = es;

    const safeParse = <T,>(raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    es.addEventListener("session_started", (e) => {
      const data = safeParse<SseSessionStarted>((e as MessageEvent).data);
      if (!data) return;
      setDetail((prev) => ({
        ...prev,
        session: patchSession(prev.session, {
          status: (data.status as DebateSession["status"]) ?? "running",
          symbol_name: data.symbol_name ?? prev.session.symbol_name,
        }),
      }));
    });

    es.addEventListener("stage", (e) => {
      const data = safeParse<SseStage>((e as MessageEvent).data);
      if (data) setStage(stageLabel(data.node, data.stage));
    });

    es.addEventListener("agenda", (e) => {
      const data = safeParse<SseAgenda>((e as MessageEvent).data);
      if (data?.agenda) setAgenda(data.agenda);
    });

    es.addEventListener("statement", (e) => {
      const data = safeParse<SseStatement>((e as MessageEvent).data);
      if (!data) return;
      const statement: AgentStatement = {
        id: `${data.session_id}-${data.round_order}`,
        session_id: data.session_id,
        round: (data.round as DebateRound) ?? "claim",
        round_order: data.round_order,
        topic_index: data.topic_index,
        agent_role: (data.agent_role as AgentRole) ?? "system",
        content: data.content,
        model_used: data.model_used,
        evidence_count: data.evidence_count ?? 0,
        evidences: [],
      };
      setDetail((prev) => {
        const exists = prev.statements.some(
          (s) => s.round_order === statement.round_order,
        );
        const next = exists ? prev.statements : [...prev.statements, statement];
        // Keep ordered by round_order
        next.sort((a, b) => a.round_order - b.round_order);
        const counts = strengths(next);
        return {
          ...prev,
          statements: next,
          bull_strength: counts.bull,
          bear_strength: counts.bear,
        };
      });
    });

    es.addEventListener("summary", (e) => {
      const data = safeParse<SseSummary>((e as MessageEvent).data);
      if (!data) return;
      setDetail((prev) => ({
        ...prev,
        summary: {
          session_id: data.session_id,
          summary_content: data.summary_content,
          key_points: data.key_points ?? [],
        },
      }));
    });

    es.addEventListener("done", (e) => {
      const data = safeParse<SseDone>((e as MessageEvent).data);
      setDetail((prev) => ({
        ...prev,
        session: patchSession(prev.session, {
          status: ((data?.status as DebateSession["status"]) ?? "completed"),
          completed_at: prev.session.completed_at ?? new Date().toISOString(),
        }),
        summary:
          data?.summary_content !== undefined
            ? {
                session_id: prev.session.id,
                summary_content: data.summary_content ?? "",
                key_points: data.key_points ?? [],
              }
            : prev.summary,
      }));
      es.close();
      esRef.current = null;
    });

    es.addEventListener("error", (e) => {
      // SSE emits "error" for both connection drops AND backend-sent errors.
      // We distinguish: if the raw event has data, it's a backend error payload.
      const me = e as MessageEvent;
      if (typeof me.data === "string") {
        const data = safeParse<SseError>(me.data);
        if (data) {
          setStreamError(data.message);
          setDetail((prev) => ({
            ...prev,
            session: patchSession(prev.session, {
              status: (data.status as DebateSession["status"]) ?? "failed",
            }),
          }));
          es.close();
          esRef.current = null;
          return;
        }
      }
      // Generic transport error — close. (EventSource auto-reconnects unless we close.)
      // We close to surface the issue rather than spin forever.
      es.close();
      esRef.current = null;
    });

    return () => {
      es.close();
      esRef.current = null;
    };
    // Only re-open if we navigate to a DIFFERENT session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.session.id]);

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-col md:flex-row gap-gutter">
        <SessionInfo detail={detail} stage={stage} agenda={agenda} streamError={streamError} />
        <div className="w-full md:w-8/12 h-[calc(100vh-220px)] min-h-[420px]">
          <DebateChat detail={detail} />
        </div>
      </div>
      <DebateSummaryBlock detail={detail} />
    </div>
  );
}

function patchSession(
  prev: DebateSession,
  patch: Partial<DebateSession>,
): DebateSession {
  return { ...prev, ...patch };
}

function stageLabel(node: string, stage: string): string {
  const map: Record<string, string> = {
    data_agent: "데이터 수집",
    moderator_pre: "사회자 사전 분석",
    bull_agent: "강세론 발언",
    bear_agent: "약세론 발언",
    moderator_check: "사회자 점검",
    moderator_summary: "최종 요약",
  };
  return `${map[node] ?? node} · ${stage}`;
}

function strengths(statements: AgentStatement[]): { bull: number; bear: number } {
  const bull = statements.filter((s) => s.agent_role === "bull").length;
  const bear = statements.filter((s) => s.agent_role === "bear").length;
  const total = Math.max(1, bull + bear);
  const bullScore = Math.min(5, Math.max(0, Math.round((bull / total) * 5)));
  return { bull: bullScore, bear: Math.min(5, Math.max(0, 5 - bullScore)) };
}

function SessionInfo({
  detail,
  stage,
  agenda,
  streamError,
}: {
  detail: DebateDetail;
  stage: string | null;
  agenda: string[];
  streamError: string | null;
}) {
  const { session } = detail;
  const inFlight = session.status !== "completed" && session.status !== "failed";
  return (
    <div className="w-full md:w-4/12 flex flex-col gap-stack-md">
      <div className="bg-card-bg rounded-xl border border-card-border p-[20px] shadow-deep-soft flex flex-col gap-stack-md">
        <h2 className="text-headline-sm text-on-surface">세션 정보</h2>
        <dl className="grid grid-cols-2 gap-stack-sm text-body-sm">
          <dt className="text-on-surface-variant">종목</dt>
          <dd className="text-on-surface">
            {session.symbol_name} ({session.symbol})
          </dd>
          <dt className="text-on-surface-variant">주제</dt>
          <dd className="text-on-surface">{CATEGORY_LABEL[session.category]}</dd>
          <dt className="text-on-surface-variant">상태</dt>
          <dd className="text-on-surface">{statusLabel(session.status)}</dd>
          <dt className="text-on-surface-variant">시작</dt>
          <dd className="text-on-surface">{fmtStarted(session.started_at)}</dd>
        </dl>
        {inFlight && stage && (
          <div className="text-label-md text-primary bg-primary/10 border border-primary/30 rounded p-stack-sm">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">
              progress_activity
            </span>
            {stage}
          </div>
        )}
        {streamError && (
          <div className="text-label-md text-error bg-error-container/10 border border-error/30 rounded p-stack-sm">
            {streamError}
          </div>
        )}
      </div>

      {agenda.length > 0 && (
        <div className="bg-card-bg rounded-xl border border-card-border p-[20px] shadow-deep-soft flex flex-col gap-stack-sm">
          <h2 className="text-headline-sm text-on-surface">토론 주제</h2>
          <ol className="flex flex-col gap-1 list-decimal ml-5 text-body-sm text-on-surface">
            {agenda.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </div>
      )}

      <ParticipantsCardInline />
    </div>
  );
}

function fmtStarted(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "대기";
    case "running":
      return "진행 중";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    default:
      return status;
  }
}

function ParticipantsCardInline() {
  return (
    <div className="bg-card-bg rounded-xl border border-card-border p-[20px] shadow-deep-soft flex flex-col gap-stack-md">
      <h2 className="text-headline-sm text-on-surface">토론 참여자</h2>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-card-border bg-secondary-container/10">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span className="material-symbols-outlined text-[20px]">trending_up</span>
        </div>
        <div>
          <p className="text-label-md text-secondary">Bull AI</p>
          <p className="text-label-sm text-on-surface-variant">성장 전망 중심</p>
        </div>
      </div>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-card-border bg-error-container/10">
        <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
          <span className="material-symbols-outlined text-[20px]">trending_down</span>
        </div>
        <div>
          <p className="text-label-md text-error">Bear AI</p>
          <p className="text-label-sm text-on-surface-variant">리스크 요인 분석</p>
        </div>
      </div>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-card-border bg-surface-variant">
        <div className="w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-[20px]">gavel</span>
        </div>
        <div>
          <p className="text-label-md text-on-surface">Moderator AI</p>
          <p className="text-label-sm text-on-surface-variant">객관적 중재 및 요약</p>
        </div>
      </div>
    </div>
  );
}
