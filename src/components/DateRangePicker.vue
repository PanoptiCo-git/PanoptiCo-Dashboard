<template>
  <div class="date-range-picker">
    <div class="date-inputs">
      <div class="date-input-group">
        <label>시작일</label>
        <input
          type="date"
          v-model="localStartDate"
          @change="handleDateChange"
          :max="localEndDate || maxDate"
        />
      </div>
      <span class="separator">~</span>
      <div class="date-input-group">
        <label>종료일</label>
        <input
          type="date"
          v-model="localEndDate"
          @change="handleDateChange"
          :min="localStartDate"
          :max="maxDate"
        />
      </div>
    </div>

    <div class="quick-filters">
      <button @click="setToday" class="quick-btn">오늘</button>
      <button @click="setYesterday" class="quick-btn">어제</button>
      <button @click="setLastWeek" class="quick-btn">최근 7일</button>
      <button @click="setLastMonth" class="quick-btn">최근 30일</button>
      <button @click="setAll" class="quick-btn">전체</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',
  props: {
    startDate: String,
    endDate: String
  },
  data() {
    return {
      localStartDate: this.startDate || '',
      localEndDate: this.endDate || '',
      maxDate: new Date().toISOString().split('T')[0]
    };
  },
  watch: {
    startDate(val) {
      this.localStartDate = val || '';
    },
    endDate(val) {
      this.localEndDate = val || '';
    }
  },
  methods: {
    handleDateChange() {
      this.$emit('update:startDate', this.localStartDate);
      this.$emit('update:endDate', this.localEndDate);
      this.$emit('change', {
        startDate: this.localStartDate,
        endDate: this.localEndDate
      });
    },

    setToday() {
      const today = new Date().toISOString().split('T')[0];
      this.localStartDate = today;
      this.localEndDate = today;
      this.handleDateChange();
    },

    setYesterday() {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      this.localStartDate = dateStr;
      this.localEndDate = dateStr;
      this.handleDateChange();
    },

    setLastWeek() {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      this.localStartDate = start.toISOString().split('T')[0];
      this.localEndDate = end.toISOString().split('T')[0];
      this.handleDateChange();
    },

    setLastMonth() {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      this.localStartDate = start.toISOString().split('T')[0];
      this.localEndDate = end.toISOString().split('T')[0];
      this.handleDateChange();
    },

    setAll() {
      this.localStartDate = '';
      this.localEndDate = '';
      this.handleDateChange();
    }
  }
};
</script>

<style scoped>
.date-range-picker {
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  color: #b0b0b0;
  font-size: 0.875rem;
  font-weight: 500;
}

.date-input-group input {
  background: #0f0f23;
  border: 1px solid #2a2a3e;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #e0e0e0;
  font-size: 0.9rem;
  min-width: 150px;
}

.date-input-group input:focus {
  outline: none;
  border-color: #00d4ff;
}

.separator {
  color: #b0b0b0;
  font-size: 1.2rem;
  margin-top: 1.5rem;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-btn {
  background: #2a2a3e;
  border: 1px solid #3a3a4e;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #e0e0e0;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-btn:hover {
  background: #3a3a4e;
  border-color: #00d4ff;
  color: #00d4ff;
}

.quick-btn:active {
  transform: scale(0.95);
}
</style>

