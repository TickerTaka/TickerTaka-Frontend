"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refreshWatchlist } from "@/lib/api/market";

export default function WatchlistRefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setHint("갱신 중…");
    try {
      const res = await refreshWatchlist();
      // 백그라운드 sync가 동작할 시간을 주고 그 후 server component 재실행
      // (가격 자체는 클라이언트 polling이라 즉시 보이지만, 뉴스·공시는 새로고침 후 갱신됨)
      setTimeout(() => {
        router.refresh();
        const total = res.symbols.length + res.skipped.length;
        if (res.symbols.length === 0 && res.skipped.length > 0) {
          setHint(`최근 갱신됨 (${res.skipped.length}건 스킵)`);
        } else {
          setHint(`갱신 시작 — ${res.symbols.length}/${total} 종목`);
        }
        setTimeout(() => setHint(null), 3000);
        setBusy(false);
      }, 800);
    } catch {
      setHint("갱신 실패");
      setTimeout(() => setHint(null), 2500);
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {hint && (
        <span className="text-label-sm text-on-surface-variant">{hint}</span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label="관심 종목 새로고침"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-btn border border-card-border text-label-sm text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span
          className={`material-symbols-outlined text-[16px] ${busy ? "animate-spin" : ""}`}
        >
          refresh
        </span>
        새로고침
      </button>
    </div>
  );
}
