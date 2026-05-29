import type { AgentStatement } from "@/lib/types/debate";

const ROLE_STYLE: Record<
  AgentStatement["agent_role"],
  { side: "left" | "right" | "center"; bgClass: string; icon: string; label: string; textColor: string }
> = {
  bull: {
    side: "left",
    bgClass: "bg-card-bg border-positive",
    icon: "trending_up",
    label: "Bull AI",
    textColor: "text-secondary",
  },
  bear: {
    side: "right",
    bgClass: "bg-card-bg border-negative",
    icon: "trending_down",
    label: "Bear AI",
    textColor: "text-error",
  },
  moderator: {
    side: "center",
    bgClass: "bg-surface-variant border-outline-variant",
    icon: "gavel",
    label: "Moderator AI",
    textColor: "text-on-surface",
  },
  system: {
    side: "center",
    bgClass: "bg-surface-container border-outline-variant",
    icon: "info",
    label: "System",
    textColor: "text-on-surface-variant",
  },
};

export default function AgentBubble({ statement }: { statement: AgentStatement }) {
  const style = ROLE_STYLE[statement.agent_role];

  if (style.side === "center") {
    return (
      <div className="flex justify-center">
        <div className={`${style.bgClass} border rounded-lg p-stack-md max-w-[80%] text-center`}>
          <p className="text-body-sm text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">
              {style.icon}
            </span>
            {style.label}
          </p>
          <p className="text-body-md text-on-surface">{statement.content}</p>
        </div>
      </div>
    );
  }

  const isRight = style.side === "right";
  return (
    <div
      className={`flex gap-stack-sm max-w-[85%] ${isRight ? "self-end flex-row-reverse" : "self-start"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isRight ? "bg-error-container" : "bg-secondary-container"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[16px] ${
            isRight ? "text-on-error-container" : "text-on-secondary-container"
          }`}
        >
          {style.icon}
        </span>
      </div>
      <div
        className={`${style.bgClass} border rounded-2xl p-stack-md shadow-sm ${
          isRight ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
      >
        <p
          className={`text-label-sm mb-1 ${style.textColor} ${
            isRight ? "text-right" : ""
          }`}
        >
          {style.label}
        </p>
        <p className="text-body-md text-on-surface mb-stack-sm">{statement.content}</p>
        {(statement.evidence_count > 0 || statement.evidences.length > 0) && (
          <div className={`flex ${isRight ? "justify-end" : ""}`}>
            <div className="flex items-center gap-1 text-label-sm text-on-surface-variant bg-canvas-bg px-2 py-1 rounded inline-flex">
              <span className="material-symbols-outlined text-[14px]">description</span>
              <span>
                {statement.evidences[0]?.source_label
                  ? `Source: ${statement.evidences[0].source_label}`
                  : `근거 ${statement.evidence_count}건`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
