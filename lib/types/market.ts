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

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

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
  // Sentiment analysis (FinBERT + Qwen). Null while the worker hasn't filled it yet.
  sentiment: Sentiment | null;
  impact_score: number | null;       // -2..+2
  confidence: number | null;          // 0..1
  event_type: string | null;
  analysis_summary: string | null;
  key_points: string[];
  risks: string[];
  evidence: string[];
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

// 백엔드 /api/stocks/{symbol}/quote — yfinance 기반 지연 현재가 스냅샷.
// Redis TTL: 장중 5분 / 장외 30분 / 주말 24h. is_delayed=true면 ~15분 지연 라벨 권장.
export interface QuoteResponse {
  symbol: string;
  price: number;
  prev_close: number | null;
  change: number | null;
  change_rate: number | null;
  volume: number | null;
  source: string;
  is_delayed: boolean;
  ts: string;
}

// 백엔드 /api/watchlists/{user_id}/refresh — 비차단 새로고침 응답.
// 실제 sync는 백그라운드로 진행, 즉시 어떤 종목이 큐잉됐는지/스킵됐는지 알려준다.
export interface WatchlistRefreshResponse {
  status: string;
  symbols: string[];
  skipped: string[];
}
