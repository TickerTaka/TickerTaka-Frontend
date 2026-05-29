// Mock market & stock data. When backend is wired, replace consumers with
// lib/api/market.ts using the same shapes.

export interface MarketIndex {
  label: string;
  value: string;
  changePct: number | null; // null = flat
}

export interface WatchlistEntry {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  ingestStatus: "done" | "ingesting" | "error";
}

export interface NewsItem {
  id: string;
  symbol: string;
  symbolLabel: string;
  kind: "news" | "filing";
  title: string;
  source: string;
  publishedAt: string; // ISO
}

export interface StockSummary {
  symbol: string;
  name: string;
  market: "KOSPI" | "KOSDAQ";
  price: number;
  changeAbs: number;
  changePct: number;
  updatedAt: string;
  week52Low: number;
  week52High: number;
  financials: {
    per: number;
    perPeer: number;
    pbr: number;
    roe: number;
    roeDeltaPp: number;
    opMargin: number;
    marketCap: string;
    debtRatio: number;
  };
  technicals: {
    rsi: { value: number; signal: "Neutral" | "Buy" | "Sell" };
    macd: { value: string; signal: "Neutral" | "Buy" | "Sell" };
    bollinger: { value: string; signal: "Neutral" | "Buy" | "Sell" };
    volume: { value: string; signal: "Focus" | "Neutral" };
  };
  debateSummary: string;
  debateSentimentPct: number;
  debateParticipants: number;
}

export const MARKET_INDEXES: MarketIndex[] = [
  { label: "KOSPI", value: "2,645.32", changePct: 0.82 },
  { label: "KOSDAQ", value: "842.17", changePct: -0.34 },
  { label: "USD/KRW", value: "1,378.50", changePct: null },
  { label: "국고채 3Y", value: "3.12%", changePct: 0.03 },
];

export const WATCHLIST: WatchlistEntry[] = [
  { symbol: "005930", name: "삼성전자", price: 71400, changePct: 1.24, ingestStatus: "done" },
  { symbol: "000660", name: "SK하이닉스", price: 189500, changePct: -0.53, ingestStatus: "done" },
  { symbol: "035420", name: "NAVER", price: 198000, changePct: 2.14, ingestStatus: "ingesting" },
];

export const NEWS_FEED: NewsItem[] = [
  {
    id: "n1",
    symbol: "005930",
    symbolLabel: "삼성",
    kind: "news",
    title: "[삼성전자] 3분기 잠정 실적 발표... 영업이익 시장 컨센서스 상회",
    source: "한국경제",
    publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "n2",
    symbol: "000660",
    symbolLabel: "SK하",
    kind: "news",
    title: "[SK하이닉스] HBM4 양산 본격화... 엔비디아 공급 물량 확대 전망",
    source: "전자신문",
    publishedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: "n3",
    symbol: "035420",
    symbolLabel: "NAV",
    kind: "filing",
    title: "[NAVER] 주요사항보고서 제출 (자기주식 처분 결정)",
    source: "DART",
    publishedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
];

export const RECENT_SEARCH_KEYWORDS = ["삼성SDI", "현대차", "포스코홀딩스"];

const STOCKS: Record<string, StockSummary> = {
  "005930": {
    symbol: "005930",
    name: "삼성전자",
    market: "KOSPI",
    price: 71400,
    changeAbs: 1400,
    changePct: 2.0,
    updatedAt: "2024-01-15T15:30:00+09:00",
    week52Low: 58900,
    week52High: 79800,
    financials: {
      per: 15.2,
      perPeer: 18.4,
      pbr: 1.4,
      roe: 9.8,
      roeDeltaPp: -1.2,
      opMargin: 11.4,
      marketCap: "426조 2,400억",
      debtRatio: 25.8,
    },
    technicals: {
      rsi: { value: 54.2, signal: "Neutral" },
      macd: { value: "Signal Cross", signal: "Buy" },
      bollinger: { value: "Mid-band", signal: "Neutral" },
      volume: { value: "12M Shares", signal: "Focus" },
    },
    debateSummary:
      "현재 다수의 분석 모델이 반도체 부문의 하반기 실적 턴어라운드를 근거로 매수 우위 의견을 제시하고 있습니다. 다만 글로벌 거시 환경 불확실성과 파운드리 수율 문제에 대한 우려를 제기하는 약세 의견도 존재합니다. 기술적으로는 주요 저항선인 75,000원 돌파 여부가 단기 모멘텀의 핵심으로 떠오르고 있습니다.",
    debateSentimentPct: 68,
    debateParticipants: 1204,
  },
  "000660": {
    symbol: "000660",
    name: "SK하이닉스",
    market: "KOSPI",
    price: 189500,
    changeAbs: -1000,
    changePct: -0.53,
    updatedAt: "2024-01-15T15:30:00+09:00",
    week52Low: 110000,
    week52High: 205000,
    financials: {
      per: 22.4,
      perPeer: 18.4,
      pbr: 1.9,
      roe: 12.1,
      roeDeltaPp: 2.4,
      opMargin: 18.2,
      marketCap: "137조 9,000억",
      debtRatio: 41.2,
    },
    technicals: {
      rsi: { value: 61.7, signal: "Neutral" },
      macd: { value: "Bullish Trend", signal: "Buy" },
      bollinger: { value: "Upper-band", signal: "Sell" },
      volume: { value: "5.4M Shares", signal: "Focus" },
    },
    debateSummary:
      "HBM3E 시장 점유율 확대와 엔비디아 공급망 우위가 강세론을 뒷받침합니다. 반면 단기 과열 신호와 메모리 사이클 정점 논의가 약세론의 주요 근거입니다.",
    debateSentimentPct: 72,
    debateParticipants: 982,
  },
};

export function getStockSummary(symbol: string): StockSummary {
  return STOCKS[symbol] ?? STOCKS["005930"];
}

export interface StockNewsRow {
  date: string;
  kind: "news" | "filing";
  title: string;
  source: string;
}

export const STOCK_NEWS: StockNewsRow[] = [
  {
    date: "오늘 14:20",
    kind: "news",
    title: "삼성전자, 차세대 HBM4 개발 로드맵 앞당긴다... \"주도권 야심\"",
    source: "경제전문",
  },
  {
    date: "오늘 10:05",
    kind: "filing",
    title: "연결재무제표기준영업(잠정)실적(공정공시)",
    source: "DART",
  },
  {
    date: "어제 16:45",
    kind: "news",
    title: "외국인 연일 순매수... 삼성전자 7만원선 안착 시도",
    source: "금융통신",
  },
  {
    date: "어제 09:10",
    kind: "news",
    title: "스마트폰 부문, 온디바이스 AI 탑재 모델 판매 호조",
    source: "IT데일리",
  },
];

export interface DebateStatusSnapshot {
  running: number;
  completed: number;
  weekCompleted: number;
}

export const DEBATE_STATUS: DebateStatusSnapshot = {
  running: 2,
  completed: 8,
  weekCompleted: 5,
};
