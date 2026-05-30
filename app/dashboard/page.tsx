import Link from "next/link";
import AddWatchlistCard from "@/components/stock/AddWatchlistCard";
import WatchlistTable from "@/components/stock/WatchlistTable";
import { listWatchlist } from "@/lib/api/watchlist";
import { getDashboardStats, getWatchlistFeed } from "@/lib/api/market";
import type { WatchlistItem } from "@/lib/types/watchlist";
import type { DashboardStats, WatchlistFeedItem } from "@/lib/types/market";

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default async function DashboardPage() {
  let watchlist: WatchlistItem[] = [];
  let watchlistError: string | null = null;
  let feed: WatchlistFeedItem[] = [];
  let stats: DashboardStats | null = null;

  const [wl, fd, st] = await Promise.allSettled([
    listWatchlist(),
    getWatchlistFeed(20),
    getDashboardStats(),
  ]);
  if (wl.status === "fulfilled") watchlist = wl.value;
  else watchlistError = wl.reason instanceof Error ? wl.reason.message : "관심 종목을 불러오지 못했습니다";
  if (fd.status === "fulfilled") feed = fd.value;
  if (st.status === "fulfilled") stats = st.value;

  const runningCount =
    stats != null ? Math.max(0, stats.debate_session_count - stats.completed_debate_count) : 0;

  return (
    <div className="p-container-padding flex flex-col gap-gutter">
      <header>
        <h2 className="text-headline-lg text-on-surface">Dashboard</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Watchlist */}
          <div className="bg-card-bg border border-card-border rounded-card shadow-deep-soft flex flex-col overflow-hidden">
            <div className="p-5 border-b border-card-border flex justify-between items-center bg-surface-container-high">
              <h3 className="text-headline-sm text-on-surface flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">visibility</span>
                관심 종목
              </h3>
              <span className="text-label-sm text-on-surface-variant">{watchlist.length}건</span>
            </div>
            {watchlistError && <div className="p-4 text-body-sm text-error">{watchlistError}</div>}
            {!watchlistError && <WatchlistTable initialItems={watchlist} />}
          </div>

          {/* Recent news */}
          <div className="bg-card-bg border border-card-border rounded-card shadow-deep-soft flex flex-col">
            <div className="p-5 border-b border-card-border flex justify-between items-center">
              <h3 className="text-headline-sm text-on-surface flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">article</span>
                관심 종목 뉴스·공시
              </h3>
              <span className="text-label-sm text-on-surface-variant">{feed.length}건</span>
            </div>
            {watchlist.length === 0 ? (
              <div className="p-6 text-center text-body-sm text-on-surface-variant">
                관심 종목을 추가하면 해당 종목의 뉴스와 공시가 여기에 표시됩니다.
              </div>
            ) : feed.length === 0 ? (
              <div className="p-6 text-center text-body-sm text-on-surface-variant">
                아직 수집된 뉴스·공시가 없습니다. 잠시 후 다시 확인해 주세요.
              </div>
            ) : (
              <ul className="divide-y divide-card-border/50">
                {feed.map((f) => (
                  <li key={`${f.kind}-${f.id}`} className="p-4 hover:bg-card-border/20 transition-colors group flex gap-4">
                    <Link
                      href={`/stock/${f.symbol}`}
                      className="flex-shrink-0 w-10 h-10 rounded bg-canvas-bg border border-card-border flex items-center justify-center text-label-md text-primary font-bold hover:bg-primary/10"
                      title={f.symbol_name ?? f.symbol}
                    >
                      {(f.symbol_name ?? f.symbol).slice(0, 2)}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-label-sm px-1.5 py-0.5 rounded font-semibold ${
                              f.kind === "filing"
                                ? "text-tertiary bg-tertiary/10"
                                : "text-primary-btn bg-primary-btn/10"
                            }`}
                          >
                            {f.kind === "filing" ? "공시" : "뉴스"}
                          </span>
                          <span className="text-label-sm text-on-surface-variant truncate">
                            {f.symbol_name ?? f.symbol} · {f.source_name ?? "—"}
                          </span>
                        </div>
                        <span className="text-label-sm text-outline-variant shrink-0">
                          {relativeTime(f.published_at)}
                        </span>
                      </div>
                      <a
                        href={f.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-md text-on-surface group-hover:text-primary transition-colors line-clamp-2"
                      >
                        {f.title}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <AddWatchlistCard />

          {/* AI Debate status */}
          <div className="bg-card-bg border border-card-border rounded-card shadow-deep-soft p-5 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            <h3 className="text-headline-sm text-on-surface mb-5 flex items-center relative z-10">
              <span className="material-symbols-outlined mr-2 text-primary">forum</span>
              AI 토론 현황
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-canvas-bg border border-card-border rounded-lg p-3 text-center">
                <div className="text-display-lg text-primary mb-1">{runningCount}</div>
                <div className="text-label-sm text-on-surface-variant">진행 중</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-canvas-bg border border-card-border rounded-lg p-2 px-3 flex justify-between items-center">
                  <span className="text-label-sm text-on-surface-variant">완료</span>
                  <span className="text-body-md font-bold text-on-surface">{stats?.completed_debate_count ?? 0}</span>
                </div>
                <div className="bg-canvas-bg border border-card-border rounded-lg p-2 px-3 flex justify-between items-center">
                  <span className="text-label-sm text-on-surface-variant">전체 세션</span>
                  <span className="text-body-md font-bold text-on-surface">{stats?.debate_session_count ?? 0}</span>
                </div>
              </div>
            </div>
            <Link
              href="/debate"
              className="inline-flex items-center justify-center w-full bg-primary-btn/10 hover:bg-primary-btn text-primary hover:text-white border border-primary-btn/50 hover:border-primary-btn py-2.5 rounded-btn text-body-sm font-medium transition-all duration-300 relative z-10"
            >
              토론 시작하기
              <span className="material-symbols-outlined text-[18px] ml-2 transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
