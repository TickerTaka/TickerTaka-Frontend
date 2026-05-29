import HistoryTable from "@/components/debate/HistoryTable";
import { listDebateSessions } from "@/lib/api/debate";

export default async function ReportHistoryPage() {
  let sessions = [] as Awaited<ReturnType<typeof listDebateSessions>>;
  try {
    sessions = await listDebateSessions();
  } catch {
    sessions = [];
  }

  return (
    <div className="p-container-padding flex flex-col gap-stack-lg max-w-7xl mx-auto">
      <HistoryTable initialSessions={sessions} />
    </div>
  );
}
