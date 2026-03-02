<template>
  <div class="home-page">
    <!-- 头部 -->
    <Header />
    
    <!-- Banner -->
    <div class="banner">
      <div class="container">
        <div class="banner-content">
          <h1 class="banner-title">欢迎来到技术博客</h1>
          <p class="banner-subtitle">分享技术心得，记录成长足迹</p>
          <div class="banner-actions">
            <el-button type="primary" size="large" @click="$router.push('/articles')">
              浏览文章
            </el-button>
            <el-button v-if="userStore.isLogin" type="success" size="large" @click="$router.push('/write')">
              写文章
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="container main-content">
      <div class="content-grid">
        <!-- 左侧主要内容 -->
        <div class="main-section">
          <!-- 热门文章 -->
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><HotWater /></el-icon>
                热门文章
              </h2>
              <router-link to="/articles?sort=hot" class="more-link">更多 ></router-link>
            </div>
            <div class="article-list">
              <ArticleCard 
                v-for="article in hotArticles" 
                :key="article.id" 
                :article="article" 
              />
            </div>
          </section>
          
          <!-- 最新文章 -->
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><AlarmClock /></el-icon>
                最新文章
              </h2>
              <router-link to="/articles?sort=newest" class="more-link">更多 ></router-link>
            </div>
            <div class="article-list">
              <ArticleCard 
                v-for="article in latestArticles" 
                :key="article.id" 
                :article="article" 
              />
            </div>
          </section>
          
          <!-- 推荐文章 -->
          <section v-if="recommendArticles.length" class="section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><MagicStick /></el-icon>
                推荐文章
              </h2>
            </div>
            <div class="article-list">
              <ArticleCard 
                v-for="article in recommendArticles" 
                :key="article.id" 
                :article="article" 
              />
            </div>
          </section>
        </div>
        
        <!-- 右侧侧边栏 -->
        <aside class="sidebar">
          <!-- 统计信息 -->
          <div class="widget statistics-widget">
            <h3 class="widget-title">站点统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ statistics.userCount || 0 }}</div>
                <div class="stat-label">用户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ statistics.articleCount || 0 }}</div>
                <div class="stat-label">文章</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ statistics.viewCount || 0 }}</div>
                <div class="stat-label">浏览</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ statistics.commentCount || 0 }}</div>
                <div class="stat-label">评论</div>
              </div>
            </div>
          </div>
          
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
                @click="$router.push(`/tag/${tag.id}`)"
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
                <router-link :to="`/articles?categoryId=${category.id}`">
                  {{ category.name }}
                  <span class="count">({{ category.articleCount || 0 }})</span>
                </router-link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
    
    <!-- 底部 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { useUserStore } from '@/store'
import { 
  getHotArticles, 
  getLatestArticles, 
  getRecommendArticles 
} from '@/api/article'
import { getHotTags } from '@/api/tag'
import { getCategoryList } from '@/api/category'
import { getStatistics } from '@/api/statistics'
import { ElMessage } from 'element-plus'
import { HotWater, AlarmClock, MagicStick } from '@element-plus/icons-vue'

const userStore = useUserStore()

// 数据
const hotArticles = ref([])
const latestArticles = ref([])
const recommendArticles = ref([])
const hotTags = ref([])
const categories = ref([])
const statistics = ref({})

// 获取热门文章
const fetchHotArticles = async () => {
  try {
    const res = await getHotArticles(5)
    hotArticles.value = res.data
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

// 获取最新文章
const fetchLatestArticles = async () => {
  try {
    const res = await getLatestArticles(5)
    latestArticles.value = res.data
  } catch (error) {
    console.error('获取最新文章失败:', error)
  }
}

// 获取推荐文章
const fetchRecommendArticles = async () => {
  try {
    const res = await getRecommendArticles(5)
    recommendArticles.value = res.data
  } catch (error) {
    console.error('获取推荐文章失败:', error)
  }
}

// 获取热门标签
const fetchHotTags = async () => {
  try {
    const res = await getHotTags(15)
    hotTags.value = res.data
  } catch (error) {
    console.error('获取热门标签失败:', error)
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

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchHotArticles(),
    fetchLatestArticles(),
    fetchRecommendArticles(),
    fetchHotTags(),
    fetchCategories(),
    fetchStatistics()
  ])
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Banner样式 */
.banner {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 主要内容区域 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 40px 0;
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
  gap: 40px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.more-link {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.more-link:hover {
  color: #66b1ff;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

/* 统计小部件 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #606266;
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

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>