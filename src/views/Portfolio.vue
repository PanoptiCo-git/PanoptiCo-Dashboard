<template>
  <div class="portfolio">
    <div class="page-header">
      <h1 class="page-title">포트폴리오</h1>
      <p class="page-subtitle">선물 계좌 잔액 및 히스토리</p>
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
          <div class="stat-label">💼 에쿼티 (총 자산)</div>
          <div class="stat-value">${{ formatNumber(getEquity(latestPortfolio)) }}</div>
          <div class="stat-info">지갑잔고 + 미실현 손익</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">💵 지갑 잔고</div>
          <div class="stat-value">${{ formatNumber(getWalletBalance(latestPortfolio)) }}</div>
          <div class="stat-info">가용: ${{ formatNumber(latestPortfolio.free_balance) }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">📊 미실현 손익</div>
          <div class="stat-value" :class="getUnrealizedPnl(latestPortfolio) >= 0 ? 'positive' : 'negative'">
            {{ getUnrealizedPnl(latestPortfolio) >= 0 ? '+' : '' }}${{ formatNumber(Math.abs(getUnrealizedPnl(latestPortfolio))) }}
          </div>
          <div class="stat-info">열린 포지션 기준</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">📈 실현 손익</div>
          <div class="stat-value" :class="(latestPortfolio.total_pnl || 0) >= 0 ? 'positive' : 'negative'">
            {{ (latestPortfolio.total_pnl || 0) >= 0 ? '+' : '' }}${{ formatNumber(Math.abs(latestPortfolio.total_pnl || 0)) }}
          </div>
          <div class="stat-info">청산 포지션 누계</div>
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
                <th>종가 (에쿼티)</th>
                <th>일 변동</th>
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
                <td>{{ day.snapshotCount }}</td>
                <td>
                  <span v-if="day.newsCount > 0" class="news-link" @click="showNewsModal(day.date)">
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
        <div class="card-header">포트폴리오 히스토리 (선물 계좌)</div>
        <div v-if="portfolioHistory.length === 0" class="loading">
          포트폴리오 히스토리가 없습니다.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>에쿼티</th>
                <th>지갑 잔고</th>
                <th>가용 잔고</th>
                <th>미실현 손익</th>
                <th>실현 손익</th>
                <th>뉴스</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(snapshot, index) in portfolioHistory" :key="snapshot.id">
                <td>{{ formatDate(snapshot.timestamp) }}</td>
                <td>
                  ${{ formatNumber(getEquity(snapshot)) }}
                  <span v-if="index < portfolioHistory.length - 1"
                        :class="getChangeClass(getEquity(snapshot), getEquity(portfolioHistory[index + 1]))">
                    {{ formatChange(getEquity(snapshot), getEquity(portfolioHistory[index + 1])) }}
                  </span>
                </td>
                <td>
                  ${{ formatNumber(getWalletBalance(snapshot)) }}
                  <span v-if="index < portfolioHistory.length - 1"
                        :class="getChangeClass(getWalletBalance(snapshot), getWalletBalance(portfolioHistory[index + 1]))">
                    {{ formatChange(getWalletBalance(snapshot), getWalletBalance(portfolioHistory[index + 1])) }}
                  </span>
                </td>
                <td>${{ formatNumber(snapshot.free_balance) }}</td>
                <td>
                  <span :class="getUnrealizedPnl(snapshot) >= 0 ? 'positive' : 'negative'">
                    {{ getUnrealizedPnl(snapshot) >= 0 ? '+' : '' }}${{ formatNumber(Math.abs(getUnrealizedPnl(snapshot))) }}
                  </span>
                </td>
                <td>
                  <span :class="(snapshot.total_pnl || 0) >= 0 ? 'positive' : 'negative'">
                    {{ snapshot.total_pnl != null ? ((snapshot.total_pnl >= 0 ? '+' : '') + '$' + formatNumber(Math.abs(snapshot.total_pnl))) : '-' }}
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
          <div v-if="selectedDateNews.length === 0" class="loading">뉴스가 없습니다.</div>
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
  components: { DateRangePicker },
  data() {
    return {
      latestPortfolio: null,
      portfolioHistory: [],
      dailySummary: [],
      newsData: [],
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
      this.startDate = startDate
      this.endDate = endDate
      this.loadPortfolio()
    },

    // 선물 계좌 필드 헬퍼
    getEquity(snapshot) {
      if (!snapshot) return 0
      // equity = wallet_balance + unrealized_pnl (백엔드에서 저장)
      const equity = parseFloat(snapshot.total_balance || 0)
      return equity
    },
    getWalletBalance(snapshot) {
      if (!snapshot) return 0
      // wallet_balance가 metadata에 있거나 total_balance - unrealized_pnl
      const unrealized = this.getUnrealizedPnl(snapshot)
      const equity = parseFloat(snapshot.total_balance || 0)
      return equity - unrealized
    },
    getUnrealizedPnl(snapshot) {
      if (!snapshot) return 0
      return parseFloat(snapshot.total_pnl || 0)
    },

    // 변동 표시
    formatChange(current, previous) {
      if (!previous) return ''
      const change = current - previous
      if (Math.abs(change) < 0.01) return ''
      const sign = change > 0 ? '+' : ''
      return ` (${sign}$${this.formatNumber(Math.abs(change))})`
    },
    getChangeClass(current, previous) {
      if (!previous) return ''
      const change = current - previous
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return ''
    },

    async loadPortfolio() {
      try {
        this.loading = true
        this.latestPortfolio = await this.fetchOne(
          'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT 1', []
        )

        let query = 'SELECT * FROM portfolio_snapshots'
        const params = []
        if (this.startDate && this.endDate) {
          query += ' WHERE DATE(timestamp) BETWEEN ? AND ?'
          params.push(this.startDate, this.endDate)
        } else if (this.startDate) {
          query += ' WHERE DATE(timestamp) >= ?'
          params.push(this.startDate)
        } else if (this.endDate) {
          query += ' WHERE DATE(timestamp) <= ?'
          params.push(this.endDate)
        }
        query += ' ORDER BY timestamp DESC LIMIT 100'
        this.portfolioHistory = await this.fetchAll(query, params)

        await this.loadNewsData()
        this.calculateDailySummary()
        this.loading = false
      } catch (err) {
        this.error = '포트폴리오를 불러오는데 실패했습니다.'
        this.loading = false
        console.error(err)
      }
    },

    async fetchAll(query, params = []) {
      try {
        const { createClient } = await import('@libsql/client')
        const db = createClient({
          url: import.meta.env.VITE_TURSO_DATABASE_URL,
          authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN
        })
        const result = await db.execute({ sql: query, args: params })
        return result.rows.map(row => {
          const obj = {}
          result.columns.forEach((col, idx) => { obj[col] = row[idx] })
          return obj
        })
      } catch (error) {
        console.error('DB Query Error:', error)
        throw error
      }
    },

    async fetchOne(query, params = []) {
      const results = await this.fetchAll(query, params)
      return results.length > 0 ? results[0] : null
    },

    async loadNewsData() {
      try {
        let query = 'SELECT * FROM news_monitoring'
        const params = []
        if (this.startDate && this.endDate) {
          query += ' WHERE DATE(timestamp) BETWEEN ? AND ?'
          params.push(this.startDate, this.endDate)
        } else if (this.startDate) {
          query += ' WHERE DATE(timestamp) >= ?'
          params.push(this.startDate)
        } else if (this.endDate) {
          query += ' WHERE DATE(timestamp) <= ?'
          params.push(this.endDate)
        }
        query += ' ORDER BY timestamp DESC'
        this.newsData = await this.fetchAll(query, params)
      } catch (error) {
        console.warn('뉴스 데이터 로드 실패:', error)
        this.newsData = []
      }
    },

    calculateDailySummary() {
      this.dailySummary = []
      const newsCountByDate = {}
      this.newsData.forEach(news => {
        const date = news.timestamp ? news.timestamp.split(' ')[0] : null
        if (!date) return
        newsCountByDate[date] = (newsCountByDate[date] || 0) + 1
      })
      this.loadDailySnapshots(newsCountByDate)
    },

    async loadDailySnapshots(newsCountByDate) {
      try {
        let query = 'SELECT * FROM daily_snapshots'
        const params = []
        if (this.startDate && this.endDate) {
          query += ' WHERE snapshot_date BETWEEN ? AND ?'
          params.push(this.startDate, this.endDate)
        } else if (this.startDate) {
          query += ' WHERE snapshot_date >= ?'
          params.push(this.startDate)
        } else if (this.endDate) {
          query += ' WHERE snapshot_date <= ?'
          params.push(this.endDate)
        }
        query += ' ORDER BY snapshot_date DESC LIMIT 100'
        const snapshots = await this.fetchAll(query, params)
        this.dailySummary = snapshots.map(snapshot => ({
          date: snapshot.snapshot_date,
          closingBalance: parseFloat(snapshot.total_balance || 0),
          dailyChange: parseFloat(snapshot.daily_change || 0),
          dailyChangePercent: parseFloat(snapshot.daily_change_percent || 0),
          snapshotCount: parseInt(snapshot.total_trades_count || 0),
          newsCount: newsCountByDate[snapshot.snapshot_date] || 0
        }))
      } catch (error) {
        console.warn('일별 스냅샷 조회 실패, 폴백 사용:', error)
        this.calculateDailySummaryFallback(newsCountByDate)
      }
    },

    calculateDailySummaryFallback(newsCountByDate) {
      const dailyData = {}
      this.portfolioHistory.forEach(snapshot => {
        const date = snapshot.timestamp ? snapshot.timestamp.split(' ')[0] : null
        if (!date) return
        if (!dailyData[date]) dailyData[date] = { equities: [] }
        dailyData[date].equities.push(this.getEquity(snapshot))
      })
      this.dailySummary = Object.keys(dailyData)
        .sort((a, b) => b.localeCompare(a))
        .map((date, index, dates) => {
          const equities = dailyData[date].equities
          const closingBalance = equities[0]
          let dailyChange = 0, dailyChangePercent = 0
          if (index < dates.length - 1) {
            const prevClosing = dailyData[dates[index + 1]].equities[0]
            dailyChange = closingBalance - prevClosing
            dailyChangePercent = (dailyChange / prevClosing) * 100
          }
          return {
            date, closingBalance, dailyChange, dailyChangePercent,
            snapshotCount: equities.length,
            newsCount: newsCountByDate[date] || 0
          }
        })
    },

    getNewsForTime(timestamp) {
      if (!timestamp || !this.newsData || this.newsData.length === 0) return []
      const snapshotTime = new Date(timestamp)
      const snapshotDate = timestamp.split(' ')[0]
      return this.newsData.filter(news => {
        const newsDate = news.timestamp ? news.timestamp.split(' ')[0] : null
        if (newsDate !== snapshotDate) return false
        try {
          const timeDiff = Math.abs(snapshotTime - new Date(news.timestamp)) / 1000 / 60
          return timeDiff <= 60
        } catch { return false }
      })
    },

    showNewsModalForTime(timestamp) {
      const news = this.getNewsForTime(timestamp)
      if (!news.length) return
      this.selectedDate = timestamp
      this.selectedDateNews = news
      this.showModal = true
    },

    formatDate(d) { return d ? format(new Date(d), 'yyyy-MM-dd HH:mm') : '-' },
    formatDateOnly(d) {
      if (!d) return '-'
      if (d.length === 10 && d.includes('-')) return d
      return format(new Date(d), 'yyyy-MM-dd')
    },
    formatTime(d) { return d ? format(new Date(d), 'HH:mm:ss') : '-' },
    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined) return '0'
      return Number(num).toFixed(decimals)
    },
    showNewsModal(date) {
      this.selectedDate = date
      this.selectedDateNews = this.newsData.filter(n => n.timestamp?.split(' ')[0] === date)
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedDate = ''
      this.selectedDateNews = []
    }
  }
}
</script>
