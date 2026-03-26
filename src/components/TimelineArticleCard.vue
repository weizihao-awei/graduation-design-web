<template>
  <div class="timeline-article-card" @click="goToDetail">
    <div class="card-inner">
      <!-- 左侧时间标记 -->
      <div class="time-marker">
        <div class="time-dot"></div>
        <div class="time-line"></div>
      </div>

      <!-- 卡片内容 -->
      <div class="card-content">
        <!-- 发布日期 - 大字体展示 -->
        <div class="publish-date">
          <span class="day">{{ formatDay(article.publishTime) }}</span>
          <span class="month">{{ formatMonth(article.publishTime) }}</span>
        </div>

        <!-- 文章信息 -->
        <div class="article-body">
          <h3 class="article-title">{{ article.title }}</h3>

          <p class="article-summary">{{ article.summary }}</p>

          <!-- 标签 -->
          <div v-if="article.tags && article.tags.length" class="article-tags">
            <span
              v-for="tag in displayTags"
              :key="tag.id"
              class="tag-item"
              @click.stop="handleTagClick(tag)"
            >
              # {{ tag.name }}
            </span>
          </div>

          <!-- 简洁的底部信息 -->
          <div class="article-footer">
            <span class="category" v-if="article.categoryName">
              {{ article.categoryName }}
            </span>
            <span class="dot-separator" v-if="article.categoryName"></span>
            <span class="author">{{ article.authorName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 只显示前3个标签
const displayTags = computed(() => {
  return props.article.tags?.slice(0, 3) || []
})

// 格式化日期 - 获取日
const formatDay = (publishTime) => {
  if (!publishTime) return ''
  const date = new Date(publishTime)
  return date.getDate().toString().padStart(2, '0')
}

// 格式化日期 - 获取月
const formatMonth = (publishTime) => {
  if (!publishTime) return ''
  const date = new Date(publishTime)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return months[date.getMonth()]
}

// 跳转到文章详情
const goToDetail = () => {
  router.push(`/article/${props.article.id}`)
}

// 点击标签
const handleTagClick = (tag) => {
  router.push(`/tag/${tag.id}`)
}
</script>

<style scoped>
.timeline-article-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-inner {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

/* 时间轴标记 */
.time-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
}

.time-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  z-index: 1;
}

.timeline-article-card:hover .time-dot {
  transform: scale(1.3);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.time-line {
  width: 2px;
  flex: 1;
  min-height: 60px;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.1) 100%);
  margin-top: 8px;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  gap: 24px;
  background: #fff;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.timeline-article-card:hover .card-content {
  transform: translateX(8px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

/* 日期展示 */
.publish-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding-right: 20px;
  border-right: 1px solid rgba(102, 126, 234, 0.1);
}

.day {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  letter-spacing: -1px;
}

.month {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  margin-top: 4px;
  letter-spacing: 1px;
}

/* 文章主体 */
.article-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline-article-card:hover .article-title {
  color: #667eea;
}

.article-summary {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签 */
.article-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-item {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
  padding: 4px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tag-item:hover {
  background: #667eea;
  color: #fff;
}

/* 底部信息 */
.article-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.category {
  color: #764ba2;
  font-weight: 500;
}

.dot-separator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ddd;
}

.author {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .publish-date {
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
    padding-right: 0;
    padding-bottom: 12px;
    border-right: none;
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  }

  .day {
    font-size: 28px;
  }

  .month {
    margin-top: 0;
  }

  .article-title {
    font-size: 16px;
  }

  .time-marker {
    width: 20px;
  }

  .time-dot {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .card-inner {
    gap: 12px;
  }

  .card-content {
    padding: 16px;
  }

  .article-summary {
    -webkit-line-clamp: 1;
  }

  .article-tags {
    gap: 8px;
  }
}
</style>
