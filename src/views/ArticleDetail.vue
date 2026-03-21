<template>
  <div class="article-detail-page">
    <Header />

    <div class="container">
      <div class="article-container">
        <el-card v-if="article" class="article-card">
          <!-- 文章头部 -->
          <header class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>

            <div class="article-meta">
              <div class="author-info" @click="handleAuthorClick">
                <el-avatar :size="32" :src="getAvatarUrl(article.authorAvatar)">
                  {{ article.authorName?.charAt(0) }}
                </el-avatar>
                <div class="author-details">
                  <span class="author-name">{{ article.authorName }}</span>
                  <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
                </div>
              </div>

            
            </div>

            <div class="article-tags" v-if="article.tags && article.tags.length">
              <el-tag v-for="tag in article.tags" :key="tag.id" size="small" @click="handleTagClick(tag)">
                {{ tag.name }}
              </el-tag>
            </div>
          </header>

          <!-- 文章内容 -->
          <div class="article-content" v-html="article.htmlContent"></div>

          <!-- 文章操作 -->
          <div class="article-actions">
            <el-button type="primary" :icon="article.isLiked ? 'Star' : 'StarFilled'" @click="handleLike">
              {{ article.isLiked ? '取消点赞' : '点赞' }}
            </el-button>
            <el-button type="success" :icon="article.isCollected ? 'Folder' : 'FolderFilled'" @click="handleCollect">
              {{ article.isCollected ? '取消收藏' : '收藏' }}
            </el-button>
            <el-button @click="handleShare">
              <el-icon>
                <Share />
              </el-icon>
              分享
            </el-button>
          </div>

          <!-- 管理操作 -->
          <div v-if="showActions" class="admin-actions">
            <el-button type="primary" @click="handleEdit">
              编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              删除
            </el-button>
          </div>
        </el-card>

        <CommentSection ref="commentSectionRef" :article-id="String(articleId)"
          @update-comment-count="handleUpdateCommentCount" />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CommentSection from '@/components/CommentSection.vue'
import { useUserStore } from '@/store'
import {
  getArticleDetail,
  operateArticle,
  deleteArticle
} from '@/api/article'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, ChatDotRound, Share } from '@element-plus/icons-vue'
import { formatDate } from '@/utils'

const route = useRoute()
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

const articleId = computed(() => route.params.id)

const article = ref(null)
const commentSectionRef = ref(null)

// 计算属性
const showActions = computed(() => {
  return userStore.isLogin &&
    (userStore.isAdmin || userStore.userInfo.id === article.value?.authorId)
})

const fetchArticleDetail = async () => {
  try {
    const res = await getArticleDetail(String(articleId.value))
    article.value = res.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

// 处理点赞
const handleLike = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const operationType = article.value.isLiked ? 'unlike' : 'like'
    await operateArticle(String(articleId.value), operationType)

    if (article.value.isLiked) {
      article.value.likeCount--
      article.value.isLiked = false
      ElMessage.success('取消点赞')
    } else {
      article.value.likeCount++
      article.value.isLiked = true
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleCollect = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const operationType = article.value.isCollected ? 'uncollect' : 'collect'
    await operateArticle(String(articleId.value), operationType)

    if (article.value.isCollected) {
      article.value.isCollected = false
      ElMessage.success('取消收藏')
    } else {
      article.value.isCollected = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理分享
const handleShare = () => {
  const url = window.location.href
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制链接')
    })
  } else {
    ElMessage.error('您的浏览器不支持此功能，请手动复制链接')
  }
}

// 处理编辑
const handleEdit = () => {
  router.push(`/write/${articleId.value}`)
}

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteArticle(String(articleId.value))
    ElMessage.success('删除成功')
    router.push('/articles')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  }
}

const handleTagClick = (tag) => {
  router.push({
    path: '/articles',
    query: { tagId: tag.id }
  })
}

const handleUpdateCommentCount = (count) => {
  if (article.value) {
    article.value.commentCount = count
  }
}

