<template>
  <div class="articles-page">
    <Header />

    <div class="container">
      <div class="content-grid">
        <!-- 左侧主要内容 -->
        <div class="main-section">
          <!-- 筛选条件 -->
          <div class="filter-section">
            <el-card class="filter-card">
              <div class="filter-row">
                <div class="filter-item">
                  <label>分类：</label>
                  <el-select v-model="filters.categoryId" placeholder="全部分类" clearable @change="handleFilterChange">
                    <el-option v-for="category in categories" :key="category.id" :label="category.name"
                      :value="category.id" />
                  </el-select>
                </div>

                <div class="filter-item">
                  <label>标签：</label>
                  <el-select v-model="filters.tagId" placeholder="全部标签" clearable @change="handleFilterChange">
                    <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
                  </el-select>
                </div>

                <div class="filter-item">
                  <label>排序：</label>
                  <el-select v-model="filters.orderBy" placeholder="默认排序" @change="handleFilterChange">
                    <el-option label="最新发布" value="CREATE_TIME_DESC" />
                    <el-option label="最早发布" value="CREATE_TIME_ASC" />
                    <el-option label="最新编辑" value="UPDATE_TIME_DESC" />
                    <el-option label="最早编辑" value="UPDATE_TIME_ASC" />
                  </el-select>
                </div>
              </div>

              <div class="search-row">
                <el-input v-model="filters.keyword" placeholder="搜索文章标题或内容..." clearable
                  @keyup.enter="handleFilterChange">
                  <template #append>
                    <el-button :icon="Search" @click="handleFilterChange" />
                  </template>
                </el-input>
              </div>
            </el-card>
          </div>

          <!-- 文章列表 - 瀑布流 -->
          <div class="article-list" ref="articleListRef">
            <ArticleCard v-for="article in articles" :key="article.id" :article="article"
              :show-actions="userStore.isLogin && (userStore.isAdmin || userStore.userInfo.id === article.authorId)"
              @delete="handleDeleteArticle" />
          </div>

          <!-- 加载更多指示器 -->
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

          <!-- 空状态 -->
          <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />
        </div>

        <!-- 右侧侧边栏 -->
        <aside class="sidebar">
          <!-- 热门标签 -->
          <div class="widget tags-widget">
            <h3 class="widget-title">热门标签</h3>
            <div class="tags-cloud">
              <el-tag v-for="tag in hotTags" :key="tag.id" :color="tag.color" size="small" class="tag-item"
                @click="handleTagClick(tag)">
                {{ tag.name }}
              </el-tag>
            </div>
          </div>

          <!-- 分类导航 -->
          <div class="widget categories-widget">
            <h3 class="widget-title">文章分类</h3>
            <ul class="category-list">
              <li v-for="category in categories" :key="category.id" class="category-item">
                <a href="javascript:;" @click="handleCategoryClick(category)">
                  {{ category.name }}
                  <span class="count">({{ category.articleCount || 0 }})</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useUserStore } from '@/store'
import {
  queryArticles,
  getArticlesByTag,
  deleteArticle
} from '@/api/article'
import { getTagList, getHotTags } from '@/api/tag'
import { getCategoryList } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 数据
const articles = ref([])
const categories = ref([])
const tags = ref([])
const hotTags = ref([])
const loading = ref(false)
const hasMore = ref(true)
const pageNum = ref(1)
const pageSize = ref(10)

// 瀑布流相关
const articleListRef = ref(null)
const loadMoreRef = ref(null)
let observer = null

// 筛选条件
const filters = reactive({
  categoryId: null,
  tagId: null,
  orderBy: 'CREATE_TIME_DESC',
  keyword: ''
})

// 获取文章列表
const fetchArticles = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true

    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    let data = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }

    // 根据不同情况调用不同接口
    if (filters.tagId) {
      // 按标签筛选 - 使用通用查询接口
      data.tagIds = [filters.tagId]
      if (filters.orderBy) data.orderBy = filters.orderBy
      if (filters.keyword) data.keyword = filters.keyword

      const res = await queryArticles(data)
      if (reset) {
        articles.value = res.data.list || []
      } else {
        articles.value = [...articles.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasNextPage
    } else {
      // 常规筛选 - 使用通用查询接口
      if (filters.categoryId) data.categoryId = filters.categoryId
      if (filters.keyword) data.keyword = filters.keyword
      if (filters.orderBy) data.orderBy = filters.orderBy

      const res = await queryArticles(data)
      if (reset) {
        articles.value = res.data.list || []
      } else {
        articles.value = [...articles.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasNextPage
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  fetchArticles()
}

// 初始化瀑布流滚动监听
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

// 处理筛选条件变化
const handleFilterChange = () => {
  fetchArticles(true)
}

// 处理标签点击
const handleTagClick = (tag) => {
  filters.tagId = tag.id
  fetchArticles(true)
}

// 处理分类点击
const handleCategoryClick = (category) => {
  filters.categoryId = category.id
  filters.tagId = null // 清除标签筛选
  fetchArticles(true)
}

// 处理删除文章
const handleDeleteArticle = async (articleId) => {
  try {
    await deleteArticle(articleId)
    ElMessage.success('删除成功')
    fetchArticles(true)
  } catch (error) {
    console.error('删除文章失败:', error)
    ElMessage.error('删除文章失败')
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    const res = await getTagList()
    tags.value = res.data
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 获取热门标签
const fetchHotTags = async () => {
  try {
    const res = await getHotTags(20)
    hotTags.value = res.data
  } catch (error) {
    console.error('获取热门标签失败:', error)
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchCategories(),
    fetchTags(),
    fetchHotTags()
  ])

  // 处理路由参数
  const { categoryId, tagId, keyword, orderBy } = route.query
  if (categoryId) filters.categoryId = parseInt(categoryId)
  if (tagId) filters.tagId = parseInt(tagId)
  if (keyword) filters.keyword = keyword
  if (orderBy) filters.orderBy = orderBy.toUpperCase()

  fetchArticles(true)
}

// 监听路由变化
watch(() => route.query, () => {
  const { categoryId, tagId, keyword, orderBy } = route.query
  if (categoryId) filters.categoryId = parseInt(categoryId)
  if (tagId) filters.tagId = parseInt(tagId)
  if (keyword) filters.keyword = keyword
  if (orderBy) filters.orderBy = orderBy.toUpperCase()
  fetchArticles(true)
}, { immediate: false })

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
.articles-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

/* 主要部分 */
.main-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 筛选部分 */
.filter-section {
  margin-bottom: var(--spacing-md);
}

.filter-card {
  border-radius: var(--border-radius-xl);
  border: none;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-base);
}

.filter-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.filter-row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 150px;
}

.filter-item label {
  white-space: nowrap;
  font-weight: 500;
  color: var(--text-regular);
  font-size: 14px;
}

.search-row {
  width: 100%;
}

/* 文章列表 - 瀑布流 */
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

/* 侧边栏 */
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

/* 标签云 */
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

/* 分类列表 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    order: 2;
  }

  .filter-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .filter-item {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: var(--spacing-md);
  }

  .filter-row {
    margin-bottom: var(--spacing-md);
  }
}
</style>
