<template>
  <div class="timeline-calendar">
    <!-- 日历头部 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </button>
      <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
      <button class="nav-btn" @click="nextMonth">
        <el-icon>
          <ArrowRight />
        </el-icon>
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="weekdays">
      <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
    </div>

    <!-- 日期网格 -->
    <div class="days-grid">
      <div v-for="(day, index) in calendarDays" :key="index" :class="[
        'day-cell',
        {
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': isSelected(day.date)
        },
        day.articleLevel
      ]" @click="selectDate(day)">
        <span class="day-number">{{ day.isToday ? '今' : day.date.getDate() }}</span>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="heatmap-legend">
      <span class="legend-label">少</span>
      <div class="legend-bars">
        <div class="legend-bar level-1"></div>
        <div class="legend-bar level-2"></div>
        <div class="legend-bar level-3"></div>
        <div class="legend-bar level-4"></div>
      </div>
      <span class="legend-label">多</span>
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
        <el-icon>
          <Calendar />
        </el-icon>
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

// 文章数量映射表
const articleCountMap = computed(() => {
  const map = new Map()
  if (!props.monthStatistics?.dailyCounts) return map
  props.monthStatistics.dailyCounts.forEach(item => {
    map.set(item.day, item.count)
  })
  return map
})

// 统计信息
const totalArticles = computed(() => {
  if (!props.monthStatistics?.dailyCounts) return 0
  return props.monthStatistics.dailyCounts.reduce((sum, item) => sum + item.count, 0)
})

const activeDays = computed(() => {
  return props.monthStatistics?.dailyCounts?.length || 0
})

// 获取文章数量级别
const getArticleLevel = (count) => {
  if (!count || count === 0) return ''
  if (count === 1) return 'level-1'
  if (count === 2) return 'level-2'
  if (count <= 4) return 'level-3'
  return 'level-4'
}

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
    const articleCount = isCurrentMonth ? articleCountMap.value.get(date.getDate()) || 0 : 0
    const articleLevel = getArticleLevel(articleCount)

    days.push({
      date,
      isCurrentMonth,
      isToday,
      articleCount,
      articleLevel
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
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
  background: rgba(58, 123, 213, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3a7bd5;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #3a7bd5;
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
  gap: 6px;
  margin-bottom: 10px;
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
  gap: 6px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  font-size: 13px;
  color: #2c3e50;
  background: #fafbfc;
}

.day-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.day-cell.other-month {
  color: #ccc;
  background: transparent;
}

/* 选中样式 */
.day-cell.selected {
  box-shadow: 0 0 0 2px #3a7bd5;
  font-weight: 600;
}

/* 热力图级别颜色 - 青绿色系 */
.day-cell.level-1 {
  background: #e6f7f2;
  color: #13c2c2;
}

.day-cell.level-2 {
  background: #b8ebd9;
  color: #08979c;
}

.day-cell.level-3 {
  background: #6dd4b6;
  color: #fff;
}

.day-cell.level-4 {
  background: #00b894;
  color: #fff;
}

.day-cell.level-1:hover,
.day-cell.level-2:hover,
.day-cell.level-3:hover,
.day-cell.level-4:hover {
  filter: brightness(0.95);
}

.day-number {
  line-height: 1;
  font-weight: 500;
}

/* 热力图图例 */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.legend-label {
  font-size: 11px;
  color: #999;
}

.legend-bars {
  display: flex;
  gap: 3px;
}

.legend-bar {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.legend-bar.level-1 {
  background: #e6f7f2;
}

.legend-bar.level-2 {
  background: #b8ebd9;
}

.legend-bar.level-3 {
  background: #6dd4b6;
}

.legend-bar.level-4 {
  background: #00b894;
}

/* 统计信息 */
.month-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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
  color: #3a7bd5;
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
  border: 1px solid rgba(58, 123, 213, 0.2);
  background: transparent;
  border-radius: 10px;
  color: #3a7bd5;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(58, 123, 213, 0.08);
  border-color: #3a7bd5;
}
</style>
