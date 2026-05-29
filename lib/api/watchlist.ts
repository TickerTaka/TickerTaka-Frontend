import { DEFAULT_USER_ID, apiDelete, apiGet, apiPost, isMockMode } from "@/lib/api/client";
import type {
  WatchlistCreateRequest,
  WatchlistCreateResponse,
  WatchlistItem,
  WatchlistListResponse,
} from "@/lib/types/watchlist";

const MOCK_ITEMS: WatchlistItem[] = [
  {
    id: "wl-mock-1",
    user_id: DEFAULT_USER_ID,
    symbol: "005930",
    memo: null,
    created_at: new Date().toISOString(),
    ticker_name_kr: "삼성전자",
  },
  {
    id: "wl-mock-2",
    user_id: DEFAULT_USER_ID,
    symbol: "000660",
    memo: null,
    created_at: new Date().toISOString(),
    ticker_name_kr: "SK하이닉스",
  },
];

export async function listWatchlist(
  userId: string = DEFAULT_USER_ID,
): Promise<WatchlistItem[]> {
  if (isMockMode()) return MOCK_ITEMS;
  const res = await apiGet<WatchlistListResponse>(`/api/watchlists/${userId}`);
  return res.items;
}

export async function createWatchlist(
  symbol: string,
  memo?: string | null,
  userId: string = DEFAULT_USER_ID,
): Promise<WatchlistCreateResponse> {
  const payload: WatchlistCreateRequest = { user_id: userId, symbol, memo: memo ?? null };
  if (isMockMode()) {
    const item: WatchlistItem = {
      id: `wl-mock-${Date.now()}`,
      user_id: userId,
      symbol,
      memo: memo ?? null,
      created_at: new Date().toISOString(),
      ticker_name_kr: null,
    };
    MOCK_ITEMS.unshift(item);
    return { watchlist: item, sync_enqueued: true };
  }
  return apiPost<WatchlistCreateRequest, WatchlistCreateResponse>(
    "/api/watchlists",
    payload,
  );
}

export async function deleteWatchlist(
  symbol: string,
  userId: string = DEFAULT_USER_ID,
): Promise<void> {
  if (isMockMode()) {
    const idx = MOCK_ITEMS.findIndex((i) => i.symbol === symbol);
    if (idx >= 0) MOCK_ITEMS.splice(idx, 1);
    return;
  }
  await apiDelete(`/api/watchlists/${userId}/${encodeURIComponent(symbol)}`);
}
