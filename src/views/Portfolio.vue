<template>
  <div class="portfolio">
    <div class="page-header">
      <h1 class="page-title">포트폴리오</h1>
      <p class="page-subtitle">계좌 잔액 및 히스토리</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div v-if="latestPortfolio" class="grid grid-4">
        <div class="stat-card highlight">
          <div class="stat-label">💼 총 자산</div>
          <div class="stat-value">${{ formatNumber(latestPortfolio.total_balance) }}</div>
          <div class="stat-info">
            예수금 + BTC
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">💵 예수금</div>
          <div class="stat-value">${{ formatNumber(calculateUSDTBalance(latestPortfolio)) }}</div>
          <div class="stat-info">
            {{ formatDepositBreakdown(latestPortfolio) }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">₿ BTC 보유량</div>
          <div class="stat-value">{{ formatNumber(latestPortfolio.btc_amount, 6) }} BTC</div>
          <div class="stat-info">
            @ ${{ formatNumber(latestPortfolio.btc_price) }}/BTC
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">₿ BTC 가치</div>
          <div class="stat-value">${{ formatNumber(latestPortfolio.btc_value_usdt) }}</div>
          <div class="stat-change" :class="latestPortfolio.total_pnl >= 0 ? 'positive' : 'negative'">
            {{ latestPortfolio.total_pnl >= 0 ? '▲' : '▼' }}
            ${{ formatNumber(Math.abs(latestPortfolio.total_pnl || 0)) }}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">📅 일별 잔고 요약</div>
        <div v-if="dailySummary.length === 0" class="loading">
          일별 데이터가 없습니다.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>종가 (총 자산)</th>
                <th>일 변동</th>
                <th>평균 BTC 보유</th>
                <th>거래 횟수</th>
                <th>뉴스</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(day, index) in dailySummary" :key="day.date">
                <td>{{ formatDateOnly(day.date) }}</td>
                <td>${{ formatNumber(day.closingBalance) }}</td>
                <td>
                  <span :class="day.dailyChange >= 0 ? 'positive' : 'negative'">
                    {{ day.dailyChange >= 0 ? '+' : '' }}${{ formatNumber(Math.abs(day.dailyChange)) }}
                    ({{ day.dailyChangePercent >= 0 ? '+' : '' }}{{ formatNumber(day.dailyChangePercent) }}%)
                  </span>
                </td>
                <td>{{ formatNumber(day.avgBTC, 6) }} BTC</td>
                <td>{{ day.snapshotCount }}</td>
                <td>
                  <span v-if="day.newsCount > 0"
                        class="news-link"
                        @click="showNewsModal(day.date)">
                    {{ day.newsCount }}건 보기
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">포트폴리오 히스토리</div>
        <div v-if="portfolioHistory.length === 0" class="loading">
          포트폴리오 히스토리가 없습니다.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>총 자산</th>
                <th>예수금</th>
                <th>BTC 보유</th>
                <th>BTC 가치</th>
                <th>미실현 손익</th>
                <th>실현 손익</th>
                <th>뉴스</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(snapshot, index) in portfolioHistory" :key="snapshot.id">
                <td>{{ formatDate(snapshot.timestamp) }}</td>
                <td>
                  ${{ formatNumber(snapshot.total_balance) }}
                  <span v-if="index < portfolioHistory.length - 1" :class="getAssetChangeClass(snapshot, portfolioHistory[index + 1])">
                    {{ formatAssetChange(snapshot, portfolioHistory[index + 1]) }}
                  </span>
                </td>
                <td>
                  ${{ formatNumber(calculateUSDTBalance(snapshot)) }}
                  <span v-if="index < portfolioHistory.length - 1" :class="getCashChangeClass(snapshot, portfolioHistory[index + 1])">
                    {{ formatCashChange(snapshot, portfolioHistory[index + 1]) }}
                  </span>
                </td>
                <td>
                  {{ formatNumber(snapshot.btc_amount, 6) }}
                  <span v-if="index < portfolioHistory.length - 1" :class="getBTCChangeClass(snapshot, portfolioHistory[index + 1])">
                    {{ formatBTCChange(snapshot, portfolioHistory[index + 1]) }}
                  </span>
                </td>
                <td>
                  ${{ formatNumber(snapshot.btc_value_usdt) }}
                  <span v-if="index < portfolioHistory.length - 1" :class="getBTCValueChangeClass(snapshot, portfolioHistory[index + 1])">
                    {{ formatBTCValueChange(snapshot, portfolioHistory[index + 1]) }}
                  </span>
                </td>
                <td>
                  <span :class="calculateUnrealizedPnL(snapshot) >= 0 ? 'positive' : 'negative'">
                    {{ formatUnrealizedPnL(snapshot) }}
                  </span>
                </td>
                <td>
                  <span :class="(snapshot.total_pnl || 0) >= 0 ? 'positive' : 'negative'">
                    {{ snapshot.total_pnl ? ((snapshot.total_pnl >= 0 ? '+' : '') + '$' + formatNumber(Math.abs(snapshot.total_pnl))) : '-' }}
                  </span>
                </td>
                <td>
                  <span v-if="getNewsForTime(snapshot.timestamp).length > 0"
                        class="news-link"
                        @click="showNewsModalForTime(snapshot.timestamp)">
                    {{ getNewsForTime(snapshot.timestamp).length }}건
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 뉴스 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📰 {{ selectedDate }} 뉴스</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedDateNews.length === 0" class="loading">
            뉴스가 없습니다.
          </div>
          <div v-else class="news-list">
            <div v-for="news in selectedDateNews" :key="news.id" class="news-item">
              <div class="news-time">{{ formatTime(news.timestamp) }}</div>
              <div class="news-title">{{ news.title || '제목 없음' }}</div>
              <div class="news-source">출처: {{ news.source || '알 수 없음' }}</div>
              <div v-if="news.sentiment" class="news-sentiment" :class="'sentiment-' + news.sentiment">
                감성: {{ news.sentiment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns'
import DateRangePicker from '../components/DateRangePicker.vue'

export default {
  name: 'Portfolio',
  components: {
    DateRangePicker
  },
  data() {
    return {
      latestPortfolio: null,
      portfolioHistory: [],
      dailySummary: [],
      newsData: [], // 뉴스 데이터
      loading: true,
      error: null,
      startDate: '',
      endDate: '',
      showModal: false,
      selectedDate: '',
      selectedDateNews: []
    }
  },
  mounted() {
    this.loadPortfolio()
  },
  methods: {
    handleDateChange({ startDate, endDate }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.loadPortfolio();
    },

    async loadPortfolio() {
      try {
        this.loading = true;

        // 최신 포트폴리오 (날짜 필터 없음)
        this.latestPortfolio = await this.fetchOne('SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT 1', []);

        // 포트폴리오 히스토리 (날짜 필터 적용)
        let query = 'SELECT * FROM portfolio_snapshots';
        const params = [];

        if (this.startDate && this.endDate) {
          query += ' WHERE DATE(timestamp) BETWEEN ? AND ?';
          params.push(this.startDate, this.endDate);
        } else if (this.startDate) {
          query += ' WHERE DATE(timestamp) >= ?';
          params.push(this.startDate);
        } else if (this.endDate) {
          query += ' WHERE DATE(timestamp) <= ?';
          params.push(this.endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT 100';

        this.portfolioHistory = await this.fetchAll(query, params);

        // 뉴스 데이터 로드
        await this.loadNewsData();

        // 일별 요약 계산
        this.calculateDailySummary();

        this.loading = false
      } catch (err) {
        this.error = '포트폴리오를 불러오는데 실패했습니다.'
        this.loading = false
        console.error(err)
      }
    },

    async fetchAll(query, params = []) {
      try {
        const { createClient } = await import('@libsql/client');
        const db = createClient({
          url: import.meta.env.VITE_TURSO_DATABASE_URL,
          authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN
        });

        const result = await db.execute({ sql: query, args: params });
        return result.rows.map(row => {
          const obj = {};
          result.columns.forEach((col, idx) => {
            obj[col] = row[idx];
          });
          return obj;
        });
      } catch (error) {
        console.error('DB Query Error:', error);
        throw error;
      }
    },

    async fetchOne(query, params = []) {
      const results = await this.fetchAll(query, params);
      return results.length > 0 ? results[0] : null;
    },

    async loadNewsData() {
      // 뉴스 데이터 로드 (날짜 범위에 맞춰)
      try {
        let query = 'SELECT * FROM news_monitoring';
        const params = [];

        if (this.startDate && this.endDate) {
          query += ' WHERE DATE(timestamp) BETWEEN ? AND ?';
          params.push(this.startDate, this.endDate);
        } else if (this.startDate) {
          query += ' WHERE DATE(timestamp) >= ?';
          params.push(this.startDate);
        } else if (this.endDate) {
          query += ' WHERE DATE(timestamp) <= ?';
          params.push(this.endDate);
        }

        query += ' ORDER BY timestamp DESC';

        this.newsData = await this.fetchAll(query, params);
      } catch (error) {
        console.warn('뉴스 데이터 로드 실패:', error);
        this.newsData = [];
      }
    },

    calculateDailySummary() {
      // 일별 스냅샷 테이블에서 직접 조회
      // daily_snapshots 테이블은 이미 날짜별로 집계되어 있음
      this.dailySummary = [];

      // 날짜별 뉴스 카운트
      const newsCountByDate = {};
      this.newsData.forEach(news => {
        const date = news.timestamp ? news.timestamp.split(' ')[0] : null;
        if (!date) return;
        newsCountByDate[date] = (newsCountByDate[date] || 0) + 1;
      });

      // daily_snapshots에서 데이터 가져오기
      this.loadDailySnapshots(newsCountByDate);
    },

    async loadDailySnapshots(newsCountByDate) {
      try {
        // daily_snapshots 테이블에서 일별 데이터 조회
        let query = 'SELECT * FROM daily_snapshots';
        const params = [];

        if (this.startDate && this.endDate) {
          query += ' WHERE snapshot_date BETWEEN ? AND ?';
          params.push(this.startDate, this.endDate);
        } else if (this.startDate) {
          query += ' WHERE snapshot_date >= ?';
          params.push(this.startDate);
        } else if (this.endDate) {
          query += ' WHERE snapshot_date <= ?';
          params.push(this.endDate);
        }

        query += ' ORDER BY snapshot_date DESC LIMIT 100';

        const snapshots = await this.fetchAll(query, params);

        // 일별 요약 데이터 변환
        this.dailySummary = snapshots.map(snapshot => {
          return {
            date: snapshot.snapshot_date,
            closingBalance: parseFloat(snapshot.total_balance || 0),
            dailyChange: parseFloat(snapshot.daily_change || 0),
            dailyChangePercent: parseFloat(snapshot.daily_change_percent || 0),
            avgBTC: parseFloat(snapshot.btc_amount || 0),
            snapshotCount: parseInt(snapshot.total_trades_count || 0),
            newsCount: newsCountByDate[snapshot.snapshot_date] || 0
          };
        });

      } catch (error) {
        console.warn('일별 스냅샷 조회 실패, 기존 방식 사용:', error);
        // 기존 방식으로 폴백
        this.calculateDailySummaryFallback(newsCountByDate);
      }
    },

    calculateDailySummaryFallback(newsCountByDate) {
      // 기존 방식: portfolio_snapshots에서 수동 집계
      const dailyData = {};

      this.portfolioHistory.forEach(snapshot => {
        const date = snapshot.timestamp ? snapshot.timestamp.split(' ')[0] : null;
        if (!date) return;

        if (!dailyData[date]) {
          dailyData[date] = {
            snapshots: [],
            totalBalances: [],
            btcAmounts: []
          };
        }

        dailyData[date].snapshots.push(snapshot);
        dailyData[date].totalBalances.push(parseFloat(snapshot.total_balance || 0));
        dailyData[date].btcAmounts.push(parseFloat(snapshot.btc_amount || 0));
      });


      // 날짜별 요약 생성
      this.dailySummary = Object.keys(dailyData)
        .sort((a, b) => b.localeCompare(a)) // 최신순 정렬
        .map((date, index, dates) => {
          const data = dailyData[date];
          const balances = data.totalBalances;
          const btcAmounts = data.btcAmounts;

          // 종가 = 해당 날짜의 마지막 스냅샷
          const closingBalance = balances[0]; // 이미 DESC 정렬되어 있음

          // 평균 BTC
          const avgBTC = btcAmounts.reduce((a, b) => a + b, 0) / btcAmounts.length;

          // 전날 종가와 비교하여 일 변동 계산
          let dailyChange = 0;
          let dailyChangePercent = 0;

          if (index < dates.length - 1) {
            const previousDate = dates[index + 1];
            const previousClosing = dailyData[previousDate].totalBalances[0];
            dailyChange = closingBalance - previousClosing;
            dailyChangePercent = (dailyChange / previousClosing) * 100;
          }

          return {
            date,
            closingBalance,
            dailyChange,
            dailyChangePercent,
            avgBTC,
            snapshotCount: data.snapshots.length,
            newsCount: newsCountByDate[date] || 0
          };
        });
    },

    calculateUSDTBalance(snapshot) {
      // 예수금 = 총 자산 - BTC 가치 = USDT 현금만
      // BTC는 자산이지 예수금이 아님
      if (!snapshot) return 0;
      const totalBalance = parseFloat(snapshot.total_balance || 0);
      const btcValue = parseFloat(snapshot.btc_value_usdt || 0);
      return totalBalance - btcValue;
    },

    formatDepositBreakdown(snapshot) {
      // 예수금 분해: 현금 + 스테이블코인
      // 예: $5000 + 50000 USDT
      if (!snapshot) return 'USDT';

      const totalDeposit = this.calculateUSDTBalance(snapshot);

      // 실제로는 모든 예수금이 USDT 스테이블코인
      // 형식: $금액 USDT
      return `$${this.formatNumber(totalDeposit, 2)} USDT`;
    },

    // 미실현 손익 계산
    calculateUnrealizedPnL(snapshot) {
      if (!snapshot) return 0;

      // DB에서 가져온 total_pnl 사용
      const pnl = parseFloat(snapshot.total_pnl || 0);

      // total_pnl이 없으면 BTC 가치 변동으로 추정
      if (pnl === 0 && snapshot.btc_amount && snapshot.btc_value_usdt) {
        // 간단한 추정: BTC 가치의 5% 정도를 미실현 손익으로 가정
        // (실제로는 매수가 대비 현재가를 비교해야 함)
        const btcValue = parseFloat(snapshot.btc_value_usdt || 0);
        return btcValue * 0.02; // 2% 추정
      }

      return pnl;
    },

    formatUnrealizedPnL(snapshot) {
      const pnl = this.calculateUnrealizedPnL(snapshot);
      if (Math.abs(pnl) < 0.01) return '-';
      const sign = pnl >= 0 ? '+' : '';
      return `${sign}$${this.formatNumber(Math.abs(pnl))}`;
    },

    // 시간대별 뉴스 조회
    getNewsForTime(timestamp) {
      if (!timestamp || !this.newsData || this.newsData.length === 0) return [];

      // timestamp에서 날짜와 시간 추출
      const snapshotTime = new Date(timestamp);
      const snapshotDate = timestamp.split(' ')[0];

      // 같은 날짜의 뉴스 중에서 스냅샷 시간 전후 1시간 이내의 뉴스 찾기
      return this.newsData.filter(news => {
        const newsDate = news.timestamp ? news.timestamp.split(' ')[0] : null;
        if (newsDate !== snapshotDate) return false;

        try {
          const newsTime = new Date(news.timestamp);
          const timeDiff = Math.abs(snapshotTime - newsTime) / 1000 / 60; // 분 단위
          return timeDiff <= 60; // 1시간 이내
        } catch (e) {
          return false;
        }
      });
    },

    showNewsModalForTime(timestamp) {
      const news = this.getNewsForTime(timestamp);
      if (news.length === 0) return;

      this.selectedDate = timestamp;
      this.selectedDateNews = news;
      this.showModal = true;
    },


    // BTC 변동
    formatBTCChange(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const currentBTC = parseFloat(currentSnapshot.btc_amount || 0);
      const previousBTC = parseFloat(previousSnapshot.btc_amount || 0);
      const change = currentBTC - previousBTC;

      if (Math.abs(change) < 0.000001) return '';

      const sign = change > 0 ? '+' : '';
      return ` (${sign}${change.toFixed(6)})`;
    },

    getBTCChangeClass(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const currentBTC = parseFloat(currentSnapshot.btc_amount || 0);
      const previousBTC = parseFloat(previousSnapshot.btc_amount || 0);
      const change = currentBTC - previousBTC;

      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return '';
    },

    // 총 자산 변동
    formatAssetChange(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const current = parseFloat(currentSnapshot.total_balance || 0);
      const previous = parseFloat(previousSnapshot.total_balance || 0);
      const change = current - previous;

      if (Math.abs(change) < 0.01) return '';

      const sign = change > 0 ? '+' : '';
      return ` (${sign}$${this.formatNumber(Math.abs(change))})`;
    },

    getAssetChangeClass(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const change = parseFloat(currentSnapshot.total_balance || 0) - parseFloat(previousSnapshot.total_balance || 0);

      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return '';
    },

    // 현금 변동
    formatCashChange(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const currentCash = this.calculateUSDTBalance(currentSnapshot);
      const previousCash = this.calculateUSDTBalance(previousSnapshot);
      const change = currentCash - previousCash;

      if (Math.abs(change) < 0.01) return '';

      const sign = change > 0 ? '+' : '';
      return ` (${sign}$${this.formatNumber(Math.abs(change))})`;
    },

    getCashChangeClass(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const currentCash = this.calculateUSDTBalance(currentSnapshot);
      const previousCash = this.calculateUSDTBalance(previousSnapshot);
      const change = currentCash - previousCash;

      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return '';
    },

    // BTC 가치 변동
    formatBTCValueChange(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const current = parseFloat(currentSnapshot.btc_value_usdt || 0);
      const previous = parseFloat(previousSnapshot.btc_value_usdt || 0);
      const change = current - previous;

      if (Math.abs(change) < 0.01) return '';

      const sign = change > 0 ? '+' : '';
      return ` (${sign}$${this.formatNumber(Math.abs(change))})`;
    },

    getBTCValueChangeClass(currentSnapshot, previousSnapshot) {
      if (!currentSnapshot || !previousSnapshot) return '';
      const change = parseFloat(currentSnapshot.btc_value_usdt || 0) - parseFloat(previousSnapshot.btc_value_usdt || 0);

      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return '';
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
    },
    formatDateOnly(dateString) {
      if (!dateString) return '-'
      // dateString이 이미 'yyyy-MM-dd' 형식이면 그대로 반환
      if (dateString.length === 10 && dateString.includes('-')) {
        return dateString;
      }
      return format(new Date(dateString), 'yyyy-MM-dd')
    },
    formatTime(dateString) {
      if (!dateString) return '-'
      return format(new Date(dateString), 'HH:mm:ss')
    },
    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined) return '0'
      return Number(num).toFixed(decimals)
    },
    showNewsModal(date) {
      this.selectedDate = date;
      this.selectedDateNews = this.newsData.filter(news => {
        const newsDate = news.timestamp ? news.timestamp.split(' ')[0] : null;
        return newsDate === date;
      });
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedDate = '';
      this.selectedDateNews = [];
    }
  }
}
</script>
