import type {
  AgentStatement,
  DebateDetail,
  DebateSession,
  ModeratorSummary,
} from "@/lib/types/debate";

const now = (offsetMin = 0) =>
  new Date(Date.now() - offsetMin * 60_000).toISOString();

export const MOCK_TICKERS = [
  { symbol: "005930", name: "삼성전자" },
  { symbol: "000660", name: "SK하이닉스" },
  { symbol: "035420", name: "NAVER" },
  { symbol: "035720", name: "카카오" },
  { symbol: "005380", name: "현대차" },
  { symbol: "006400", name: "삼성SDI" },
  { symbol: "005490", name: "POSCO홀딩스" },
];

const MOCK_USER = "00000000-0000-0000-0000-000000000001";

export const MOCK_SESSIONS: DebateSession[] = [
  {
    id: "sess-001",
    user_id: MOCK_USER,
    symbol: "005930",
    symbol_name: "삼성전자",
    category: "market",
    status: "completed",
    started_at: "2024-01-15T16:25:00Z",
    completed_at: "2024-01-15T16:30:00Z",
    verdict: "bull",
  },
  {
    id: "sess-002",
    user_id: MOCK_USER,
    symbol: "000660",
    symbol_name: "SK하이닉스",
    category: "technical",
    status: "completed",
    started_at: "2024-01-14T11:15:00Z",
    completed_at: "2024-01-14T11:20:00Z",
    verdict: "neutral",
  },
  {
    id: "sess-003",
    user_id: MOCK_USER,
    symbol: "035420",
    symbol_name: "NAVER",
    category: "financial",
    status: "completed",
    started_at: "2024-01-12T09:40:00Z",
    completed_at: "2024-01-12T09:45:00Z",
    verdict: "bear",
  },
  {
    id: "sess-004",
    user_id: MOCK_USER,
    symbol: "035720",
    symbol_name: "카카오",
    category: "macro",
    status: "completed",
    started_at: "2024-01-10T14:10:00Z",
    completed_at: "2024-01-10T14:15:00Z",
    verdict: "bull",
  },
  {
    id: "sess-005",
    user_id: MOCK_USER,
    symbol: "005380",
    symbol_name: "현대차",
    category: "market",
    status: "completed",
    started_at: "2024-01-08T17:45:00Z",
    completed_at: "2024-01-08T17:50:00Z",
    verdict: "bull",
  },
];

function mkStmt(
  session: DebateSession,
  order: number,
  role: AgentStatement["agent_role"],
  round: AgentStatement["round"],
  content: string,
  offsetMin: number,
): AgentStatement {
  return {
    id: `${session.id}-s${order}`,
    session_id: session.id,
    round,
    round_order: order,
    agent_role: role,
    content,
    created_at: now(offsetMin),
    model_used: "deepseek-r1",
    evidence_count: 0,
    evidences: [],
  };
}

export function buildMockDetail(session: DebateSession): DebateDetail {
  const statements: AgentStatement[] = [
    mkStmt(
      session,
      1,
      "moderator",
      "opening",
      `지금부터 ${session.symbol_name}의 향후 ${categoryHook(session.category)} 분석에 대한 토론을 시작하겠습니다. 메모리 반도체 사이클 회복과 AI 수요 증가가 핵심 쟁점입니다.`,
      15,
    ),
    mkStmt(
      session,
      2,
      "bull",
      "opening",
      `${session.symbol_name}는 HBM3E 양산 본격화와 함께 엔비디아 공급망 지위가 강화되고 있습니다. 기존 범용 메모리의 실적 회복과 시너지를 내어 하반기 폭발적인 이익 성장을 견인할 것입니다.`,
      12,
    ),
    mkStmt(
      session,
      3,
      "bear",
      "opening",
      `HBM 경쟁력 우려가 여전히 존재합니다. 경쟁사 대비 수율 문제와 차세대 공정 도입 지연 리스크가 완벽히 해소되지 않았으며, 파운드리 부문의 적자 지속이 잠재 수익성을 훼손하고 있습니다.`,
      10,
    ),
    mkStmt(
      session,
      4,
      "moderator",
      "rebuttal",
      `1R 핵심 쟁점 정리: 강세론은 HBM3E 공급 본격화를 통한 이익 레버리지를 강조하는 반면, 약세론은 파운드리 부진과 공정 경쟁력 우려를 지적하고 있습니다.`,
      8,
    ),
    mkStmt(
      session,
      5,
      "bull",
      "rebuttal",
      `현재 12M Fwd PER 15.2배는 글로벌 메모리 피어 평균 18.4배 대비 17% 디스카운트 상태이며, 사이클 회복기 진입 시 멀티플 리레이팅 여지가 충분합니다.`,
      6,
    ),
    mkStmt(
      session,
      6,
      "bear",
      "rebuttal",
      `밸류에이션 디스카운트는 구조적 거버넌스 및 사업 다각화 한계를 반영합니다. 단순 멀티플 비교만으로 매수를 정당화하기엔 ROE 회복 속도가 더디다는 점에 주목해야 합니다.`,
      4,
    ),
  ];

  const summary: ModeratorSummary | null =
    session.status === "completed"
      ? {
          session_id: session.id,
          summary_content:
            "현재 다수의 분석 모델이 반도체 부문의 하반기 실적 턴어라운드를 근거로 매수 우위 의견을 제시하고 있습니다. 다만 글로벌 거시 환경 불확실성과 파운드리 수율 문제에 대한 우려를 제기하는 약세 의견도 존재합니다. 기술적으로는 주요 저항선인 75,000원 돌파 여부가 단기 모멘텀의 핵심으로 떠오르고 있습니다.",
          key_points: [
            "긍정 사이클 우세 (68%)",
            "참여자 1,204명",
            "주요 저항: 75,000원",
          ],
        }
      : null;

  return {
    session,
    statements,
    summary,
    bull_strength: session.verdict === "bull" ? 4 : 3,
    bear_strength: session.verdict === "bear" ? 4 : 2,
  };
}

function categoryHook(category: DebateSession["category"]) {
  switch (category) {
    case "market":
      return "성장성";
    case "financial":
      return "재무 건전성";
    case "technical":
      return "기술적 지표";
    case "macro":
      return "거시·뉴스 흐름";
    case "synthesis":
      return "종합 투자 매력도";
  }
}
