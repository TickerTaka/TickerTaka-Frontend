import AgentBubble from "./AgentBubble";
import type { DebateDetail } from "@/lib/types/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";

export default function DebateChat({ detail }: { detail: DebateDetail }) {
  const { session, statements } = detail;
  const isCompleted = session.status === "completed";
  const isFailed = session.status === "failed";
  const lastRole = statements[statements.length - 1]?.agent_role;
  const nextSpeaker: "bull" | "bear" = lastRole === "bull" ? "bear" : "bull";
  const waitingLabel =
    nextSpeaker === "bull" ? "강세론 분석 중" : "약세론 분석 중";

  return (
    <div className="bg-card-bg rounded-xl border border-card-border shadow-deep-soft flex flex-col h-full overflow-hidden">
      <div className="p-[20px] border-b border-card-border flex justify-between items-center bg-surface-container-high z-10">
        <div className="flex items-center gap-stack-sm flex-wrap">
          <h2 className="text-headline-md text-on-surface flex items-center gap-1">
            <span className="material-symbols-outlined text-primary">forum</span>
            AI 토론
          </h2>
          <div className="flex gap-1 ml-stack-sm flex-wrap">
            <span className="px-2 py-0.5 rounded bg-surface-variant text-body-sm border border-outline-variant">
              {session.symbol_name}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-variant text-body-sm border border-outline-variant">
              {CATEGORY_LABEL[session.category]}
            </span>
            <span
              className={`px-2 py-0.5 rounded border text-body-sm ${
                isCompleted
                  ? "bg-secondary-container/20 text-secondary border-secondary-container/50"
                  : isFailed
                    ? "bg-error-container/20 text-error border-error/50"
                    : "bg-primary-container/20 text-primary border-primary-container/50"
              }`}
            >
              {isCompleted ? "완료" : isFailed ? "실패" : "진행 중"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-stack-lg scrollbar-hide bg-canvas-bg relative">
        <div className="flex flex-col gap-stack-md">
          {statements.map((s) => (
            <AgentBubble key={s.id} statement={s} />
          ))}
        </div>

        {!isCompleted && !isFailed && (
          <div className="flex gap-stack-sm self-start mt-stack-md">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                nextSpeaker === "bull" ? "bg-secondary-container" : "bg-error-container"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[16px] animate-pulse ${
                  nextSpeaker === "bull" ? "text-on-secondary-container" : "text-on-error-container"
                }`}
              >
                {nextSpeaker === "bull" ? "trending_up" : "trending_down"}
              </span>
            </div>
            <div className="bg-card-bg border border-card-border rounded-full px-4 py-2 flex items-center text-body-sm text-on-surface-variant">
              {waitingLabel}<span className="typing-dots" />
            </div>
          </div>
        )}

        {isFailed && (
          <div className="self-center mt-stack-md max-w-[80%] bg-error-container/10 border border-error/30 rounded-lg p-stack-md text-center">
            <p className="text-body-md text-error font-semibold mb-1">토론 실행 실패</p>
            <p className="text-body-sm text-on-surface-variant">
              LLM 호출 또는 데이터 수집 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
