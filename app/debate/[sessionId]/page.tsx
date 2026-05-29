import Link from "next/link";
import { notFound } from "next/navigation";
import LiveDebateView from "@/components/debate/LiveDebateView";
import { getDebateDetail } from "@/lib/api/debate";
import { CATEGORY_LABEL } from "@/lib/types/debate";
import type { DebateDetail } from "@/lib/types/debate";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function DebateSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  let detail: DebateDetail;
  try {
    detail = await getDebateDetail(sessionId);
  } catch {
    notFound();
  }
  const { session } = detail;

  return (
    <div className="p-container-padding flex flex-col gap-stack-md">
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/debate" className="hover:text-primary">
          AI Debate
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">
          {session.symbol_name} · {CATEGORY_LABEL[session.category]}
        </span>
      </div>

      <LiveDebateView initial={detail} />
    </div>
  );
}
