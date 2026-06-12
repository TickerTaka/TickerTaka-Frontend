# TickerTaka Frontend

AI 토론 기반 한국 주식 분석 서비스의 Next.js 프론트엔드입니다.
관심 종목 관리, 가격·재무·기술 지표 조회, 뉴스·공시 피드, AI 토론 실시간 보기 등을 제공합니다.

백엔드: [TickerTaka-backend](https://github.com/TickerTaka/TickerTaka-backend)

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript**
- **Tailwind CSS** (CSS 변수 기반 라이트/다크 테마)
- **Pretendard** (한글 폰트), Material Symbols (아이콘)

---

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수
`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.
```bash
cp .env.example .env.local
```
| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 FastAPI 주소. 기본 `http://localhost:8000`. `"mock"`이면 mock 데이터 모드 |
| `NEXT_PUBLIC_DEFAULT_USER_ID` | 인증이 없는 동안 사용할 고정 사용자 UUID (백엔드 `app_user`에 시드된 ID) |

### 3. 개발 서버
```bash
npm run dev
```
http://localhost:3000 접속.

### 4. 빌드 / 프로덕션
```bash
npm run build
npm start
```

---

## 페이지 구성

| 경로 | 내용 |
|---|---|
| `/dashboard` | 관심 종목 테이블(삭제 기능), 뉴스·공시 통합 피드, AI 토론 현황, 종목 추가 검색 |
| `/stock/[symbol]` | 종목 상세: 현재가/등락, 재무 지표, 기술 지표, 최근 뉴스 |
| `/debate` | 토론 시작(종목·주제 선택) + 최근 세션 목록 |
| `/debate/[sessionId]` | 진행 중 토론 실시간 보기 (3초 폴링), 최종 토론 요약 블록 |
| `/history` | 리포트 히스토리: 카테고리/검색 필터, 삭제 |
| `/settings` | 테마(라이트/다크) 토글 |

---

## 백엔드 API 연동

`lib/api/` 아래에서 백엔드 엔드포인트를 호출합니다.

| 호출 | 백엔드 엔드포인트 | 용도 |
|---|---|---|
| `listWatchlist` / `createWatchlist` / `deleteWatchlist` | `GET\|POST\|DELETE /api/watchlists/...` | 관심 종목 CRUD |
| `getWatchlistFeed` | `GET /api/watchlists/{uid}/feed` | 관심 종목 뉴스·공시 통합 피드 |
| `searchTickers` | `GET /api/tickers?q=` | 종목 검색 자동완성 |
| `getStockDetail` / `getStockPrices` / `getStockNews` / `getStockFilings` | `GET /api/stocks/{symbol}/...` | 종목 상세 데이터 |
| `getDashboardStats` / `getMarketIndexes` / `getRecentNews` | `GET /api/dashboard/stats` 등 | 대시보드 보조 |
| `startDebate` / `getDebateDetail` / `listDebateSessions` / `deleteDebateSession` | `POST\|GET\|DELETE /api/debates/...` | AI 토론 |

응답 타입은 `lib/types/`에 백엔드 Pydantic 스키마와 1:1로 정의돼 있습니다.

---

## 테마 시스템

- CSS 변수 기반 (`app/globals.css`의 `:root` = 라이트, `.dark` = 다크)
- Tailwind 색 토큰이 `var(--...)`를 가리키도록 설정 (`tailwind.config.ts`)
- 컴포넌트는 시맨틱 토큰만 사용하므로 테마 전환 시 자동 반영
- 색 규칙: **상승=빨강(`#f04452`) / 하락=파랑(`#3182f6`)** (한국식)
- Toss 블루(`#3182f6`) 액센트, 둥근 카드(20px), Pretendard 폰트
- 라이트/다크 토글: `/settings` 또는 상단바 아이콘. `localStorage`에 저장, FOUC 방지 인라인 스크립트로 hydration 전 적용

관련 파일:
- `app/globals.css` — 변수 정의 + base
- `tailwind.config.ts` — `var(--token)` 매핑
- `components/layout/ThemeProvider.tsx` — 컨텍스트 + 토글
- `components/layout/ThemeToggleButton.tsx` — 상단바 토글

---

## 프로젝트 구조

```
app/
  dashboard/       — 대시보드
  stock/[symbol]/  — 종목 상세
  debate/          — 토론 시작
  debate/[sessionId]/ — 토론 실시간/요약
  history/         — 리포트 히스토리
  settings/        — 환경 설정
  layout.tsx       — 루트 레이아웃 (ThemeProvider, 폰트, 네비)
  globals.css      — 테마 변수 + base

components/
  debate/          — DebateChat, DebateSetup, AgentBubble, LiveDebateView,
                     DebateSummaryBlock, HistoryTable, ParticipantsCard
  stock/           — AddWatchlistCard, WatchlistTable, PriceChart
  layout/          — SideNavBar, TopNavBar, ThemeProvider, ThemeToggleButton

lib/
  api/             — 백엔드 호출 (client / debate / market / watchlist)
  types/           — 백엔드 응답 타입
  mock/            — mock 모드용 데이터
```

---

## 주요 동작 흐름

### 관심 종목 추가 → DB 적재 → 프론트 노출
1. 사용자가 종목을 검색해 추가 → `POST /api/watchlists`
2. 백엔드가 즉시 201 응답 + 백그라운드로 4종(`news`, `prices`, `financials`, `filings`) 동기화 작업 트리거
3. 외부 소스(네이버 뉴스 / DART / pykrx / yfinance)에서 가져온 데이터가 각 캐시 테이블에 적재됨
4. 대시보드 피드(`/api/watchlists/{uid}/feed`)와 종목 상세가 그 캐시를 읽어 렌더

### AI 토론 실시간 보기
1. 토론 시작 → `POST /api/debates` 후 세션 페이지로 이동
2. `LiveDebateView`가 3초마다 `GET /api/debates/{id}` 폴링
3. 새 발언이 DB에 commit될 때마다 말풍선이 추가됨
4. `completed`/`failed` 상태가 되면 폴링 종료, 최종 요약 블록 표시

---

## 알려진 제약

- 인증 미구현: `.env.local`의 `NEXT_PUBLIC_DEFAULT_USER_ID`로 고정 사용자
- KOSPI 지수 시계열은 백엔드에 적재되지 않아 대시보드에서 지수 차트 미표시
- 토론 실행은 OpenRouter `:free` 모델 한도에 영향을 받음 (백엔드 `.env` 모델 설정 의존)

---

## 스크립트

| 명령 | 용도 |
|---|---|
| `npm run dev` | Turbopack 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
