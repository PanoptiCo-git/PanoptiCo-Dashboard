<template>
  <div class="positions">
    <div class="page-header">
      <h1 class="page-title">포지션</h1>
      <p class="page-subtitle">선물 포지션 현황</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div class="card">
        <div class="card-header">열린 포지션 ({{ openPositions.length }})</div>
        <div v-if="openPositions.length === 0" class="loading">열린 포지션이 없습니다.</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>시간</th>
                <th>심볼</th>
                <th>방향</th>
                <th>레버리지</th>
                <th>진입가</th>
                <th>수량</th>
                <th>미실현 손익</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="position in openPositions" :key="position.id">
                <td>{{ position.id }}</td>
                <td>{{ formatDate(position.timestamp) }}</td>
                <td><strong>{{ position.symbol }}</strong></td>
                <td>
                  <span class="badge" :class="getSideBadgeClass(position.side)">
                    {{ formatSide(position.side) }}
                  </span>
                </td>
                <td>{{ getLeverage(position) }}</td>
                <td>${{ formatNumber(position.entry_price) }}</td>
                <td>{{ formatNumber(position.amount, 6) }}</td>
                <td>
                  <span :class="(position.unrealized_pnl || 0) >= 0 ? 'positive' : 'negative'">
                    {{ position.unrealized_pnl != null
                      ? ((position.unrealized_pnl >= 0 ? '+' : '') + '$' + formatNumber(Math.abs(position.unrealized_pnl)))
                      : '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">포지션 히스토리</div>
        <div v-if="positionHistory.length === 0" class="loading">포지션 히스토리가 없습니다.</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>시간</th>
                <th>심볼</th>
                <th>방향</th>
                <th>레버리지</th>
                <th>진입가</th>
                <th>청산가</th>
                <th>손익</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="position in positionHistory" :key="position.id">
                <td>{{ position.id }}</td>
                <td>{{ formatDate(position.timestamp) }}</td>
                <td><strong>{{ position.symbol }}</strong></td>
                <td>
                  <span class="badge" :class="getSideBadgeClass(position.side)">
                    {{ formatSide(position.side) }}
                  </span>
                </td>
                <td>{{ getLeverage(position) }}</td>
                <td>${{ formatNumber(position.entry_price) }}</td>
                <td>{{ position.exit_price ? '$' + formatNumber(position.exit_price) : '-' }}</td>
                <td>
                  <span :class="(position.pnl || 0) >= 0 ? 'positive' : 'negative'">
                    {{ position.pnl != null
                      ? ((position.pnl >= 0 ? '+' : '') + '$' + formatNumber(position.pnl))
                      : '-' }}
                  </span>
                </td>
                <td><span class="badge badge-info">{{ position.status }}</span></td>
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
import DateRangePicker from '../components/DateRangePicker.vue'

export default {
  name: 'Positions',
  components: { DateRangePicker },
  data() {
    return {
      openPositions: [],
      positionHistory: [],
      loading: true,
      error: null,
      startDate: '',
      endDate: ''
    }
  },
  mounted() {
    this.loadPositions()
  },
  methods: {
    handleDateChange({ startDate, endDate }) {
      this.startDate = startDate
      this.endDate = endDate
      this.loadPositions()
    },

    async loadPositions() {
      try {
        this.loading = true
        this.error = null
        this.openPositions = await api.getOpenPositions()
        this.positionHistory = await api.getPositionsFiltered(this.startDate, this.endDate, 100)
        this.loading = false
      } catch (err) {
        this.error = '포지션을 불러오는데 실패했습니다: ' + (err.message || err)
        this.loading = false
        console.error('Load positions error:', err)
      }
    },

    // 선물 방향 표시 (buy=롱, sell=숏, long, short 모두 처리)
    formatSide(side) {
      if (!side) return '-'
      const s = side.toLowerCase()
      if (s === 'buy' || s === 'long') return '롱 (Long)'
      if (s === 'sell' || s === 'short') return '숏 (Short)'
      return side
    },
    getSideBadgeClass(side) {
      if (!side) return ''
      const s = side.toLowerCase()
      if (s === 'buy' || s === 'long') return 'badge-success'
      if (s === 'sell' || s === 'short') return 'badge-danger'
      return 'badge-info'
    },

    // metadata JSON에서 레버리지 추출
    getLeverage(position) {
      try {
        if (position.metadata) {
          const meta = typeof position.metadata === 'string'
            ? JSON.parse(position.metadata)
            : position.metadata
          if (meta.leverage) return `${meta.leverage}x`
        }
      } catch {}
      return '-'
    },

    formatDate(d) { return d ? format(new Date(d), 'yyyy-MM-dd HH:mm') : '-' },
    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined) return '0'
      return Number(num).toFixed(decimals)
    }
  }
}
</script>
