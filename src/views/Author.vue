<template>
  <div class="author-page">
    <Header />

    <div class="container">
      <div v-loading="loading" class="author-container">
        <div v-if="authorInfo.id" class="author-content">
          <div class="author-header">
            <div class="author-cover"></div>
            <div class="author-info-section">
              <div class="author-avatar">
                <el-avatar :size="120" :src="getAvatarUrl(authorInfo.avatar)">
                  {{ authorInfo.nickname?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="author-details">
                <h1 class="author-name">{{ authorInfo.nickname }}</h1>
                <p class="author-intro">{{ authorInfo.intro || '这个人很懒，还没有写简介~' }}</p>
                <p class="author-signature">{{ authorInfo.signature }}</p>
                <div class="author-actions" v-if="userStore.isLogin && userStore.userInfo.id !== authorInfo.id">
                  <el-button type="primary" :icon="ChatDotRound" @click="handleSendMessage">私信</el-button>
                </div>
              </div>
              <div class="author-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.articlesCount) }}</div>
                  <div class="stat-label">文章</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.followersCount) }}</div>
                  <div class="stat-label">粉丝</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.followingCount) }}</div>
                  <div class="stat-label">关注</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.totalViews) }}</div>
                  <div class="stat-label">浏览</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.totalLikes) }}</div>
                  <div class="stat-label">点赞</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(authorInfo.totalCollections) }}</div>
                  <div class="stat-label">收藏</div>
                </div>
              </div>
            </div>
          </div>

          <div class="author-articles">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span class="section-title">作者文章</span>
                </div>
              </template>

              <div class="article-list" v-infinite-scroll="loadMore"
                :infinite-scroll-disabled="!hasMore || loadingArticles">
                <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
              </div>

              <div class="loading-more" v-if="loadingArticles">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>

              <el-empty v-if="!loadingArticles && articles.length === 0" description="暂无文章" />
            </el-card>
          </div>
        </div>

        <el-empty v-else-if="!loading" description="作者不存在" />
      </div>
    </div>

    <ChatDialog v-model="chatDialogVisible" :other-nickname="authorInfo.nickname" :other-avatar="authorInfo.avatar"
      :other-user-id="authorInfo.id" :chat-id="chatId" />

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import { Loading, ChatDotRound } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getAuthorInfo } from '@/api/user'
import { getUserPublished } from '@/api/user'
import { getOrCreateChat } from '@/api/message'
import ChatDialog from '@/components/ChatDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loadingArticles = ref(false)
const authorInfo = ref({})
const articles = ref([])
const hasMore = ref(true)
const pageNum = ref(1)
const chatDialogVisible = ref(false)
const chatId = ref('')

const fetchAuthorInfo = async () => {
  const userId = route.params.userId
  if (!userId) return

  try {
    loading.value = true
    const res = await getAuthorInfo({ userId })
    authorInfo.value = res.data
  } catch (error) {
    console.error('获取作者信息失败:', error)
    ElMessage.error('获取作者信息失败')
  } finally {
    loading.value = false
  }
}

const fetchArticles = async (reset = false) => {
  const userId = route.params.userId
  if (!userId || loadingArticles.value) return

  try {
    loadingArticles.value = true

    if (reset) {
      pageNum.value = 1
      articles.value = []
      hasMore.value = true
    }

    const res = await getUserPublished({
      userId,
      pageNum: pageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    })

    if (reset) {
      articles.value = res.data.list || []
    } else {
      articles.value = [...articles.value, ...(res.data.list || [])]
    }

    hasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取作者文章失败:', error)
    ElMessage.error('获取作者文章失败')
  } finally {
    loadingArticles.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loadingArticles.value) return
  pageNum.value++
  fetchArticles()
}

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

const getAvatarUrl = (avatar) => {
  if (!avatar) return ''
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const cleanUri = avatar.startsWith('/api/') ? avatar.substring(4) : avatar
  return baseUrl + cleanUri
}

const handleSendMessage = async () => {
  try {
    const res = await getOrCreateChat({
      otherUserId: authorInfo.value.id
    })
    chatId.value = res.data
    chatDialogVisible.value = true
  } catch (error) {
    ElMessage.error('创建会话失败')
  }
}

watch(() => route.params.userId, () => {
  fetchAuthorInfo()
  fetchArticles(true)
})

onMounted(() => {
  fetchAuthorInfo()
  fetchArticles(true)
})
</script>

<style scoped>
.author-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.author-container {
  animation: fadeIn 0.5s ease-in-out;
}

.author-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.author-header {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.author-cover {
  height: 200px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  position: relative;
}

.author-cover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
}

.author-info-section {
  padding: 0 40px 40px 40px;
  position: relative;
}

.author-avatar {
  position: absolute;
  top: -60px;
  left: 40px;
}

.author-avatar :deep(.el-avatar) {
  border: 4px solid var(--bg-white);
  box-shadow: var(--shadow-card);
}

.author-details {
  padding-top: 70px;
  margin-bottom: 30px;
}

.author-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.author-intro {
  font-size: 1rem;
  color: var(--text-regular);
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.author-signature {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.author-actions {
  margin-top: 16px;
}

.author-stats {
  display: flex;
  gap: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-lighter);
}

.stat-item {
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.author-articles {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-card);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.article-list {
  min-height: 200px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-secondary);
}

.loading-more .el-icon {
  margin-right: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .author-info-section {
    padding: 0 20px 30px 20px;
  }

  .author-avatar {
    left: 20px;
  }

  .author-name {
    font-size: 1.5rem;
  }

  .author-stats {
    gap: 20px;
    overflow-x: auto;
  }

  .stat-item {
    min-width: 60px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .author-cover {
    height: 150px;
  }

  .author-avatar {
    top: -50px;
  }

  .author-avatar :deep(.el-avatar) {
    width: 80px !important;
    height: 80px !important;
  }

  .author-details {
    padding-top: 50px;
  }

  .author-name {
    font-size: 1.25rem;
  }

  .author-intro {
    font-size: 0.875rem;
  }

  .author-stats {
    gap: 15px;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>
