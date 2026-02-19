<template>
  <div class="timeline-container">
    <div class="header">
      <h1>📊 거래 타임라인</h1>
      <p class="subtitle">뉴스 감지 → AI 분석 → 거래 실행까지의 전체 플로우</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>데이터 로딩 중...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>❌ {{ error }}</p>
      <button @click="loadTimeline">다시 시도</button>
    </div>

    <div v-else class="timeline">
      <div
        v-for="item in timeline"
        :key="item.news.id"
        class="timeline-item"
        :class="{ 'has-trade': item.trades.length > 0 }"
      >
        <!-- 뉴스 섹션 -->
        <div class="section news-section">
          <div class="section-header">
            <span class="icon">📰</span>
            <h3>뉴스 감지</h3>
            <span class="timestamp">{{ formatTime(item.news.timestamp) }}</span>
          </div>
          <div class="section-content">
            <div class="source-badge">{{ item.news.source }}</div>
            <h4 class="news-title">{{ item.news.title }}</h4>
            <p class="news-content">{{ truncate(item.news.content, 200) }}</p>
            <div v-if="item.news.sentiment" class="sentiment">
              감성: <span :class="`sentiment-${item.news.sentiment}`">{{ item.news.sentiment }}</span>
            </div>
          </div>
        </div>

        <!-- 연결선 -->
        <div class="connector">
          <div class="line"></div>
          <div class="arrow">↓</div>
        </div>

        <!-- 분석 섹션 -->
        <div v-if="item.analysis" class="section analysis-section">
          <div class="section-header">
            <span class="icon">🤖</span>
            <h3>AI 분석</h3>
            <span class="timestamp">{{ formatTime(item.analysis.timestamp) }}</span>
          </div>
          <div class="section-content">
            <div class="analysis-result">
              <div class="decision" :class="`decision-${item.analysis.decision}`">
                <span class="label">결정:</span>
                <span class="value">{{ formatDecision(item.analysis.decision) }}</span>
              </div>
              <div class="confidence">
                <span class="label">신뢰도:</span>
                <div class="confidence-bar">
                  <div
                    class="confidence-fill"
                    :style="{ width: (item.analysis.confidence * 100) + '%' }"
                    :class="getConfidenceClass(item.analysis.confidence)"
                  ></div>
                  <span class="confidence-text">{{ (item.analysis.confidence * 100).toFixed(1) }}%</span>
                </div>
              </div>
              <div class="reasoning">
                <span class="label">근거:</span>
                <p>{{ item.analysis.reasoning }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="section analysis-section no-data">
          <div class="section-header">
            <span class="icon">🤖</span>
            <h3>AI 분석</h3>
          </div>
          <div class="section-content">
            <p class="no-data-text">분석 데이터 없음</p>
          </div>
        </div>

        <!-- 연결선 -->
        <div v-if="item.analysis" class="connector">
          <div class="line"></div>
          <div class="arrow">↓</div>
        </div>

        <!-- 거래 섹션 -->
        <div v-if="item.trades.length > 0" class="section trades-section">
          <div class="section-header">
            <span class="icon">💸</span>
            <h3>거래 실행</h3>
            <span class="timestamp">{{ formatTime(item.trades[0].timestamp) }}</span>
          </div>
          <div class="section-content">
            <div v-for="trade in item.trades" :key="trade.id" class="trade-item">
              <div class="trade-info">
                <span class="trade-side" :class="`side-${trade.side}`">
                  {{ trade.side === 'buy' ? '🟢 매수' : '🔴 매도' }}
                </span>
                <span class="trade-symbol">{{ trade.symbol }}</span>
                <span class="trade-status" :class="`status-${trade.status}`">
                  {{ formatStatus(trade.status) }}
                </span>
              </div>
              <div class="trade-details">
                <div class="detail-item">
                  <span class="label">수량:</span>
                  <span class="value">{{ trade.amount?.toFixed(6) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">가격:</span>
                  <span class="value">${{ trade.filled_price?.toLocaleString() }}</span>
                </div>
                <div v-if="trade.pnl" class="detail-item">
                  <span class="label">손익:</span>
                  <span class="value" :class="trade.pnl > 0 ? 'profit' : 'loss'">
                    {{ trade.pnl > 0 ? '+' : '' }}${{ trade.pnl.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="item.analysis" class="section trades-section no-data">
          <div class="section-header">
            <span class="icon">💸</span>
            <h3>거래 실행</h3>
          </div>
          <div class="section-content">
            <p class="no-data-text">
              거래 미실행
              <span v-if="item.analysis.confidence < 0.6" class="reason">
                (신뢰도 부족: {{ (item.analysis.confidence * 100).toFixed(1) }}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && timeline.length === 0" class="empty">
      <p>📭 아직 데이터가 없습니다</p>
      <p class="hint">news-test 채널에 메시지를 보내보세요!</p>
    </div>
  </div>
</template>

<script>
import api from '../api'
import DateRangePicker from '../components/DateRangePicker.vue'

export default {
  name: 'Timeline',
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
    };
  },
  async mounted() {
    await this.loadTimeline();

    // 10초마다 자동 새로고침
    this.refreshInterval = setInterval(() => {
      this.loadTimeline();
    }, 10000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
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

        // 최근 뉴스 조회 (날짜 필터 적용)
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

        query += ' ORDER BY timestamp DESC LIMIT 50';

        const newsList = await this.fetchAll(query, params);

        const timeline = [];

        for (const news of newsList) {
          const newsId = news.id;

          // 해당 뉴스의 분석 조회
          const analysisQuery = `
            SELECT * FROM llm_analysis
            WHERE news_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
          `;
          const analysisResult = await this.fetchOne(analysisQuery, [newsId]);

          let trades = [];
          if (analysisResult) {
            // 해당 분석의 거래 조회
            const tradesQuery = `
              SELECT * FROM trade_orders
              WHERE analysis_id = ?
              ORDER BY timestamp DESC
            `;
            trades = await this.fetchAll(tradesQuery, [analysisResult.id]);
          }

          timeline.push({
            news,
            analysis: analysisResult,
            trades
          });
        }

        this.timeline = timeline;
      } catch (err) {
        console.error('타임라인 로딩 실패:', err);
        this.error = '데이터 로딩 실패: ' + err.message;
      } finally {
        this.loading = false;
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

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    formatDecision(decision) {
      const map = {
        'up': '🟢 상승 예상',
        'down': '🔴 하락 예상',
        'hold': '⏸️ 관망',
        'none': '⚪ 거래 없음',
        'buy': '🟢 매수',
        'sell': '🔴 매도'
      };
      return map[decision] || decision;
    },

    formatStatus(status) {
      const map = {
        'filled': '✅ 체결',
        'pending': '⏳ 대기',
        'canceled': '❌ 취소',
        'closed': '🔒 종료'
      };
      return map[status] || status;
    },

    getConfidenceClass(confidence) {
      if (confidence >= 0.8) return 'high';
      if (confidence >= 0.6) return 'medium';
      return 'low';
    },

    truncate(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  }
};
</script>

<style scoped>
.timeline-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2em;
  margin-bottom: 10px;
  color: #2c3e50;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1em;
}

.loading, .error, .empty {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
}

.error button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.timeline-item {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
}

.timeline-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.timeline-item.has-trade {
  border-left: 4px solid #27ae60;
}

.section {
  margin-bottom: 20px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.section-header .icon {
  font-size: 1.5em;
}

.section-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}

.timestamp {
  color: #95a5a6;
  font-size: 0.9em;
}

.section-content {
  padding: 10px 0;
}

/* 뉴스 섹션 */
.news-section {
  background: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
}

.source-badge {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  margin-bottom: 10px;
}

.news-title {
  font-size: 1.1em;
  margin: 10px 0;
  color: #2c3e50;
}

.news-content {
  color: #34495e;
  line-height: 1.6;
}

.sentiment {
  margin-top: 10px;
  font-size: 0.9em;
}

.sentiment-positive { color: #27ae60; font-weight: bold; }
.sentiment-negative { color: #e74c3c; font-weight: bold; }
.sentiment-neutral { color: #95a5a6; }

/* 분석 섹션 */
.analysis-section {
  background: #fff9e6;
  padding: 15px;
  border-radius: 8px;
}

.analysis-result {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.decision {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1em;
}

.decision-up .value { color: #27ae60; font-weight: bold; }
.decision-down .value { color: #e74c3c; font-weight: bold; }
.decision-hold .value { color: #95a5a6; }
.decision-buy .value { color: #27ae60; font-weight: bold; }
.decision-sell .value { color: #e74c3c; font-weight: bold; }

.confidence {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.confidence-bar {
  position: relative;
  background: #ecf0f1;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s;
}

.confidence-fill.high { background: #27ae60; }
.confidence-fill.medium { background: #f39c12; }
.confidence-fill.low { background: #e74c3c; }

.confidence-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9em;
}

.reasoning {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reasoning p {
  margin: 0;
  color: #34495e;
  line-height: 1.5;
}

/* 거래 섹션 */
.trades-section {
  background: #e8f8f5;
  padding: 15px;
  border-radius: 8px;
}

.trade-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.trade-item:last-child {
  margin-bottom: 0;
}

.trade-info {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.trade-side {
  font-weight: bold;
  font-size: 1.1em;
}

.side-buy { color: #27ae60; }
.side-sell { color: #e74c3c; }

.trade-symbol {
  background: #34495e;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.trade-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-filled { background: #d5f4e6; color: #27ae60; }
.status-pending { background: #fff3cd; color: #f39c12; }
.status-canceled { background: #f8d7da; color: #e74c3c; }

.trade-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-item .label {
  color: #7f8c8d;
  font-size: 0.9em;
}

.detail-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.detail-item .profit { color: #27ae60; }
.detail-item .loss { color: #e74c3c; }

/* 데이터 없음 */
.no-data {
  opacity: 0.6;
}

.no-data-text {
  color: #95a5a6;
  font-style: italic;
}

.no-data-text .reason {
  font-size: 0.9em;
  color: #7f8c8d;
}

/* 연결선 */
.connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.connector .line {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, #3498db, #2ecc71);
}

.connector .arrow {
  font-size: 1.5em;
  color: #3498db;
  margin-top: -8px;
}

.label {
  font-weight: 600;
  color: #34495e;
}

.empty {
  padding: 60px 20px;
  text-align: center;
  color: #7f8c8d;
}

.empty .hint {
  margin-top: 10px;
  font-size: 0.9em;
  color: #95a5a6;
}
</style>

