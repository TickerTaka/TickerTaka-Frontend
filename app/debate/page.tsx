import Link from "next/link";
import DebateSetup from "@/components/debate/DebateSetup";
import ParticipantsCard from "@/components/debate/ParticipantsCard";
import { listDebateSessions, listTickers } from "@/lib/api/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";

export default async function DebateIndexPage() {
  const [tickers, sessions] = await Promise.all([
    listTickers(),
    listDebateSessions(),
  ]);

  const recent = sessions.slice(0, 5);

  return (
    <div className="p-container-padding flex flex-col md:flex-row gap-gutter">
      <div className="w-full md:w-4/12 flex flex-col gap-stack-md">
        <DebateSetup tickers={tickers} />
        <ParticipantsCard />
      </div>

      <div className="w-full md:w-8/12 flex flex-col gap-stack-md">
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] shadow-deep-soft">
          <div className="p-[20px] border-b border-[#334155]">
            <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">forum</span>
              최근 토론 세션
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              좌측에서 종목과 주제를 골라 새 토론을 시작하거나, 아래에서 기존 세션을 이어 보세요.
            </p>
          </div>
          <ul className="divide-y divide-[#334155]/50">
            {recent.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/debate/${s.id}`}
                  className="flex items-center justify-between p-4 hover:bg-[#334155]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-canvas-bg border border-card-border flex items-center justify-center text-label-md text-primary font-bold">
                      {s.symbol_name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-body-md text-on-surface font-semibold">
                        {s.symbol_name}{" "}
                        <span className="text-on-surface-variant text-label-sm">
                          {s.symbol}
                        </span>
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {CATEGORY_LABEL[s.category]} · {new Date(s.started_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    chevron_right
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
