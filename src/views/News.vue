<template>
  <div class="news">
    <div class="page-header">
      <h1 class="page-title">뉴스 감지</h1>
      <p class="page-subtitle">텔레그램 및 뉴스 소스에서 감지된 뉴스</p>
    </div>

    <DateRangePicker
      :startDate="startDate"
      :endDate="endDate"
      @change="handleDateChange"
    />

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div class="card" v-for="news in newsList" :key="news.id">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="color: #00d4ff; margin-bottom: 0.5rem;">{{ news.title || '제목 없음' }}</h3>
            <div style="display: flex; gap: 1rem; color: #b0b0b0; font-size: 0.875rem;">
              <span>📰 {{ news.source }}</span>
              <span>🕒 {{ formatDate(news.timestamp) }}</span>
              <span v-if="news.sentiment" class="badge" :class="getSentimentClass(news.sentiment)">
                {{ news.sentiment }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="news.content" style="color: #e0e0e0; margin-bottom: 1rem; line-height: 1.6;">
          {{ news.content }}
        </div>

        <div v-if="news.url" style="margin-top: 1rem;">
          <a :href="news.url" target="_blank" style="color: #00d4ff; text-decoration: none;">
            🔗 원문 보기
          </a>
        </div>

        <div v-if="news.keywords" style="margin-top: 1rem;">
          <span v-for="(keyword, idx) in parseKeywords(news.keywords)" :key="idx"
                class="badge badge-info" style="margin-right: 0.5rem;">
            {{ keyword }}
          </span>
        </div>
      </div>

      <div v-if="newsList.length === 0" class="loading">
        감지된 뉴스가 없습니다.
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { format } from 'date-fns'
import DateRangePicker from '../components/DateRangePicker.vue'

export default {
  name: 'News',
  components: {
    DateRangePicker
  },
  data() {
    return {
      newsList: [],
      loading: true,
      error: null,
      startDate: '',
      endDate: ''
    }
  },
  mounted() {
    this.loadNews()
  },
  methods: {
    handleDateChange({ startDate, endDate }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.loadNews();
    },

    async loadNews() {
      try {
        this.loading = true;

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

        query += ' ORDER BY timestamp DESC LIMIT 100';

        this.newsList = await this.fetchAll(query, params);
        this.loading = false
      } catch (err) {
        this.error = '뉴스를 불러오는데 실패했습니다.'
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
    parseKeywords(keywords) {
      if (!keywords) return []
      try {
        return JSON.parse(keywords)
      } catch {
        return []
      }
    },
    getSentimentClass(sentiment) {
      if (sentiment === 'positive') return 'badge-success'
      if (sentiment === 'negative') return 'badge-danger'
      return 'badge-warning'
    }
  }
}
</script>
