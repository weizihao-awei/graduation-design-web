<template>
  <div class="latest-articles-page">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon>
            <Clock />
          </el-icon>
          最新文章
        </h1>
        <p class="page-description">最新发布的文章</p>
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

          <el-empty v-if="!loading && articles.length === 0" description="暂无最新文章" />
        </div>

        <aside class="sidebar">
          <Sidebar />
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
// 导入 Vue 组合式 API
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import Sidebar from '@/components/Sidebar.vue'
import { getLatestArticles } from '@/api/article'
import { ElMessage } from 'element-plus'
import { Clock, Loading } from '@element-plus/icons-vue'

// 初始化路由
const router = useRouter()

// 响应式数据定义
const articles = ref([])
const loading = ref(false)
const hasMore = ref(true)
const pageNum = ref(1)
const pageSize = ref(10)

// DOM 元素引用
const articleListRef = ref(null)   // 文章列表容器引用
const loadMoreRef = ref(null)      // 加载更多按钮容器引用
let observer = null                // IntersectionObserver 实例

// 获取文章列表数据
// reset: 是否重置列表（从头开始加载）
const fetchArticles = async (reset = false) => {
  // 防止重复加载
  if (loading.value) return

  try {
    // 设置加载状态
    loading.value = true

    // 如果需要重置，则重置页码和文章列表
    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    // 调用 API 获取文章数据
    const res = await getLatestArticles({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    // 根据是否重置来更新文章列表
    if (reset) {
      // 重置时直接替换列表
      articles.value = res.data.list || []
    } else {
      // 加载更多时将新数据追加到现有列表
      articles.value = [...articles.value, ...(res.data.list || [])]
    }
    // 更新是否有更多数据的标识
    hasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取最新文章失败:', error)
    ElMessage.error('获取最新文章失败')
  } finally {
    // 无论成功失败都关闭加载状态
    loading.value = false
  }
}

// 加载更多文章
const loadMore = () => {
  // 如果没有更多数据或正在加载，则不执行
  if (!hasMore.value || loading.value) return
  // 页码加1
  pageNum.value++
  // 获取下一页数据
  fetchArticles()
}

// 初始化 IntersectionObserver（无限滚动监听器）
const initIntersectionObserver = () => {
  // 如果已存在观察器，先断开连接
  if (observer) {
    observer.disconnect()
  }

  // 创建新的 IntersectionObserver 实例
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 当元素进入视口且还有更多数据且未在加载时，触发加载更多
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      })
    },
    {
      rootMargin: '100px',    // 提前100px触发加载
      threshold: 0.1          // 元素显示10%时触发
    }
  )

  // 开始观察加载更多按钮容器
  if (loadMoreRef.value) {
    observer.observe(loadMoreRef.value)
  }
}

// 初始化页面数据
const initData = async () => {
  fetchArticles(true)
}

// 组件挂载时执行
onMounted(() => {
  // 初始化数据
  initData()
  // 初始化无限滚动监听器
  initIntersectionObserver()
})

// 组件卸载时执行
onUnmounted(() => {
  // 断开观察器连接，避免内存泄漏
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.latest-articles-page {
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
  padding: 60px 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: var(--border-radius-xl);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.page-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  color: #34495e;
  letter-spacing: 0.5px;
}

.page-title .el-icon {
  font-size: 2.2rem;
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.page-description {
  margin: 0;
  font-size: 1rem;
  color: #7f8c8d;
  position: relative;
  font-weight: 400;
  letter-spacing: 0.3px;
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
  grid-template-columns: 1fr;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  background: #667eea;
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
  background: #667eea;
  border-radius: 50%;
  transform: translateY(-50%);
  transition: width 0.3s, height 0.3s;
}

.category-item:hover {
  padding-left: var(--spacing-md);
  border-bottom-color: #764ba2;
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
  color: #667eea;
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
