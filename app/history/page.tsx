import HistoryTable from "@/components/debate/HistoryTable";
import { listDebateSessions } from "@/lib/api/debate";

interface PageProps {
  searchParams: Promise<{ symbol?: string }>;
}

export default async function ReportHistoryPage({ searchParams }: PageProps) {
  const { symbol } = await searchParams;
  let sessions = [] as Awaited<ReturnType<typeof listDebateSessions>>;
  try {
    sessions = await listDebateSessions();
  } catch {
    sessions = [];
  }

  // URL ?symbol=005930으로 들어오면 해당 종목만 노출. 같은 종목 토론이
  // 하나도 없으면 symbol_name fallback으로 코드만 보여준다.
  const filteredSessions = symbol
    ? sessions.filter((s) => s.symbol === symbol)
    : sessions;
  const focusedName = symbol
    ? (sessions.find((s) => s.symbol === symbol)?.symbol_name ?? symbol)
    : null;

  return (
    <div className="p-container-padding flex flex-col gap-stack-lg max-w-7xl mx-auto">
      <HistoryTable
        initialSessions={filteredSessions}
        focusedSymbol={symbol ?? null}
        focusedSymbolName={focusedName}
      />
    </div>
  );
}
