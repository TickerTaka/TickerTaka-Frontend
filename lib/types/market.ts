// Mirrors backend app/schemas/market_data.py

export interface TickerSearchItem {
  symbol: string;
  name_kr: string;
  name_en: string | null;
  market: string;
  sector: string | null;
  industry: string | null;
}

export interface PricePoint {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  adjusted_close: number | null;
  volume: number | null;
  change_rate: number | null;
}

export interface FinancialSnapshot {
  fiscal_year: number;
  fiscal_quarter: number | null;
  revenue: number | null;
  operating_profit: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_liabilities: number | null;
  total_equity: number | null;
  per: number | null;
  pbr: number | null;
  roe: number | null;
  debt_ratio: number | null;
}

export interface TechnicalSnapshot {
  date: string;
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  rsi14: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  volume_ma20: number | null;
}

export interface StockDetail {
  symbol: string;
  name_kr: string;
  name_en: string | null;
  market: string;
  sector: string | null;
  industry: string | null;
  currency: string | null;
  latest_price: PricePoint | null;
  latest_financial: FinancialSnapshot | null;
  latest_technical: TechnicalSnapshot | null;
}

export interface StockPrices {
  symbol: string;
  prices: PricePoint[];
}

export interface FilingItem {
  id: string;
  symbol: string;
  filing_title: string;
  filing_type: string | null;
  summary: string | null;
  source_url: string;
  disclosed_at: string | null;
  retrieved_at: string;
}

export interface WatchlistFeedItem {
  id: string;
  symbol: string;
  symbol_name: string | null;
  kind: "news" | "filing";
  title: string;
  summary: string | null;
  source_name: string | null;
  source_url: string;
  published_at: string | null;
}

export interface NewsItem {
  id: string;
  symbol: string;
  title: string;
  summary: string | null;
  source_name: string | null;
  source_url: string;
  published_at: string | null;
  retrieved_at: string;
}

export interface MarketIndexItem {
  market: string;
  name: string;
  average_change_rate: number | null;
  advancers: number;
  decliners: number;
  unchanged: number;
  constituents: number;
}

export interface DashboardStats {
  ticker_count: number;
  active_ticker_count: number;
  news_count: number;
  debate_session_count: number;
  completed_debate_count: number;
  latest_news_at: string | null;
  latest_price_date: string | null;
}

export interface DebateListItem {
  session_id: string;
  user_id: string;
  symbol: string;
  symbol_name: string | null;
  category: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  summary_content: string | null;
}
