import { DEFAULT_USER_ID, apiGet, isMockMode } from "@/lib/api/client";
import type {
  DashboardStats,
  FilingItem,
  MarketIndexItem,
  NewsItem,
  StockDetail,
  StockPrices,
  TickerSearchItem,
  WatchlistFeedItem,
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
