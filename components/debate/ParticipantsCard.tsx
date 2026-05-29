export default function ParticipantsCard() {
  return (
    <div className="bg-card-bg rounded-xl border border-card-border p-[20px] shadow-deep-soft flex flex-col gap-stack-md flex-1">
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
