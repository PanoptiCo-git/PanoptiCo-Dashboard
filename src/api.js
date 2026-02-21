import { createClient } from '@libsql/client'

// 환경 변수 체크
const dbUrl = import.meta.env.VITE_TURSO_DATABASE_URL;
const dbToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('❌ Missing Turso environment variables!');
  console.error('VITE_TURSO_DATABASE_URL:', dbUrl ? 'Set ✅' : 'Missing ❌');
  console.error('VITE_TURSO_AUTH_TOKEN:', dbToken ? 'Set ✅' : 'Missing ❌');
  console.error('Please check GitHub Secrets or .env file');
}

// Turso 직접 연결
// 환경 변수는 백엔드 프로젝트의 .env 파일에서 관리됩니다
// Vite가 자동으로 VITE_ 접두사가 있는 변수를 로드합니다
const db = createClient({
  url: dbUrl,
  authToken: dbToken,
})

// 쿼리 헬퍼 함수
async function fetchAll(query, params = []) {
  try {
    const result = await db.execute({ sql: query, args: params })
    return result.rows.map(row => {
      const obj = {}
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    })
  } catch (error) {
    console.error('DB Query Error:', error)
    throw error
  }
}

async function fetchOne(query, params = []) {
  const results = await fetchAll(query, params)
  return results.length > 0 ? results[0] : null
}

