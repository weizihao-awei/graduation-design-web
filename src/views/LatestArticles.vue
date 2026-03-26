<template>
  <div class="timeline-articles-page">
    <Header />

    <div class="container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <el-icon>
              <Clock />
            </el-icon>
            时间轴
          </h1>
          <p class="page-description">按时间顺序探索文章，点击日历日期查看特定日期的内容</p>
        </div>
        <div class="header-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-line"></div>
        </div>
      </div>

      <div class="content-grid">
        <!-- 左侧时间轴文章列表 -->
        <div class="timeline-section">
          <!-- 日期标题 -->
          <div class="timeline-date-header" v-if="articles.length > 0">
            <div class="year-badge">{{ selectedYear }}</div>
            <div class="date-info">
              <span class="selected-date">{{ formatSelectedDate }}</span>
          
            </div>
          </div>

          <!-- 时间轴列表 -->
          <div class="timeline-list" ref="timelineListRef">
            <TimelineArticleCard v-for="article in articles" :key="article.id" :article="article" />

            <!-- 时间轴终点 -->
            <div class="timeline-end" v-if="!hasMore && articles.length > 0">
              <div class="end-dot"></div>
              <span class="end-text">已经到底啦~</span>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="load-more" ref="loadMoreRef" v-if="hasMore || loading">
            <div v-if="loading" class="loading-state">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <span>加载中...</span>
            </div>
            <el-button v-else-if="hasMore" type="primary" class="load-more-btn" @click="loadMore">
              加载更多
            </el-button>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!loading && articles.length === 0" description="该日期暂无文章" class="timeline-empty">
            <el-button type="primary" @click="goToToday">查看今天</el-button>
          </el-empty>
        </div>

        <!-- 右侧日历 -->
        <aside class="calendar-sidebar">
          <TimelineCalendar :month-statistics="monthStatistics" :selected-date="selectedDate"
            @select-date="handleDateSelect" @month-change="handleMonthChange" />

          <!-- 时间轴导航提示 -->
          <div class="timeline-tips">
            <h4 class="tips-title">
              <el-icon>
                <InfoFilled />
              </el-icon>
              使用提示
            </h4>
            <ul class="tips-list">
              <li>点击日历上有标记的日期查看文章</li>
              <li>向下滚动加载更多历史文章</li>
              <li>使用日历切换月份浏览</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import TimelineArticleCard from '@/components/TimelineArticleCard.vue'
import TimelineCalendar from '@/components/TimelineCalendar.vue'
import { getMonthStatistics, getArticlesBefore } from '@/api/article'
import { ElMessage } from 'element-plus'
import { Clock, Loading, InfoFilled } from '@element-plus/icons-vue'

// ============ 响应式数据 ============
const articles = ref([])
const loading = ref(false)
const hasMore = ref(true)
const pageNum = ref(1)
const pageSize = ref(10)


// 当前选中的日期
const selectedDate = ref(new Date())

// 月份统计数据
const monthStatistics = ref(null)

// DOM 引用
const timelineListRef = ref(null)
const loadMoreRef = ref(null)
let observer = null

// ============ 计算属性 ============
const selectedYear = computed(() => {
  return selectedDate.value.getFullYear()
})

const formatSelectedDate = computed(() => {
  const date = selectedDate.value
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}月${day}日`
})

// ============ 方法 ============

/**
 * 格式化日期为 yyyy-MM-dd
 */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取月份统计数据
 */
const fetchMonthStatistics = async (year, month) => {
  try {
    const res = await getMonthStatistics({ year, month })
    if (res.code === 200) {
      monthStatistics.value = res.data
    }
  } catch (error) {
    console.error('获取月份统计失败:', error)
  }
}

/**
 * 获取文章列表
 */
const fetchArticles = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true

    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    const res = await getArticlesBefore({
      date: formatDate(selectedDate.value),
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    if (res.code === 200 || res.code === 202) {
      const newArticles = res.data.list || []

      if (reset) {
        articles.value = newArticles
      } else {
        // 去重后追加
        const existingIds = new Set(articles.value.map(a => a.id))
        const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a.id))
        articles.value = [...articles.value, ...uniqueNewArticles]
      }


      hasMore.value = res.data.hasNextPage || false
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    ElMessage.error('获取文章失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  fetchArticles()
}

/**
 * 回到今天
 */
const goToToday = () => {
  selectedDate.value = new Date()
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth() + 1
  fetchMonthStatistics(year, month)
  fetchArticles(true)
}

/**
 * 处理日期选择
 */
const handleDateSelect = (date) => {
  selectedDate.value = date
  fetchArticles(true)
}

/**
 * 处理月份切换
 */
const handleMonthChange = ({ year, month }) => {
  fetchMonthStatistics(year, month)
}

/**
 * 初始化 IntersectionObserver
 */
const initIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  if (loadMoreRef.value) {
    observer.observe(loadMoreRef.value)
  }
}

/**
 * 初始化页面数据
 */
const initData = async () => {
  const now = new Date()
  await fetchMonthStatistics(now.getFullYear(), now.getMonth() + 1)
  await fetchArticles(true)
}

// ============ 生命周期 ============
onMounted(() => {
  initData()
  initIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.timeline-articles-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fc 0%, #f0f4f8 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ========== 页面头部 ========== */
.page-header {
  position: relative;
  margin-bottom: 40px;
  padding: 50px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  letter-spacing: 2px;
}

.page-title .el-icon {
  font-size: 2.5rem;
}

.page-description {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.decoration-line {
  position: absolute;
  top: 50%;
  right: 50px;
  width: 150px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%);
}

/* ========== 内容网格 ========== */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
  align-items: start;
}

/* ========== 时间轴区域 ========== */
.timeline-section {
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  min-height: 600px;
}

/* 日期头部 */
.timeline-date-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.year-badge {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-date {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.article-count {
  font-size: 13px;
  color: #999;
}

/* 时间轴列表 */
.timeline-list {
  position: relative;
}

/* 时间轴终点 */
.timeline-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0 20px;
  margin-left: 12px;
}

.end-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.5;
}

.end-text {
  font-size: 13px;
  color: #999;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0 10px;
  min-height: 60px;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #667eea;
  font-size: 14px;
}

.loading-state .el-icon {
  font-size: 18px;
}

.load-more-btn {
  padding: 12px 40px;
  font-size: 14px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 空状态 */
.timeline-empty {
  padding: 80px 0;
}

/* ========== 侧边栏 ========== */
.calendar-sidebar {  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
}

/* 提示卡片 */
.timeline-tips {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.tips-title .el-icon {
  color: #667eea;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #666;
  line-height: 2;
}

.tips-list li {
  position: relative;
}

.tips-list li::marker {
  color: #667eea;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .calendar-sidebar {
    position: static;
    order: -1;
  }

  .timeline-calendar {
    max-width: 400px;
    margin: 0 auto;
  }

  .timeline-tips {
    display: none;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 16px;
  }

  .page-header {
    padding: 30px 24px;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .page-title .el-icon {
    font-size: 1.8rem;
  }

  .timeline-section {
    padding: 20px;
    border-radius: 16px;
  }

  .timeline-date-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-decoration {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 0.875rem;
  }

  .timeline-section {
    padding: 16px;
  }

  .selected-date {
    font-size: 18px;
  }
}
</style>
