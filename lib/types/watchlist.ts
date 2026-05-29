// Mirrors backend schemas/watchlist.py

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  memo: string | null;
  created_at: string;
  ticker_name_kr: string | null;
}

export interface WatchlistCreateRequest {
  user_id: string;
  symbol: string;
  memo?: string | null;
}

export interface WatchlistCreateResponse {
  watchlist: WatchlistItem;
  sync_enqueued: boolean;
}

export interface WatchlistListResponse {
  items: WatchlistItem[];
}
