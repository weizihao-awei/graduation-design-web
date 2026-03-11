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
      <div class="content-layout">
        <!-- 左侧主要内容 -->
        <div class="main-section">
          <!-- 推荐文章 -->
          <section v-if="recommendArticles.length" class="featured-section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><Star /></el-icon>
                推荐文章
              </h2>
              <router-link to="/articles?orderBy=recommend" class="more-link">
                查看更多
                <el-icon><ArrowRight /></el-icon>
              </router-link>
            </div>
            <div class="featured-grid">
              <ArticleCard 
                v-for="article in recommendArticles" 
                :key="article.id" 
                :article="article"
                class="featured-card"
              />
            </div>
          </section>
          
          <!-- 热门文章 -->
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><HotWater /></el-icon>
                热门文章
              </h2>
              <router-link to="/articles?orderBy=hot" class="more-link">
                查看更多
                <el-icon><ArrowRight /></el-icon>
              </router-link>
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
                <el-icon><Clock /></el-icon>
                最新文章
              </h2>
              <router-link to="/articles?orderBy=latest" class="more-link">
                查看更多
                <el-icon><ArrowRight /></el-icon>
              </router-link>
            </div>
            <div class="article-list">
              <ArticleCard 
                v-for="article in latestArticles" 
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
            <h3 class="widget-title">
              <el-icon><DataAnalysis /></el-icon>
              站点统计
            </h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.userCount || 0 }}</div>
                  <div class="stat-label">用户</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.articleCount || 0 }}</div>
                  <div class="stat-label">文章</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><View /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.viewCount || 0 }}</div>
                  <div class="stat-label">浏览</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ statistics.commentCount || 0 }}</div>
                  <div class="stat-label">评论</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 热门标签 -->
          <div class="widget tags-widget">
            <h3 class="widget-title">
              <el-icon><PriceTag /></el-icon>
              热门标签
            </h3>
            <div class="tags-cloud">
              <el-tag
                v-for="tag in hotTags"
                :key="tag.id"
                :color="tag.color"
                size="large"
                class="tag-item"
                @click="$router.push(`/tag/${tag.id}`)"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
          
          <!-- 分类导航 -->
          <div class="widget categories-widget">
            <h3 class="widget-title">
              <el-icon><Menu /></el-icon>
              文章分类
            </h3>
            <ul class="category-list">
              <li v-for="category in categories" :key="category.id" class="category-item">
                <router-link :to="`/articles?categoryId=${category.id}`">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="count">{{ category.articleCount || 0 }}</span>
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
import { 
  HotWater, 
  Clock, 
  Star, 
  ArrowRight,
  DataAnalysis,
  User,
  Document,
  View,
  ChatDotRound,
  PriceTag,
  Menu
} from '@element-plus/icons-vue'

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
    const res = await getHotArticles({ pageNum: 1, pageSize: 5 })
    hotArticles.value = res.data.list || []
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

// 获取最新文章
const fetchLatestArticles = async () => {
  try {
    const res = await getLatestArticles({ pageNum: 1, pageSize: 5 })
    latestArticles.value = res.data.list || []
  } catch (error) {
    console.error('获取最新文章失败:', error)
  }
}

// 获取推荐文章
const fetchRecommendArticles = async () => {
  try {
    const res = await getRecommendArticles({ pageNum: 1, pageSize: 5 })
    recommendArticles.value = res.data.list || []
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
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4fd 100%);
}

/* Banner样式 */
.banner {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
}

.banner-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: fadeInDown 0.8s ease-out;
}

.banner-subtitle {
  font-size: 1.4rem;
  margin-bottom: 40px;
  opacity: 0.95;
  animation: fadeInDown 0.8s ease-out 0.2s both;
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  animation: fadeInDown 0.8s ease-out 0.4s both;
}

.banner-actions .el-button {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.banner-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主要内容区域 */
.main-content {
  padding: 40px 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

/* 主要部分 */
.main-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.featured-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(64, 158, 255, 0.1);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.featured-card {
  transition: transform 0.3s ease;
}

.featured-card:hover {
  transform: translateY(-5px);
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.section:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.section-title .el-icon {
  color: #409eff;
  font-size: 1.3em;
}

.more-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
}

.more-link:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateX(5px);
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.widget:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.widget-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.widget-title .el-icon {
  color: #409eff;
  font-size: 1.2em;
}

/* 统计小部件 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateX(5px);
}

.stat-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 10px;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* 标签云 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  font-weight: 600;
}

.tag-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: inherit;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  z-index: 1;
}

.tag-item:hover::before {
  transform: scaleX(1);
}

/* 分类列表 */
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  background: rgba(64, 158, 255, 0.05);
  padding-left: 15px;
  border-bottom-color: #409eff;
}

.category-item a {
  color: #2c3e50;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-item a:hover {
  color: #409eff;
}

.category-name {
  font-size: 15px;
}

.count {
  color: #6c757d;
  font-size: 13px;
  background: rgba(64, 158, 255, 0.1);
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr 280px;
  }
  
  .featured-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .banner {
    padding: 60px 0;
  }
  
  .banner-title {
    font-size: 2.5rem;
  }
  
  .banner-subtitle {
    font-size: 1.2rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .banner-actions .el-button {
    width: 200px;
  }
  
  .main-content {
    padding: 30px 0;
  }
  
  .content-layout {
    gap: 25px;
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .stat-number {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .banner {
    padding: 40px 0;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .banner-actions .el-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .main-content {
    padding: 20px 0;
  }
  
  .section,
  .widget,
  .featured-section {
    padding: 20px;
  }
  
  .section-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .widget-title {
    font-size: 1.1rem;
    padding-bottom: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
  }
}
</style>