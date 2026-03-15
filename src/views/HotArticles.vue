<template>
  <div class="hot-articles-page">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon>
            <TrendCharts />
          </el-icon>
          热门文章
        </h1>
        <p class="page-description">浏览量最高的文章</p>
      </div>

      <div class="content-grid">
        <div class="main-section">
          <div class="article-list" ref="articleListRef">
            <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
          </div>

          <div class="load-more" ref="loadMoreRef">
            <el-button v-if="hasMore && !loading" type="primary" @click="loadMore">
              加载更多
            </el-button>
            <div v-else-if="loading" class="loading-text">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              加载中...
            </div>
            <div v-else-if="articles.length > 0" class="no-more-text">
              没有更多了
            </div>
          </div>

          <el-empty v-if="!loading && articles.length === 0" description="暂无热门文章" />
        </div>

        <Sidebar />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useUserStore } from '@/store'
import { getHotArticles } from '@/api/article'
import { ElMessage } from 'element-plus'
import { TrendCharts, Loading } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const articles = ref([])
const loading = ref(false)
const hasMore = ref(true)
const pageNum = ref(1)
const pageSize = ref(10)

const articleListRef = ref(null)
const loadMoreRef = ref(null)
let observer = null

const fetchArticles = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true

    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    const res = await getHotArticles({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    if (reset) {
      articles.value = res.data.list || []
    } else {
      articles.value = [...articles.value, ...(res.data.list || [])]
    }
    hasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取热门文章失败:', error)
    ElMessage.error('获取热门文章失败')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  fetchArticles()
}

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

const initData = async () => {
  fetchArticles(true)
}

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
.hot-articles-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-xl);
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.page-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
}

.page-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  position: relative;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.main-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .article-list {
    grid-template-columns: 1fr;
  }
}

.load-more {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-more .el-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-light);
  transition: var(--transition-base);
}

.load-more .el-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.loading-text .el-icon {
  font-size: 18px;
}

.no-more-text {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 10px 20px;
  background: var(--bg-page);
  border-radius: var(--border-radius-base);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: sticky;
  top: 80px;
  height: fit-content;
}

.widget {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.widget::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  opacity: 0.1;
  border-radius: 0 0 0 60px;
}

.widget:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.widget-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
  font-weight: 600;
  position: relative;
}

.widget-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--primary-color);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag-item {
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.tag-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.tag-item:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-light);
  z-index: 1;
}

.tag-item:hover::before {
  width: 100px;
  height: 100px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-lighter);
  transition: var(--transition-fast);
  position: relative;
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 0;
  height: 0;
  background: var(--primary-color);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: width 0.3s, height 0.3s;
}

.category-item:hover {
  padding-left: var(--spacing-md);
  border-bottom-color: var(--primary-light);
}

.category-item:hover::before {
  width: 4px;
  height: 4px;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item a {
  color: var(--text-regular);
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  transition: var(--transition-fast);
  font-weight: 500;
}

.category-item a:hover {
  color: var(--primary-color);
}

.count {
  color: var(--text-secondary);
  font-size: 14px;
  background: var(--bg-page);
  padding: 2px 8px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    order: 2;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-md);
  }
}
</style>
