"use client";

import { useEffect, useState } from "react";
import DebateChat from "./DebateChat";
import DebateSummaryBlock from "./DebateSummaryBlock";
import { getDebateDetail } from "@/lib/api/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";
import type { DebateDetail } from "@/lib/types/debate";

interface Props {
  initial: DebateDetail;
}

export default function LiveDebateView({ initial }: Props) {
  const [detail, setDetail] = useState<DebateDetail>(initial);

  useEffect(() => {
    const isTerminal =
      detail.session.status === "completed" || detail.session.status === "failed";
    if (isTerminal) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const next = await getDebateDetail(detail.session.id);
        if (!cancelled) setDetail(next);
      } catch {
        /* ignore transient errors during streaming */
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [detail.session.id, detail.session.status]);

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-col md:flex-row gap-gutter">
        <SessionInfo detail={detail} />
        <div className="w-full md:w-8/12 h-[calc(100vh-220px)] min-h-[420px]">
          <DebateChat detail={detail} />
        </div>
      </div>
      <DebateSummaryBlock detail={detail} />
    </div>
  );
}

function SessionInfo({ detail }: { detail: DebateDetail }) {
  const { session } = detail;
  return (
    <div className="w-full md:w-4/12 flex flex-col gap-stack-md">
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-[20px] shadow-deep-soft flex flex-col gap-stack-md">
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
      </div>
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
    case "pending": return "대기";
    case "running": return "진행 중";
    case "completed": return "완료";
    case "failed": return "실패";
    default: return status;
  }
}

function ParticipantsCardInline() {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-[20px] shadow-deep-soft flex flex-col gap-stack-md">
      <h2 className="text-headline-sm text-on-surface">토론 참여자</h2>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-[#334155] bg-secondary-container/10">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span className="material-symbols-outlined text-[20px]">trending_up</span>
        </div>
        <div>
          <p className="text-label-md text-secondary">Bull AI</p>
          <p className="text-label-sm text-on-surface-variant">성장 전망 중심</p>
        </div>
      </div>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-[#334155] bg-error-container/10">
        <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
          <span className="material-symbols-outlined text-[20px]">trending_down</span>
        </div>
        <div>
          <p className="text-label-md text-error">Bear AI</p>
          <p className="text-label-sm text-on-surface-variant">리스크 요인 분석</p>
        </div>
      </div>
      <div className="flex items-center gap-stack-md p-stack-sm rounded-lg border border-[#334155] bg-surface-variant">
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
