<template>
  <div class="article-card">
    <div class="card-content">
      <!-- 封面图片 -->
      <div v-if="article.coverImage" class="cover-image">
        <img :src="getCoverImageUrl(article.coverImage)" :alt="article.title" @error="handleImageError">
      </div>

      <div class="article-info">
        <!-- 标题 -->
        <h3 class="article-title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
        </h3>

        <!-- 摘要 -->
        <p class="article-summary">{{ article.summary }}</p>

        <!-- 标签 -->
        <div v-if="article.tags && article.tags.length" class="article-tags">
          <el-tag v-for="tag in article.tags" :key="tag.id" size="small" @click="handleTagClick(tag)">
            {{ tag.name }}
          </el-tag>
        </div>

        <!-- 底部信息 -->
        <div class="article-meta">
          <div class="author-info">
            <el-avatar :size="24" :src="getAvatarUrl(article.authorAvatar)">
              {{ article.authorName?.charAt(0) }}
            </el-avatar>
            <span class="author-name">{{ article.authorName }}</span>
          </div>

          <div class="meta-info">
            <span class="category" v-if="article.categoryName">
              <el-icon>
                <Folder />
              </el-icon>
              {{ article.categoryName }}
            </span>
            <span class="publish-time">
              <el-icon>
                <Clock />
              </el-icon>
              {{ formatRelativeTime(article.publishTime) }}
            </span>
            <span class="view-count">
              <el-icon>
                <View />
              </el-icon>
              {{ article.viewCount }}
            </span>

            <span class="like-count">
              <el-icon>
                <Star />
              </el-icon>
              {{ article.collectionCount }}
            </span>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { Folder, Clock, View, Star } from '@element-plus/icons-vue'
import { formatRelativeTime } from '@/utils'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const getAvatarUrl = (avatar) => {
  if (!avatar) return ''
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const cleanUri = avatar.startsWith('/api/') ? avatar.substring(4) : avatar
  return baseUrl + cleanUri
}

const getCoverImageUrl = (coverImage) => {
  if (!coverImage) return ''
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const cleanUri = coverImage.startsWith('/api/') ? coverImage.substring(4) : coverImage
  return baseUrl + cleanUri
}

// 方法
const handleImageError = (e) => {
  if (!e.target.dataset.errorHandled) {
    e.target.dataset.errorHandled = 'true'
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="220" height="160" viewBox="0 0 220 160"%3E%3Crect fill="%23f0f0f0" width="220" height="160"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无封面%3C/text%3E%3C/svg%3E'
  }
}

const handleTagClick = (tag) => {
  router.push(`/tag/${tag.id}`)
}
</script>

<style scoped>
.article-card {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-base);
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  opacity: 0;
  transition: var(--transition-fast);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.article-card:hover::before {
  opacity: 1;
}

.card-content {
  display: flex;
  padding: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.cover-image {
  width: 220px;
  height: 160px;
  flex-shrink: 0;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  position: relative;
}

.cover-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 50%);
  opacity: 0;
  transition: var(--transition-fast);
}

.article-card:hover .cover-image::after {
  opacity: 1;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-base);
}

.article-card:hover .cover-image img {
  transform: scale(1.05);
}

.article-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.article-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.article-title a {
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition-fast);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-title a:hover {
  color: var(--primary-color);
}

.article-summary {
  color: var(--text-regular);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.article-tags .el-tag {
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);
  color: #2c3e50;
}

.article-tags .el-tag:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-light);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-extra-light);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-name {
  color: var(--text-regular);
  font-weight: 500;
  transition: var(--transition-fast);
}

.author-info:hover .author-name {
  color: var(--primary-color);
}

.meta-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .cover-image {
    width: 100%;
    height: 200px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .meta-info {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: var(--spacing-md);
  }

  .article-title {
    font-size: 1.1rem;
  }

  .article-summary {
    font-size: 13px;
  }
}
</style>
