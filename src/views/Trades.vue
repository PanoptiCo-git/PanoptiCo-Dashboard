<template>
  <div class="trades">
    <div class="page-header">
      <h1 class="page-title">거래 타임라인</h1>
      <p class="page-subtitle">모든 거래 실행 및 분석 내역</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="timeline-container">
      <div v-if="timeline.length === 0" class="loading">
        거래 내역이 없습니다.
      </div>

      <div v-else class="timeline">
        <div v-for="item in timeline" :key="item.id" class="timeline-item" :class="'type-' + item.type">
          <div class="timeline-marker" :class="getMarkerClass(item)">
            <span class="timeline-icon">{{ getIcon(item) }}</span>
          </div>

          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-time">{{ formatDate(item.timestamp) }}</span>
              <span class="timeline-type" :class="'badge-' + item.type">{{ getTypeLabel(item.type) }}</span>
            </div>

            <!-- 뉴스 -->
            <div v-if="item.type === 'news'" class="timeline-body">
              <h3 class="timeline-title">📰 {{ item.data.title }}</h3>
              <div class="timeline-meta">
                <span class="meta-item">출처: {{ item.data.source }}</span>
                <span class="meta-item sentiment" :class="'sentiment-' + item.data.sentiment">
                  감성: {{ item.data.sentiment }}
                </span>
              </div>
            </div>

            <!-- AI 분석 -->
            <div v-if="item.type === 'analysis'" class="timeline-body">
              <h3 class="timeline-title">🤖 AI 분석 결과</h3>
              <div class="analysis-details">
                <div class="detail-row">
                  <span class="detail-label">결정:</span>
                  <span class="detail-value" :class="getDecisionClass(item.data.decision)">
                    {{ item.data.decision }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">신뢰도:</span>
                  <span class="detail-value">{{ formatPercent(item.data.confidence) }}</span>
                </div>
                <div v-if="item.data.reasoning" class="detail-row">
                  <span class="detail-label">근거:</span>
                  <span class="detail-value reasoning">{{ item.data.reasoning }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">모델:</span>
                  <span class="detail-value">{{ item.data.model }}</span>
                </div>
              </div>
            </div>

            <!-- 거래 실행 -->
            <div v-if="item.type === 'trade'" class="timeline-body">
              <h3 v-if="item.data.executed" class="timeline-title executed">✅ 거래 실행</h3>

              <!-- 거래 실행됨 -->
              <div v-if="item.data.executed" class="trade-details">
                <!-- ...existing code... -->
              </div>

              <!-- 거래 미실행 / 실패 -->
              <div v-else class="trade-skip">
                <div :class="item.data.status === 'failed' ? 'skip-reason error-reason' : 'skip-reason'">
                  <span class="reason-icon">{{ item.data.status === 'failed' ? '❌' : 'ℹ️' }}</span>
                  <div class="reason-content">
                    <div class="reason-text">{{ item.data.reason || item.data.raw_response || '이유 없음' }}</div>
                  </div>
                </div>
                <div v-if="item.data.simulated_order" class="simulated-info">
                  <div class="simulated-title">💡 시뮬레이션 정보</div>
                  <div class="detail-row">
                    <span class="detail-label">방향:</span>
                    <span class="detail-value">{{ item.data.simulated_order.side }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">수량:</span>
                    <span class="detail-value">{{ formatNumber(item.data.simulated_order.amount, 6) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">예상 투자액:</span>
                    <span class="detail-value">${{ formatNumber(item.data.simulated_order.invest_usdt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 시스템 이벤트 -->
            <div v-if="item.type === 'event'" class="timeline-body">
              <h3 class="timeline-title">⚙️ {{ item.data.event_type }}</h3>
              <div class="event-message">{{ item.data.message }}</div>
            </div>

            <!-- 거래 미실행 / 에러 이벤트 -->
            <div v-if="item.type === 'trade_skip' || item.type === 'trade_error'" class="timeline-body">
              <div :class="item.type === 'trade_error' ? 'skip-reason error-reason' : 'skip-reason'">
                <span class="reason-icon">{{ item.type === 'trade_error' ? '❌' : 'ℹ️' }}</span>
                <div class="reason-content">
                  <div class="reason-text">{{ item.data.reason || item.data.message || '이유 없음' }}</div>
                </div>
              </div>
            </div>
          </div>
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
  name: 'Trades',
  components: {
    DateRangePicker
  },
  data() {
    return {
      timeline: [],
      loading: true,
      error: null,
      startDate: '',
      endDate: ''
    }
  },
  mounted() {
    this.loadTimeline()
  },
  methods: {
    handleDateChange({ startDate, endDate }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.loadTimeline();
    },

    async loadTimeline() {
      try {
        this.loading = true;
        this.error = null;

        const { news, analyses, trades, events } = await api.getTimelineData(
          this.startDate,
          this.endDate,
          100
        );

        const newsItems = news.map(item => ({
          id: `news-${item.id}`,
          type: 'news',
          timestamp: item.timestamp,
          data: item
        }));

        const analysisItems = analyses.map(item => ({
          id: `analysis-${item.id}`,
          type: 'analysis',
          timestamp: item.timestamp,
          data: item
        }));

        const tradeItems = trades
          .filter(item => item.status === 'filled' || item.status === 'closed')
          .map(item => ({
            id: `trade-${item.id}`,
            type: 'trade',
            timestamp: item.timestamp,
            data: { ...item, executed: true }
          }));

        // trade_orders skipped/failed → 타임라인에 reason과 함께 표시
        const tradeSkipItems = trades
          .filter(item => item.status === 'skipped' || item.status === 'failed')
          .map(item => ({
            id: `trade-skip-${item.id}`,
            type: item.status === 'failed' ? 'trade_error' : 'trade_skip',
            timestamp: item.timestamp,
            data: { reason: item.reason || '이유 없음', message: item.reason || '이유 없음', status: item.status }
          }));

        // system_events 기반 (trade_orders에 없는 경우만 - 중복 방지)
        const skipTimestamps = new Set(tradeSkipItems.map(i => i.timestamp));
        const eventItems = (events || []).filter(item => !skipTimestamps.has(item.timestamp)).map(item => {
          let details = {};
          try { details = item.details ? JSON.parse(item.details) : {}; } catch {}
          return {
            id: `event-${item.id}`,
            type: item.event_type === 'trade_error' ? 'trade_error' : 'trade_skip',
            timestamp: item.timestamp,
            data: { ...details, event_type: item.event_type, reason: item.message, message: item.message, severity: item.severity }
          };
        });

        const all = [...newsItems, ...analysisItems, ...tradeItems, ...tradeSkipItems, ...eventItems];
        this.timeline = all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.loading = false;
      } catch (err) {
        this.error = '타임라인을 불러오는데 실패했습니다: ' + (err.message || err);
        this.loading = false;
        console.error('Load timeline error:', err);
      }
    },

    getIcon(item) {
      const icons = {
        'news': '📰',
        'analysis': '🤖',
        'trade': item.data.executed ? '💰' : (item.data.status === 'failed' ? '❌' : '⏭️'),
        'trade_skip': '⏭️',
        'trade_error': '❌',
        'event': '⚙️'
      };
      return icons[item.type] || '📌';
    },

    getMarkerClass(item) {
      if (item.type === 'trade') {
        if (item.data.executed) return 'marker-success';
        if (item.data.status === 'failed') return 'marker-error';
        return 'marker-warning';
      }
      if (item.type === 'trade_error') return 'marker-error';
      if (item.type === 'trade_skip') return 'marker-warning';
      return `marker-${item.type}`;
    },

    getTypeLabel(type) {
      const labels = {
        'news': '뉴스',
        'analysis': 'AI 분석',
        'trade': '거래',
        'trade_skip': '거래 미실행',
        'trade_error': '거래 오류',
        'event': '이벤트'
      };
      return labels[type] || type;
    },

    getDecisionClass(decision) {
      if (decision === 'buy') return 'decision-buy';
      if (decision === 'sell') return 'decision-sell';
      return 'decision-hold';
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    },

    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined) return '0';
      return Number(num).toFixed(decimals);
    },

    formatPercent(num) {
      if (num === null || num === undefined) return '0%';
      return `${(Number(num) * 100).toFixed(1)}%`;
    }
  }
}
</script>

<style scoped>
/* 타임라인 컨테이너 */
.timeline-container {
  margin-top: 2rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #2a2a3e, #1a1a2e);
}

/* 타임라인 아이템 */
.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 3rem;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 3px solid #1a1a2e;
  z-index: 1;
}

.marker-news {
  background: linear-gradient(135deg, #4a4a6e, #2a2a4e);
}

.marker-analysis {
  background: linear-gradient(135deg, #4a6e8a, #2a4e6a);
}

.marker-success {
  background: linear-gradient(135deg, #00ff88, #00cc66);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.marker-warning {
  background: linear-gradient(135deg, #ffaa00, #ff8800);
  box-shadow: 0 0 20px rgba(255, 170, 0, 0.3);
}

.marker-error {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.marker-event {
  background: linear-gradient(135deg, #6a4a8a, #4a2a6a);
}

.timeline-icon {
  font-size: 1.5rem;
}

/* 타임라인 컨텐츠 */
.timeline-content {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2a2a3e;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #2a2a3e;
}

.timeline-time {
  font-size: 0.9rem;
  color: #888;
}

.timeline-type {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge-news {
  background: rgba(74, 74, 110, 0.3);
  color: #8a8aff;
}

.badge-analysis {
  background: rgba(74, 110, 138, 0.3);
  color: #00d4ff;
}

.badge-trade {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.badge-trade_skip {
  background: rgba(255, 170, 0, 0.2);
  color: #ffaa00;
}

.badge-trade_error {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.badge-event {
  background: rgba(106, 74, 138, 0.3);
  color: #aa88ff;
}

/* 타임라인 바디 */
.timeline-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.timeline-title.executed {
  color: #00ff88;
}

.timeline-title.skipped {
  color: #ffaa00;
}

.timeline-title.error {
  color: #ff4444;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.meta-item {
  font-size: 0.9rem;
  color: #b0b0b0;
}

.sentiment {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.sentiment-positive {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.sentiment-negative {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.sentiment-neutral {
  background: rgba(176, 176, 176, 0.2);
  color: #b0b0b0;
}

/* 상세 정보 */
.analysis-details,
.trade-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-label {
  font-weight: 500;
  color: #888;
  min-width: 80px;
}

.detail-value {
  color: #e0e0e0;
}

.detail-value.reasoning {
  flex: 1;
  line-height: 1.6;
}

.detail-value.highlight {
  color: #00d4ff;
  font-weight: 600;
  font-size: 1.1rem;
}

.decision-buy {
  color: #00ff88;
  font-weight: 600;
}

.decision-sell {
  color: #ff4444;
  font-weight: 600;
}

.decision-hold {
  color: #ffaa00;
  font-weight: 600;
}

.side-buy {
  color: #00ff88;
  font-weight: 600;
}

.side-sell {
  color: #ff4444;
  font-weight: 600;
}

.status-filled {
  color: #00ff88;
}

.status-pending {
  color: #ffaa00;
}

.status-cancelled {
  color: #ff4444;
}

/* 거래 미실행 */
.trade-skip {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skip-reason {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 170, 0, 0.1);
  border-left: 3px solid #ffaa00;
  border-radius: 4px;
}

.error-reason {
  background: rgba(255, 68, 68, 0.1);
  border-left-color: #ff4444;
}

.reason-icon {
  font-size: 1.5rem;
}

.reason-content {
  flex: 1;
}

.reason-title {
  font-weight: 600;
  color: #ffaa00;
  margin-bottom: 0.5rem;
}

.reason-text {
  color: #e0e0e0;
  line-height: 1.6;
}

.simulated-info {
  padding: 1rem;
  background: rgba(0, 212, 255, 0.1);
  border-left: 3px solid #00d4ff;
  border-radius: 4px;
}

.simulated-title {
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 0.75rem;
}

.event-message {
  color: #b0b0b0;
  line-height: 1.6;
}
</style>

