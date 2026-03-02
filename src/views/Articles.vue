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
                    <el-option
                      v-for="category in categories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.id"
                    />
                  </el-select>
                </div>
                
                <div class="filter-item">
                  <label>标签：</label>
                  <el-select v-model="filters.tagId" placeholder="全部标签" clearable @change="handleFilterChange">
                    <el-option
                      v-for="tag in tags"
                      :key="tag.id"
                      :label="tag.name"
                      :value="tag.id"
                    />
                  </el-select>
                </div>
                
                <div class="filter-item">
                  <label>排序：</label>
                  <el-select v-model="filters.sort" placeholder="默认排序" @change="handleFilterChange">
                    <el-option label="最新发布" value="newest" />
                    <el-option label="最多浏览" value="hot" />
                    <el-option label="最多点赞" value="liked" />
                  </el-select>
                </div>
              </div>
              
              <div class="search-row">
                <el-input
                  v-model="filters.keyword"
                  placeholder="搜索文章标题或内容..."
                  clearable
                  @keyup.enter="handleFilterChange"
                >
                  <template #append>
                    <el-button :icon="Search" @click="handleFilterChange" />
                  </template>
                </el-input>
              </div>
            </el-card>
          </div>
          
          <!-- 文章列表 -->
          <div class="article-list">
            <ArticleCard 
              v-for="article in articles" 
              :key="article.id" 
              :article="article" 
              :show-actions="userStore.isLogin && (userStore.isAdmin || userStore.userInfo.id === article.authorId)"
              @delete="handleDeleteArticle"
            />
          </div>
          
          <!-- 加载更多 -->
          <div class="load-more" v-if="hasMore">
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="loadMore"
            >
              {{ loading ? '加载中...' : '加载更多' }}
            </el-button>
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
              <el-tag
                v-for="tag in hotTags"
                :key="tag.id"
                :color="tag.color"
                size="small"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useUserStore } from '@/store'
import { 
  getArticleList, 
  getArticlesByTag,
  getHotArticles,
  deleteArticle 
} from '@/api/article'
import { getTagList, getHotTags } from '@/api/tag'
import { getCategoryList } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

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

// 筛选条件
const filters = reactive({
  categoryId: null,
  tagId: null,
  sort: 'newest',
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
    
    let params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    
    // 根据不同情况调用不同接口
    if (filters.tagId) {
      // 按标签筛选
      const res = await getArticlesByTag(filters.tagId, params)
      if (reset) {
        articles.value = res.data.list || []
      } else {
        articles.value = [...articles.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasNextPage
    } else {
      // 常规筛选
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.keyword) params.keyword = filters.keyword
      
      // 根据排序方式调用不同接口
      let res
      if (filters.sort === 'hot' && !filters.categoryId && !filters.keyword) {
        // 获取热门文章
        res = await getHotArticles(pageSize.value)
        if (reset) {
          articles.value = res.data || []
        } else {
          articles.value = [...articles.value, ...(res.data || [])]
        }
        hasMore.value = false // 热门文章不分页
      } else {
        // 常规文章列表
        res = await getArticleList(params)
        if (reset) {
          articles.value = res.data.list || []
        } else {
          articles.value = [...articles.value, ...(res.data.list || [])]
        }
        hasMore.value = res.data.hasNextPage
      }
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
  const { categoryId, tagId, keyword, sort } = route.query
  if (categoryId) filters.categoryId = parseInt(categoryId)
  if (tagId) filters.tagId = parseInt(tagId)
  if (keyword) filters.keyword = keyword
  if (sort) filters.sort = sort
  
  fetchArticles(true)
}

// 监听路由变化
watch(() => route.query, () => {
  const { categoryId, tagId, keyword, sort } = route.query
  if (categoryId) filters.categoryId = parseInt(categoryId)
  if (tagId) filters.tagId = parseInt(tagId)
  if (keyword) filters.keyword = keyword
  if (sort) filters.sort = sort
  fetchArticles(true)
}, { immediate: false })

onMounted(() => {
  initData()
})
</script>

<style scoped>
.articles-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* 主要部分 */
.main-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 筛选部分 */
.filter-section {
  margin-bottom: 10px;
}

.filter-card {
  border-radius: 8px;
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.filter-item label {
  white-space: nowrap;
  font-weight: 500;
  color: #606266;
}

.search-row {
  width: 100%;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.widget {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.widget-title {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 标签云 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: scale(1.1);
}

/* 分类列表 */
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item a {
  color: #606266;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  transition: color 0.3s;
}

.category-item a:hover {
  color: #409EFF;
}

.count {
  color: #909399;
  font-size: 14px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-item {
    width: 100%;
  }
}
</style>