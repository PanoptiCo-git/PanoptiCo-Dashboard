# PanoptiCo Dashboard

암호화폐 자동매매 시스템 모니터링 대시보드

## 🎯 프로젝트 개요

Mercauto 백엔드와 연동되는 실시간 모니터링 대시보드입니다. Turso 데이터베이스에서 거래 내역, 뉴스, AI 분석 결과를 조회하여 시각화합니다.

## ✨ 주요 기능

### 📊 포트폴리오
- **실시간 잔고**: 총 자산, 예수금, BTC 보유량
- **포트폴리오 히스토리**: 시간별 잔고 변동 추이
- **일별 잔고 요약**: 날짜별 종가, 일 변동, 거래 횟수
- **뉴스 연동**: 스냅샷 시간대 뉴스 자동 매칭
- **손익 표시**: 미실현/실현 손익

### 💰 거래 타임라인
- **통합 타임라인**: 뉴스 → AI 분석 → 거래 → 시스템 이벤트
- **거래 미실행 이유**: 신뢰도 부족, 체감 영향력 부족 등 상세 표시
- **시뮬레이션 정보**: 주문했다면 어떻게 됐을지 표시
- **거래 실행 정보**: 수량, 가격, 총액, 상태

### 📰 뉴스 모니터링
- **실시간 뉴스**: 텔레그램 채널에서 수집한 뉴스
- **감성 분석**: positive, negative, neutral
- **뉴스 상세**: 제목, 출처, 키워드
- **시간대별 필터링**: 날짜 범위 선택

### 🤖 AI 분석
- **분석 결과**: 매수/매도/보유 결정
- **신뢰도**: AI의 판단 확신도
- **근거**: 결정 이유 설명
- **모델 정보**: 사용된 AI 모델

## 🛠️ 기술 스택

- **Frontend**: Vue.js 3 + Vite
- **Database**: Turso (libsql)
- **Styling**: Custom CSS (Dark theme)
- **Date Handling**: date-fns
- **UI Components**: Custom Vue components

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
VITE_TURSO_DATABASE_URL=your_turso_database_url
VITE_TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
PanoptiCo-Dashboard/
├── src/
│   ├── views/
│   │   ├── Portfolio.vue      # 포트폴리오 화면
│   │   ├── Trades.vue          # 거래 타임라인
│   │   ├── News.vue            # 뉴스 목록
│   │   ├── Analyses.vue        # AI 분석 목록
│   │   ├── Positions.vue       # 포지션 관리
│   │   ├── Timeline.vue        # 전체 타임라인
│   │   └── Dashboard.vue       # 대시보드 홈
│   ├── components/
│   │   └── DateRangePicker.vue # 날짜 범위 선택
│   ├── api.js                  # Turso DB 연결
│   ├── App.vue                 # 메인 앱
│   ├── main.js                 # 엔트리 포인트
│   └── style.css               # 글로벌 스타일
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 화면 구성

### 포트폴리오
- 총 자산, 예수금, BTC 보유량 카드
- 포트폴리오 히스토리 테이블 (시간별 변동)
- 일별 잔고 요약 테이블
- 뉴스 모달 (클릭 시 상세 표시)

### 거래 타임라인
- 시간순 정렬된 이벤트 목록
- 뉴스, AI 분석, 거래, 시스템 이벤트 통합
- 거래 미실행 이유 상세 박스
- 시뮬레이션 정보 표시

### 뉴스
- 뉴스 목록 (최신순)
- 감성 분석 배지
- 날짜 범위 필터링

### AI 분석
- 분석 결과 목록
- 결정, 신뢰도, 근거 표시
- 뉴스와 연결

## 🔗 백엔드 연동

### Turso 데이터베이스 스키마

#### news_monitoring
- 뉴스 데이터 저장
- timestamp, source, title, content, sentiment

#### llm_analysis
- AI 분석 결과
- decision, confidence, reasoning, model

#### trade_orders
- 거래 주문 내역
- symbol, side, amount, price, status

#### portfolio_snapshots
- 포트폴리오 스냅샷 (시간대별)
- total_balance, free_balance, btc_amount, btc_value_usdt

#### daily_snapshots
- 일별 스냅샷 (23:59 기준)
- snapshot_date, daily_change, total_trades_count

#### positions
- 포지션 정보
- entry_price, exit_price, pnl, status

#### system_events
- 시스템 이벤트 로그
- event_type, severity, message

## 🚀 배포

### Vercel 배포

```bash
npm install -g vercel
vercel
```

### Netlify 배포

```bash
npm run build
# dist 폴더를 Netlify에 업로드
```

### 환경 변수 설정

배포 플랫폼에서 환경 변수 설정:
- `VITE_TURSO_DATABASE_URL`
- `VITE_TURSO_AUTH_TOKEN`

## 📝 버전 정보

- **Version**: 1.0.0
- **Last Updated**: 2026-02-19
- **Author**: sungjun4403

## 🔧 개발 가이드

### 컴포넌트 추가

새로운 화면 추가 시:
1. `src/views/` 에 Vue 파일 생성
2. `src/App.vue` 에 라우트 추가
3. 네비게이션 메뉴 업데이트

### API 호출

Turso DB 쿼리:

```javascript
import { createClient } from '@libsql/client'

const db = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL,
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN
})

const result = await db.execute({
  sql: 'SELECT * FROM table_name WHERE condition = ?',
  args: [value]
})
```

### 스타일 커스터마이징

`src/style.css` 에서 글로벌 스타일 수정:
- 색상 테마
- 타이포그래피
- 레이아웃

## 🐛 트러블슈팅

### Turso 연결 오류
- 환경 변수 확인 (.env 파일)
- DATABASE_URL과 AUTH_TOKEN 값 확인

### 빌드 오류
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS 오류
- Turso는 CORS를 지원하므로 문제 없음
- 로컬 개발 시 Vite가 프록시 처리

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR 환영합니다!

## 📧 연락처

- GitHub: [@sungjun4403](https://github.com/sungjun4403)
- Email: sungjun4403@gmail.com

---

**PanoptiCo Dashboard** - 모든 거래를 한눈에 📊

