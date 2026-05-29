import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockDetail, getStockNews } from "@/lib/api/market";
import type { NewsItem, StockDetail } from "@/lib/types/market";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

function fmtNum(n: number | null, suffix = "") {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ko-KR") + suffix;
}

function fmtPct(n: number | null) {
  if (n === null || n === undefined) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
}

function fmtMoney(n: number | null) {
  if (n === null || n === undefined) return "—";
  const eok = n / 1_0000_0000;
  if (Math.abs(eok) >= 10000) return (eok / 10000).toFixed(1) + "조";
  if (Math.abs(eok) >= 1) return eok.toFixed(0) + "억";
  return n.toLocaleString("ko-KR");
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;

  let stock: StockDetail;
  let news: NewsItem[] = [];
  try {
    stock = await getStockDetail(symbol);
  } catch {
    notFound();
  }
  try {
    news = await getStockNews(symbol, 20);
  } catch {
    news = [];
  }

  const price = stock.latest_price;
  const fin = stock.latest_financial;
  const tech = stock.latest_technical;

  const changeRate = price?.change_rate ?? null;
  const isUp = (changeRate ?? 0) >= 0;
  const close = price?.close ?? null;
  const changeAbs =
    close !== null && changeRate !== null
      ? close - close / (1 + changeRate / 100)
      : null;

  return (
    <div className="p-container-padding flex flex-col gap-stack-lg">
      {/* Header */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary">관심 종목</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{stock.name_kr}</span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-headline-lg text-on-surface tracking-tight">{stock.name_kr}</h1>
              <span className="px-2 py-0.5 rounded text-label-sm bg-surface-container border border-outline-variant text-on-surface-variant">
                {stock.symbol}
              </span>
              <span className="px-2 py-0.5 rounded text-label-sm bg-surface-container border border-outline-variant text-on-surface-variant">
                {stock.market}
              </span>
              {stock.sector && (
                <span className="px-2 py-0.5 rounded text-label-sm bg-surface-container border border-outline-variant text-on-surface-variant">
                  {stock.sector}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className={`text-display-lg ${isUp ? "text-secondary" : "text-error"}`}>
                {close !== null ? close.toLocaleString("ko-KR") + "원" : "—"}
              </span>
              <div className="flex flex-col">
                <span className={`text-headline-sm flex items-center gap-1 ${isUp ? "text-secondary" : "text-error"}`}>
                  {changeRate !== null ? (
                    <>
                      {isUp ? "▲" : "▼"} {changeAbs !== null ? Math.abs(Math.round(changeAbs)).toLocaleString("ko-KR") : ""} ({fmtPct(changeRate)})
                    </>
                  ) : "—"}
                </span>
                {price?.date && (
                  <span className="text-label-sm text-outline-variant mt-1">{price.date} 기준</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link
              href="/history"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn border border-primary text-primary text-label-md hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              토론 기록
            </Link>
            <Link
              href="/debate"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn bg-[#3B82F6] text-white text-label-md hover:bg-blue-600 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">forum</span>
              AI 토론 시작
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Core financials */}
        <div className="col-span-12 lg:col-span-6 bg-[#1E293B] rounded-xl border border-[#334155] p-5 flex flex-col gap-4 shadow-deep-soft">
          <div className="flex justify-between items-center">
            <h2 className="text-headline-sm text-on-surface">핵심 재무 지표</h2>
            {fin?.fiscal_year && (
              <span className="text-label-sm text-on-surface-variant">
                {fin.fiscal_year}
                {fin.fiscal_quarter ? ` Q${fin.fiscal_quarter}` : ""} 기준
              </span>
            )}
          </div>
          {fin ? (
            <div className="grid grid-cols-2 gap-3">
              <FinCard label="PER (주가수익비율)" value={fmtNum(fin.per, "x")} />
              <FinCard label="PBR (주가순자산비율)" value={fmtNum(fin.pbr, "x")} />
              <FinCard label="ROE (자기자본이익률)" value={fmtNum(fin.roe, "%")} />
              <FinCard label="부채비율" value={fmtNum(fin.debt_ratio, "%")} />
              <FinCard label="매출액" value={fmtMoney(fin.revenue)} />
              <FinCard label="영업이익" value={fmtMoney(fin.operating_profit)} />
              <FinCard label="당기순이익" value={fmtMoney(fin.net_income)} />
              <FinCard label="자기자본" value={fmtMoney(fin.total_equity)} />
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">재무 데이터가 아직 수집되지 않았습니다.</p>
          )}
        </div>

        {/* Tech indicators */}
        <div className="col-span-12 lg:col-span-6 bg-[#1E293B] rounded-xl border border-[#334155] p-5 shadow-deep-soft">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-sm text-on-surface">기술 지표</h2>
            {tech?.date && <span className="text-label-sm text-on-surface-variant">{tech.date} 기준</span>}
          </div>
          {tech ? (
            <div className="flex flex-col gap-3">
              <TechRow label="RSI (14)" value={fmtNum(tech.rsi14)} />
              <TechRow label="MACD" value={fmtNum(tech.macd)} />
              <TechRow label="MACD Signal" value={fmtNum(tech.macd_signal)} />
              <TechRow label="20일 이동평균" value={fmtNum(tech.ma20, "원")} />
              <TechRow label="60일 이동평균" value={fmtNum(tech.ma60, "원")} />
              <TechRow label="120일 이동평균" value={fmtNum(tech.ma120, "원")} />
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">기술 지표가 아직 수집되지 않았습니다.</p>
          )}
        </div>

        {/* News */}
        <div className="col-span-12 bg-[#1E293B] rounded-xl border border-[#334155] shadow-deep-soft overflow-hidden">
          <div className="p-5 border-b border-[#334155] flex justify-between items-center">
            <h2 className="text-headline-sm text-on-surface">최신 뉴스</h2>
          </div>
          {news.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-on-surface-variant">수집된 뉴스가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E293B]">
                    <th className="py-3 px-5 text-label-md text-on-surface-variant font-medium border-b border-[#334155] w-[140px]">날짜</th>
                    <th className="py-3 px-5 text-label-md text-on-surface-variant font-medium border-b border-[#334155]">제목</th>
                    <th className="py-3 px-5 text-label-md text-on-surface-variant font-medium border-b border-[#334155] w-[120px]">출처</th>
                  </tr>
                </thead>
                <tbody className="text-body-md">
                  {news.map((n) => (
                    <tr key={n.id} className="border-b border-[#334155] hover:bg-[#334155]/30 transition-colors group">
                      <td className="py-3 px-5 text-on-surface-variant whitespace-nowrap">
                        {n.published_at ? new Date(n.published_at).toLocaleDateString("ko-KR") : "—"}
                      </td>
                      <td className="py-3 px-5 text-on-surface group-hover:text-primary transition-colors">
                        <a href={n.source_url} target="_blank" rel="noopener noreferrer">{n.title}</a>
                      </td>
                      <td className="py-3 px-5 text-on-surface-variant">{n.source_name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/50 flex flex-col justify-center">
      <span className="text-label-sm text-on-surface-variant mb-1">{label}</span>
      <span className="text-headline-sm text-on-surface">{value}</span>
    </div>
  );
}

function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/30">
      <span className="text-label-md text-on-surface">{label}</span>
      <span className="text-body-md text-on-surface-variant">{value}</span>
    </div>
  );
}
