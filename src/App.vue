<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          📊 PanoptiCo
        </router-link>
        <ul class="navbar-nav">
          <li><router-link to="/" class="nav-link">대시보드</router-link></li>
          <li><router-link to="/timeline" class="nav-link">📊 타임라인</router-link></li>
          <li><router-link to="/news" class="nav-link">뉴스</router-link></li>
          <li><router-link to="/analyses" class="nav-link">분석</router-link></li>
          <li><router-link to="/trades" class="nav-link">거래</router-link></li>
          <li><router-link to="/positions" class="nav-link">포지션</router-link></li>
          <li><router-link to="/portfolio" class="nav-link">포트폴리오</router-link></li>
        </ul>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>

    <!-- 버전 표기 (우하단) -->
    <div class="version-badge" @click="showChangeLog = !showChangeLog">
      v{{ version }}
    </div>

    <!-- 변경 로그 모달 -->
    <div v-if="showChangeLog" class="changelog-modal" @click="showChangeLog = false">
      <div class="changelog-content" @click.stop>
        <div class="changelog-header">
          <h2>📝 변경 이력</h2>
          <button class="close-btn" @click="showChangeLog = false">✕</button>
        </div>
        <div class="changelog-body">
          <div v-for="change in changeLog" :key="change.version" class="changelog-item">
            <div class="version-tag">v{{ change.version }}</div>
            <div class="version-date">{{ change.date }}</div>
            <ul class="change-list">
              <li v-for="(item, idx) in change.changes" :key="idx">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import versionData from '../version.json'

export default {
  name: 'App',
  data() {
    return {
      version: versionData.version,
      changeLog: versionData.changes,
      showChangeLog: false
    }
  }
}
</script>

<style scoped>
.version-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  z-index: 1000;
  user-select: none;
}

.version-badge:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: scale(1.05);
}

.changelog-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.changelog-content {
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.changelog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a3e;
}

.changelog-header h2 {
  margin: 0;
  color: #00d4ff;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #b0b0b0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.changelog-body {
  overflow-y: auto;
  padding: 1.5rem;
}

.changelog-item {
  margin-bottom: 2rem;
}

.changelog-item:last-child {
  margin-bottom: 0;
}

.version-tag {
  display: inline-block;
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.version-date {
  color: #b0b0b0;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.change-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.change-list li {
  color: #e0e0e0;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.change-list li::before {
  content: '•';
  color: #00d4ff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* 스크롤바 스타일 */
.changelog-body::-webkit-scrollbar {
  width: 8px;
}

.changelog-body::-webkit-scrollbar-track {
  background: #0f0f23;
}

.changelog-body::-webkit-scrollbar-thumb {
  background: #2a2a3e;
  border-radius: 4px;
}

.changelog-body::-webkit-scrollbar-thumb:hover {
  background: #3a3a4e;
}
</style>

