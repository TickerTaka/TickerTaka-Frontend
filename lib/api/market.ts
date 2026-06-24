import { DEFAULT_USER_ID, apiGet, apiPost, isMockMode } from "@/lib/api/client";
import type {
  DashboardStats,
  FilingItem,
  MarketIndexItem,
  NewsItem,
  QuoteResponse,
  StockDetail,
  StockPrices,
  TickerSearchItem,
  WatchlistFeedItem,
  WatchlistRefreshResponse,
} from "@/lib/types/market";

interface Wrapped<T> {
  items: T;
}

export async function searchTickers(q = "", limit = 20): Promise<TickerSearchItem[]> {
  if (isMockMode()) return [];
  const res = await apiGet<Wrapped<TickerSearchItem[]>>(
    `/api/tickers?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
  return res.items;
}

export async function getStockDetail(symbol: string): Promise<StockDetail> {
  return apiGet<StockDetail>(`/api/stocks/${encodeURIComponent(symbol)}`);
}

// 지연 현재가 (yfinance + Redis 캐시). 일봉이 아닌 "지금" 가격이 필요할 때.
export async function getStockQuote(symbol: string): Promise<QuoteResponse> {
  return apiGet<QuoteResponse>(`/api/stocks/${encodeURIComponent(symbol)}/quote`);
}

// 관심종목 전체 새로고침 (비차단). throttle 윈도우 안 종목은 skipped로 반환.
export async function refreshWatchlist(
  userId: string = DEFAULT_USER_ID,
): Promise<WatchlistRefreshResponse> {
  if (isMockMode()) {
    return { status: "refreshing", symbols: [], skipped: [] };
  }
  return apiPost<Record<string, never>, WatchlistRefreshResponse>(
    `/api/watchlists/${userId}/refresh`,
    {} as Record<string, never>,
  );
}

// 관심종목 한 개만 새로고침.
export async function refreshWatchlistSymbol(
  symbol: string,
  userId: string = DEFAULT_USER_ID,
): Promise<WatchlistRefreshResponse> {
  if (isMockMode()) {
    return { status: "refreshing", symbols: [symbol], skipped: [] };
  }
  return apiPost<Record<string, never>, WatchlistRefreshResponse>(
    `/api/watchlists/${userId}/${encodeURIComponent(symbol)}/refresh`,
    {} as Record<string, never>,
  );
}

export async function getStockPrices(symbol: string, limit = 260): Promise<StockPrices> {
  return apiGet<StockPrices>(
    `/api/stocks/${encodeURIComponent(symbol)}/prices?limit=${limit}`,
  );
}

export async function getStockNews(symbol: string, limit = 20): Promise<NewsItem[]> {
  const res = await apiGet<Wrapped<NewsItem[]>>(
    `/api/stocks/${encodeURIComponent(symbol)}/news?limit=${limit}`,
  );
  return res.items;
}

export async function getRecentNews(limit = 10): Promise<NewsItem[]> {
  if (isMockMode()) return [];
  const res = await apiGet<Wrapped<NewsItem[]>>(`/api/news/recent?limit=${limit}`);
  return res.items;
}

export async function getMarketIndexes(): Promise<MarketIndexItem[]> {
  if (isMockMode()) return [];
  const res = await apiGet<Wrapped<MarketIndexItem[]>>(`/api/market/indexes`);
  return res.items;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  if (isMockMode()) return null;
  return apiGet<DashboardStats>(`/api/dashboard/stats`);
}

export async function getStockFilings(symbol: string, limit = 20): Promise<FilingItem[]> {
  const res = await apiGet<Wrapped<FilingItem[]>>(
    `/api/stocks/${encodeURIComponent(symbol)}/filings?limit=${limit}`,
  );
  return res.items;
}

export async function getWatchlistFeed(
  limit = 20,
  userId: string = DEFAULT_USER_ID,
): Promise<WatchlistFeedItem[]> {
  if (isMockMode()) return [];
  try {
    const res = await apiGet<Wrapped<WatchlistFeedItem[]>>(
      `/api/watchlists/${userId}/feed?limit=${limit}`,
    );
    return res.items;
  } catch {
    return [];
  }
}