const handleAuthorClick = () => {
  if (article.value?.authorId) {
    router.push(`/author/${article.value.authorId}`)
  }
}

const initData = async () => {
  await fetchArticleDetail()

  if (commentSectionRef.value) {
    commentSectionRef.value.fetchComments()
  }
}

onMounted(() => {
  if (!articleId.value) {
    ElMessage.error('无效的文章ID')
    router.push('/articles')
    return
  }

  initData()
})
</script>

<style scoped>
.article-detail-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.article-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.article-card {
  border-radius: var(--border-radius-xl);
  border: none;
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
  overflow: hidden;
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

/* 文章头部 */
.article-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-lighter);
}

.article-title {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg);
  line-height: 1.3;
  font-weight: 700;
  position: relative;
}

.article-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-base);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
}

.author-info:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.publish-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.article-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-fast);
}

.stat-item:hover {
  color: var(--primary-color);
}

.article-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.article-tags .el-tag {
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.article-tags .el-tag::before {
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

.article-tags .el-tag:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-light);
  z-index: 1;
}

.article-tags .el-tag:hover::before {
  width: 100px;
  height: 100px;
}

/* 文章内容 */
.article-content {
  line-height: 1.8;
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: var(--spacing-lg) 0 var(--spacing-md);
  color: var(--text-primary);
  font-weight: 600;
  position: relative;
}

.article-content :deep(h1)::after,
.article-content :deep(h2)::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-base);
}

.article-content :deep(h1) {
  font-size: 1.8rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  font-size: 1.3rem;
}

.article-content :deep(h4) {
  font-size: 1.2rem;
}

.article-content :deep(h5) {
  font-size: 1.1rem;
}

.article-content :deep(h6) {
  font-size: 1rem;
}

.article-content :deep(p) {
  margin: var(--spacing-md) 0;
  text-align: justify;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-lg) 0;
  box-shadow: var(--shadow-light);
  transition: var(--transition-base);
}

.article-content :deep(img):hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-hover);
}

.article-content :deep(pre) {
  background: var(--bg-page);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  overflow-x: auto;
  margin: var(--spacing-lg) 0;
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-lighter);
}

.article-content :deep(code) {
  background: var(--bg-page);
  padding: 2px 6px;
  border-radius: var(--border-radius-base);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: var(--primary-color);
  border: 1px solid var(--border-lighter);
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding: 0 var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  color: var(--text-regular);
  background: var(--bg-page);
  border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
  box-shadow: var(--shadow-base);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: var(--spacing-lg);
  margin: var(--spacing-md) 0;
}

.article-content :deep(li) {
  margin-bottom: var(--spacing-sm);
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-lg) 0;
  box-shadow: var(--shadow-base);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-lighter);
}

.article-content :deep(th) {
  background: var(--bg-page);
  font-weight: 600;
  color: var(--text-primary);
}

.article-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px dotted var(--primary-color);
  transition: var(--transition-fast);
}

.article-content :deep(a):hover {
  color: var(--primary-dark);
  border-bottom-style: solid;
}

/* 文章操作 */
.article-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
  flex-wrap: wrap;
}

.article-actions .el-button {
  padding: 10px 20px;
  font-weight: 600;
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-base);
}

.article-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.admin-actions {
  display: flex;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--border-lighter);
  justify-content: center;
}

.admin-actions .el-button {
  padding: 8px 16px;
  font-weight: 500;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.admin-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .article-actions {
    justify-content: center;
  }

  .article-content {
    padding: var(--spacing-md);
    font-size: 15px;
  }

  .article-content :deep(h1) {
    font-size: 1.6rem;
  }

  .article-content :deep(h2) {
    font-size: 1.4rem;
  }

  .article-content :deep(h3) {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.5rem;
  }

  .article-content {
    font-size: 14px;
  }

  .article-content :deep(img) {
    margin: var(--spacing-md) 0;
  }

  .article-content :deep(pre) {
    padding: var(--spacing-md);
    overflow-x: auto;
  }
}
</style>