export default {
  // 뉴스
  async getNews(limit = 20) {
    const query = `
      SELECT * FROM news_monitoring
      ORDER BY timestamp DESC
      LIMIT ?
    `
    return await fetchAll(query, [limit])
  },

  async getNewsById(id) {
    const query = `SELECT * FROM news_monitoring WHERE id = ?`
    return await fetchOne(query, [id])
  },

  // 분석
  async getAnalyses(limit = 20) {
    const query = `
      SELECT * FROM llm_analysis
      ORDER BY timestamp DESC
      LIMIT ?
    `
    return await fetchAll(query, [limit])
  },

  async getAnalysisById(id) {
    const query = `SELECT * FROM llm_analysis WHERE id = ?`
    return await fetchOne(query, [id])
  },

  async getAnalysesWithNews(limit = 20) {
    const query = `
      SELECT 
        a.*,
        n.title as news_title,
        n.source as news_source,
        n.sentiment as news_sentiment
      FROM llm_analysis a
      LEFT JOIN news_monitoring n ON a.news_id = n.id
      ORDER BY a.timestamp DESC
      LIMIT ?
    `
    return await fetchAll(query, [limit])
  },

  // 거래
  async getTrades(symbol = null, limit = 50) {
    if (symbol) {
      const query = `
        SELECT * FROM trade_orders
        WHERE symbol = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `
      return await fetchAll(query, [symbol, limit])
    } else {
      const query = `
        SELECT * FROM trade_orders
        ORDER BY timestamp DESC
        LIMIT ?
      `
      return await fetchAll(query, [limit])
    }
  },

  async getTradeById(id) {
    const query = `SELECT * FROM trade_orders WHERE id = ?`
    return await fetchOne(query, [id])
  },

  // 포지션
  async getOpenPositions() {
    const query = `
      SELECT * FROM positions
      WHERE status = 'open'
      ORDER BY timestamp DESC
    `
    return await fetchAll(query)
  },

  async getPositionHistory(limit = 50) {
    const query = `
      SELECT * FROM positions
      ORDER BY timestamp DESC
      LIMIT ?
    `
    return await fetchAll(query, [limit])
  },

  async getPositionById(id) {
    const query = `SELECT * FROM positions WHERE id = ?`
    return await fetchOne(query, [id])
  },

  // 포트폴리오
  async getLatestPortfolio() {
    const query = `
      SELECT * FROM portfolio_snapshots
      ORDER BY timestamp DESC
      LIMIT 1
    `
    return await fetchOne(query)
  },

  async getPortfolioHistory(limit = 100) {
    const query = `
      SELECT * FROM portfolio_snapshots
      ORDER BY timestamp DESC
      LIMIT ?
    `
    return await fetchAll(query, [limit])
  },

  // 통계
  async getTradingStats() {
    // 총 거래 횟수
    const totalTradesResult = await fetchOne(`SELECT COUNT(*) as total FROM trade_orders`)
    const total_trades = totalTradesResult?.total || 0

    // 매수/매도 횟수
    const sideResults = await fetchAll(`
      SELECT side, COUNT(*) as count
      FROM trade_orders
      GROUP BY side
    `)
    const buy_count = sideResults.find(r => r.side === 'buy')?.count || 0
    const sell_count = sideResults.find(r => r.side === 'sell')?.count || 0

    // 총 손익
    const pnlStats = await fetchOne(`
      SELECT SUM(pnl) as total_pnl, AVG(pnl_percent) as avg_pnl_percent
      FROM positions
      WHERE status = 'closed'
    `)

    // 승률
    const winRateData = await fetchOne(`
      SELECT
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) as losses,
        COUNT(*) as total
      FROM positions
      WHERE status = 'closed'
    `)

    const win_rate = winRateData?.total > 0
      ? (winRateData.wins / winRateData.total) * 100
      : 0

    return {
      total_trades,
      buy_count,
      sell_count,
      total_pnl: pnlStats?.total_pnl || 0,
      avg_pnl_percent: pnlStats?.avg_pnl_percent || 0,
      wins: winRateData?.wins || 0,
      losses: winRateData?.losses || 0,
      win_rate
    }
  },

  async getDashboardSummary() {
    const portfolio = await this.getLatestPortfolio()
    const stats = await this.getTradingStats()
    const open_positions = await this.getOpenPositions()
    const recent_trades = await this.getTrades(null, 5)

    return {
      portfolio,
      stats,
      open_positions,
      recent_trades
    }
  },

  // 이벤트
  async getEventLogs(eventType = null, limit = 100) {
    if (eventType) {
      const query = `
        SELECT * FROM system_events
        WHERE event_type = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `
      return await fetchAll(query, [eventType, limit])
    } else {
      const query = `
        SELECT * FROM system_events
        ORDER BY timestamp DESC
        LIMIT ?
      `
      return await fetchAll(query, [limit])
    }
  },

  // 헬스 체크
  async healthCheck() {
    try {
      await fetchOne(`SELECT 1`)
      return { status: 'healthy', database: 'connected' }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  },

  // 날짜 필터링 지원 (범용)
  async queryWithDateFilter(baseQuery, params = [], startDate = null, endDate = null) {
    let query = baseQuery;
    const args = [...params];

    if (startDate && endDate) {
      query += (query.includes('WHERE') ? ' AND' : ' WHERE') + ' DATE(timestamp) BETWEEN ? AND ?';
      args.push(startDate, endDate);
    } else if (startDate) {
      query += (query.includes('WHERE') ? ' AND' : ' WHERE') + ' DATE(timestamp) >= ?';
      args.push(startDate);
    } else if (endDate) {
      query += (query.includes('WHERE') ? ' AND' : ' WHERE') + ' DATE(timestamp) <= ?';
      args.push(endDate);
    }

    return await fetchAll(query, args);
  },

  // 포지션 (날짜 필터 지원)
  async getPositionsFiltered(startDate = null, endDate = null, limit = 100) {
    const baseQuery = 'SELECT * FROM positions';
    const params = [];
    let query = await this.queryWithDateFilter(baseQuery, params, startDate, endDate);
    
    // queryWithDateFilter는 배열을 반환하므로, 여기서 정렬 및 제한을 적용
    const fullQuery = baseQuery + 
      (startDate || endDate ? 
        (startDate && endDate ? ' WHERE DATE(timestamp) BETWEEN ? AND ?' : 
         startDate ? ' WHERE DATE(timestamp) >= ?' : ' WHERE DATE(timestamp) <= ?') 
        : '') + 
      ' ORDER BY timestamp DESC LIMIT ?';
    
    const args = [];
    if (startDate && endDate) {
      args.push(startDate, endDate);
    } else if (startDate) {
      args.push(startDate);
    } else if (endDate) {
      args.push(endDate);
    }
    args.push(limit);
    
    return await fetchAll(fullQuery, args);
  },

  // 거래 타임라인 데이터 (날짜 필터 지원)
  // Fixed 2026-02-21: Removed system_events query to prevent trade_skip column errors
  async getTimelineData(startDate = null, endDate = null, limit = 100) {
    const buildQuery = (table, where = '') => {
      let q = `SELECT * FROM ${table}`;
      const params = [];
      
      if (where) {
        q += ` WHERE ${where}`;
      }
      
      if (startDate && endDate) {
        q += (where ? ' AND' : ' WHERE') + ' DATE(timestamp) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        q += (where ? ' AND' : ' WHERE') + ' DATE(timestamp) >= ?';
        params.push(startDate);
      } else if (endDate) {
        q += (where ? ' AND' : ' WHERE') + ' DATE(timestamp) <= ?';
        params.push(endDate);
      }
      
      q += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);
      
      return { query: q, params };
    };

    try {
      const newsQ = buildQuery('news_monitoring');
      const analysisQ = buildQuery('llm_analysis');
      const tradesQ = buildQuery('trade_orders');

      const [news, analyses, trades] = await Promise.all([
        fetchAll(newsQ.query, newsQ.params),
        fetchAll(analysisQ.query, analysisQ.params),
        fetchAll(tradesQ.query, tradesQ.params)
      ]);

      return { news, analyses, trades };
    } catch (error) {
      console.error('Timeline data fetch error:', error);
      throw error;
    }
  }
}


