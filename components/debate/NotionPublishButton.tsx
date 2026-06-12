"use client";

import { useEffect, useRef, useState } from "react";
import { getDebateDetail, publishDebateToNotion } from "@/lib/api/debate";

interface Props {
  sessionId: string;
  initialUrl: string | null;
  disabled?: boolean; // true while debate is still running / failed
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export default function NotionPublishButton({ sessionId, initialUrl, disabled }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  // optimistic: flipped to true the moment the user clicks, so the button
  // immediately shows "저장 완료" without waiting for the backend response.
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  function onPublish() {
    // Immediate optimistic feedback — no waiting.
    setSubmitted(true);
    setError(null);

    // Background polling: the moment the backend stamps notion_page_url
    // we promote the button into a real "노션에서 열기" link.
    const startedAt = Date.now();
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const detail = await getDebateDetail(sessionId);
        if (detail.session.notion_page_url) {
          stopPolling();
          setUrl(detail.session.notion_page_url);
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          stopPolling();
          // After timeout, surface a soft hint but keep the "저장 완료" state —
          // the user can refresh to pick up the URL if it eventually appeared.
          setError("링크 확인이 늦어집니다. 새로고침해 보세요.");
        }
      } catch {
        /* ignore transient errors */
      }
    }, POLL_INTERVAL_MS);

    // Fire and forget — the polling above is the source of truth for the URL.
    publishDebateToNotion(sessionId)
      .then((res) => {
        if (res.notion_page_url) {
          stopPolling();
          setUrl(res.notion_page_url);
        }
      })
      .catch(() => {
        // Swallow — connection often drops while the backend keeps working.
        // The poller will catch the URL when the backend writes it.
      });
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-primary/40 bg-primary/10 text-primary text-label-md font-semibold hover:bg-primary/15 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        노션에서 열기
      </a>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-secondary/15 border border-secondary/40 text-secondary text-label-md font-semibold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          저장 완료
        </span>
        {error && <p className="text-label-sm text-on-surface-variant">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onPublish}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-primary-btn text-white text-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        title={disabled ? "토론이 완료되어야 저장할 수 있습니다" : "이 리포트를 노션에 저장"}
      >
        <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
        노션에 저장
      </button>
    </div>
  );
}
