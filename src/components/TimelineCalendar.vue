<template>
  <div class="timeline-calendar">
    <!-- 日历头部 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
      <button class="nav-btn" @click="nextMonth">
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="weekdays">
      <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
    </div>

    <!-- 日期网格 -->
    <div class="days-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'day-cell',
          {
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-articles': day.hasArticles,
            'selected': isSelected(day.date)
          }
        ]"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <span v-if="day.hasArticles" class="article-indicator"></span>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="month-stats" v-if="monthStatistics">
      <div class="stat-item">
        <span class="stat-value">{{ totalArticles }}</span>
        <span class="stat-label">本月文章</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ activeDays }}</span>
        <span class="stat-label">活跃天数</span>
      </div>
    </div>

    <!-- 快速跳转 -->
    <div class="quick-actions">
      <button class="action-btn" @click="goToToday">
        <el-icon><Calendar /></el-icon>
        回到今天
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'

const props = defineProps({
  monthStatistics: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: Date,
    default: null
  }
})

const emit = defineEmits(['select-date', 'month-change'])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前显示的月份
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 有文章的日期集合
const articleDays = computed(() => {
  if (!props.monthStatistics?.dailyCounts) return new Set()
  return new Set(props.monthStatistics.dailyCounts.map(item => item.day))
})

// 统计信息
const totalArticles = computed(() => {
  if (!props.monthStatistics?.dailyCounts) return 0
  return props.monthStatistics.dailyCounts.reduce((sum, item) => sum + item.count, 0)
})

const activeDays = computed(() => {
  return props.monthStatistics?.dailyCounts?.length || 0
})

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const isCurrentMonth = date.getMonth() === month
    const isToday = date.getTime() === today.getTime()
    const hasArticles = isCurrentMonth && articleDays.value.has(date.getDate())

    days.push({
      date,
      isCurrentMonth,
      isToday,
      hasArticles
    })
  }

  return days
})

// 是否选中
const isSelected = (date) => {
  if (!props.selectedDate) return false
  return date.getTime() === props.selectedDate.getTime()
}

// 上一月
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
  emit('month-change', {
    year: currentYear.value,
    month: currentMonth.value
  })
}

// 下一月
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
  emit('month-change', {
    year: currentYear.value,
    month: currentMonth.value
  })
}

// 选择日期
const selectDate = (day) => {
  if (!day.isCurrentMonth) {
    currentDate.value = new Date(day.date.getFullYear(), day.date.getMonth(), 1)
    emit('month-change', {
      year: day.date.getFullYear(),
      month: day.date.getMonth() + 1
    })
  }
  emit('select-date', day.date)
}

// 回到今天
const goToToday = () => {
  const today = new Date()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  emit('month-change', {
    year: today.getFullYear(),
    month: today.getMonth() + 1
  })
  emit('select-date', today)
}

// 监听外部传入的日期
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
  }
}, { immediate: true })
</script>

<style scoped>
.timeline-calendar {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* 头部导航 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #667eea;
  color: #fff;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 星期标题 */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: #999;
  font-weight: 500;
  padding: 8px 0;
}

/* 日期网格 */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #2c3e50;
}

.day-cell:hover {
  background: rgba(102, 126, 234, 0.1);
}

.day-cell.other-month {
  color: #ccc;
}

.day-cell.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.day-cell.today:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.day-cell.has-articles:not(.today)::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #667eea;
}

.day-cell.selected:not(.today) {
  background: rgba(102, 126, 234, 0.15);
  border: 2px solid #667eea;
}

.day-number {
  line-height: 1;
}

.article-indicator {
  position: absolute;
  bottom: 2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #667eea;
}

/* 统计信息 */
.month-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 快速操作 */
.quick-actions {
  margin-top: 16px;
}

.action-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  background: transparent;
  border-radius: 10px;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}
</style>
