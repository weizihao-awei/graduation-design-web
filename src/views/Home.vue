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
  background: var(--bg-page);
}

/* Banner样式 */
.banner {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  padding: 100px 0;
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
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeIn 1s ease-out;
}

.banner-subtitle {
  font-size: 1.3rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
  animation: fadeIn 1s ease-out 0.2s both;
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  animation: fadeIn 1s ease-out 0.4s both;
}

.banner-actions .el-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius-xl);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: var(--transition-base);
}

.banner-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* 主要内容区域 */
.main-content {
  padding: var(--spacing-xl) 0;
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
  gap: var(--spacing-xl);
}

.section {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
  overflow: hidden;
  position: relative;
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  opacity: 0;
  transition: var(--transition-fast);
}

.section:hover::before {
  opacity: 1;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
}

.section-title .el-icon {
  color: var(--primary-color);
  font-size: 1.2em;
}

.more-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
  position: relative;
}

.more-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-fast);
}

.more-link:hover {
  color: var(--primary-dark);
}

.more-link:hover::after {
  width: 100%;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

/* 统计小部件 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transform: scaleX(0);
  transition: var(--transition-base);
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-light);
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  transition: var(--transition-fast);
}

.stat-item:hover .stat-number {
  transform: scale(1.1);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
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
  
  .banner {
    padding: 60px 0;
  }
  
  .banner-title {
    font-size: 2.5rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .banner-actions .el-button {
    width: 200px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);
  }
  
  .stat-item {
    padding: var(--spacing-md);
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1.1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>