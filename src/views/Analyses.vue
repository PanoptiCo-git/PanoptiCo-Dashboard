<template>
  <div class="analyses">
    <div class="page-header">
      <h1 class="page-title">LLM 분석</h1>
      <p class="page-subtitle">AI가 분석한 뉴스 및 매매 결정</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div class="card" v-for="analysis in analysesList" :key="analysis.id">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
              <h3 style="color: #00d4ff;">분석 #{{ analysis.id }}</h3>
              <span v-if="analysis.decision" class="badge" :class="getDecisionClass(analysis.decision)">
                {{ analysis.decision }}
              </span>
              <span v-if="analysis.confidence" class="badge badge-info">
                신뢰도: {{ (analysis.confidence * 100).toFixed(0) }}%
              </span>
            </div>
            <div style="color: #b0b0b0; font-size: 0.875rem;">
              <span>🤖 {{ analysis.model }}</span>
              <span style="margin-left: 1rem;">🕒 {{ formatDate(analysis.timestamp) }}</span>
              <span v-if="analysis.news_title" style="margin-left: 1rem;">
                📰 {{ analysis.news_title }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="analysis.reasoning" style="background: #252538; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="color: #00d4ff; font-weight: 600; margin-bottom: 0.5rem;">분석 근거</div>
          <div style="color: #e0e0e0; line-height: 1.6;">{{ analysis.reasoning }}</div>
        </div>

        <div v-if="analysis.response" style="margin-top: 1rem;">
          <details>
            <summary style="cursor: pointer; color: #00d4ff; user-select: none;">전체 응답 보기</summary>
            <div style="background: #252538; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; white-space: pre-wrap; font-family: monospace; font-size: 0.875rem;">
              {{ analysis.response }}
            </div>
          </details>
        </div>
      </div>

      <div v-if="analysesList.length === 0" class="loading">
        분석 결과가 없습니다.
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { format } from 'date-fns'
import DateRangePicker from '../components/DateRangePicker.vue'

export default {
  name: 'Analyses',
  components: {
    DateRangePicker
  },
  data() {
    return {
      analysesList: [],
      loading: true,
      error: null,
      startDate: '',
      endDate: ''
    }
  },
  mounted() {
    this.loadAnalyses()
  },
  methods: {
    handleDateChange({ startDate, endDate }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.loadAnalyses();
    },

    async loadAnalyses() {
      try {
        this.loading = true;

        let query = `
          SELECT
            a.*,
            n.title as news_title,
            n.source as news_source,
            n.sentiment as news_sentiment
          FROM llm_analysis a
          LEFT JOIN news_monitoring n ON a.news_id = n.id
        `;
        const params = [];

        if (this.startDate && this.endDate) {
          query += ' WHERE DATE(a.timestamp) BETWEEN ? AND ?';
          params.push(this.startDate, this.endDate);
        } else if (this.startDate) {
          query += ' WHERE DATE(a.timestamp) >= ?';
          params.push(this.startDate);
        } else if (this.endDate) {
          query += ' WHERE DATE(a.timestamp) <= ?';
          params.push(this.endDate);
        }

        query += ' ORDER BY a.timestamp DESC LIMIT 100';

        this.analysesList = await this.fetchAll(query, params);
        this.loading = false
      } catch (err) {
        this.error = '분석을 불러오는데 실패했습니다.'
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

    formatDate(dateString) {
      if (!dateString) return '-'
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
    },
    getDecisionClass(decision) {
      const d = decision.toLowerCase()
      if (d.includes('buy') || d.includes('매수')) return 'badge-success'
      if (d.includes('sell') || d.includes('매도')) return 'badge-danger'
      return 'badge-warning'
    }
  }
}
</script>
