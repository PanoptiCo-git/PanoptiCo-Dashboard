<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">대시보드</h1>
      <p class="page-subtitle">실시간 트레이딩 현황</p>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <!-- 포트폴리오 요약 -->
      <div v-if="summary.portfolio" class="grid grid-4">
        <div class="stat-card">
          <div class="stat-label">총 잔액</div>
          <div class="stat-value">${{ formatNumber(summary.portfolio.total_balance) }}</div>
          <div class="stat-change" :class="summary.portfolio.total_pnl >= 0 ? 'positive' : 'negative'">
            {{ summary.portfolio.total_pnl >= 0 ? '▲' : '▼' }}
            ${{ formatNumber(Math.abs(summary.portfolio.total_pnl || 0)) }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">가용 잔액</div>
          <div class="stat-value">${{ formatNumber(summary.portfolio.free_balance) }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">BTC 보유량</div>
          <div class="stat-value">{{ formatNumber(summary.portfolio.btc_amount, 6) }}</div>
          <div class="stat-change">${{ formatNumber(summary.portfolio.btc_value_usdt) }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">열린 포지션</div>
          <div class="stat-value">{{ summary.portfolio.open_positions_count }}</div>
        </div>
      </div>

      <!-- 거래 통계 -->
      <div class="card">
        <div class="card-header">거래 통계</div>
        <div class="grid grid-4">
          <div class="stat-card">
            <div class="stat-label">총 거래 수</div>
            <div class="stat-value">{{ summary.stats.total_trades }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">승률</div>
            <div class="stat-value">{{ formatNumber(summary.stats.win_rate) }}%</div>
            <div class="stat-change">{{ summary.stats.wins }}승 {{ summary.stats.losses }}패</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">총 수익</div>
            <div class="stat-value" :class="summary.stats.total_pnl >= 0 ? 'positive' : 'negative'">
              ${{ formatNumber(summary.stats.total_pnl) }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">평균 수익률</div>
            <div class="stat-value" :class="summary.stats.avg_pnl_percent >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(summary.stats.avg_pnl_percent) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 열린 포지션 -->
      <div class="card">
        <div class="card-header">열린 포지션</div>
        <div v-if="summary.open_positions.length === 0" class="loading">
          열린 포지션이 없습니다.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>심볼</th>
                <th>방향</th>
                <th>진입가</th>
                <th>수량</th>
                <th>시간</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="position in summary.open_positions" :key="position.id">
                <td>{{ position.symbol }}</td>
                <td>
                  <span class="badge" :class="position.side === 'buy' ? 'badge-success' : 'badge-danger'">
                    {{ position.side === 'buy' ? '매수' : '매도' }}
                  </span>
                </td>
                <td>${{ formatNumber(position.entry_price) }}</td>
                <td>{{ formatNumber(position.amount, 6) }}</td>
                <td>{{ formatDate(position.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 최근 거래 -->
      <div class="card">
        <div class="card-header">최근 거래</div>
        <div v-if="summary.recent_trades.length === 0" class="loading">
          최근 거래가 없습니다.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>심볼</th>
                <th>방향</th>
                <th>수량</th>
                <th>가격</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trade in summary.recent_trades" :key="trade.id">
                <td>{{ formatDate(trade.timestamp) }}</td>
                <td>{{ trade.symbol }}</td>
                <td>
                  <span class="badge" :class="trade.side === 'buy' ? 'badge-success' : 'badge-danger'">
                    {{ trade.side === 'buy' ? '매수' : '매도' }}
                  </span>
                </td>
                <td>{{ formatNumber(trade.amount, 6) }}</td>
                <td>${{ formatNumber(trade.filled_price || trade.price) }}</td>
                <td>
                  <span class="badge badge-info">{{ trade.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { format } from 'date-fns'

export default {
  name: 'Dashboard',
  data() {
    return {
      summary: {
        portfolio: null,
        stats: {},
        open_positions: [],
        recent_trades: []
      },
      loading: true,
      error: null
    }
  },
  mounted() {
    this.loadDashboard()
    this.interval = setInterval(() => {
      this.loadDashboard()
    }, 30000)
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    async loadDashboard() {
      try {
        this.summary = await api.getDashboardSummary()
        this.loading = false
      } catch (err) {
        this.error = '대시보드 데이터를 불러오는데 실패했습니다.'
        this.loading = false
        console.error(err)
      }
    },
    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined) return '0'
      return Number(num).toFixed(decimals)
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
    }
  }
}
</script>
