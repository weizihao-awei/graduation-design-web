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
              <div class="author-info">
                <el-avatar :size="32" :src="article.authorAvatar">
                  {{ article.authorName?.charAt(0) }}
                </el-avatar>
                <div class="author-details">
                  <span class="author-name">{{ article.authorName }}</span>
                  <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
                </div>
              </div>
              
              <div class="article-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ article.viewCount }}
                </span>
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ article.likeCount }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ article.commentCount }}
                </span>
              </div>
            </div>
            
            <div class="article-tags" v-if="article.tags && article.tags.length">
              <el-tag
                v-for="tag in article.tags"
                :key="tag.id"
                :color="tag.color"
                size="small"
                @click="handleTagClick(tag)"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </header>
          
          <!-- 文章内容 -->
          <div class="article-content" v-html="article.htmlContent"></div>
          
          <!-- 文章操作 -->
          <div class="article-actions">
            <el-button 
              type="primary" 
              :icon="article.isLiked ? 'Star' : 'StarFilled'"
              @click="handleLike"
            >
              {{ article.isLiked ? '取消点赞' : '点赞' }}
            </el-button>
            <el-button 
              type="success"
              :icon="article.isCollected ? 'Folder' : 'FolderFilled'"
              @click="handleCollect"
            >
              {{ article.isCollected ? '取消收藏' : '收藏' }}
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
          
          <!-- 管理操作 -->
          <div v-if="showActions" class="admin-actions">
            <el-button 
              type="primary" 
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </el-card>
        
        <!-- 评论区 -->
        <el-card class="comments-card">
          <template #header>
            <span>评论 ({{ comments.length }})</span>
          </template>
          
          <!-- 发表评论 -->
          <div class="comment-form" v-if="userStore.isLogin">
            <el-input
              v-model="commentContent"
              type="textarea"
              placeholder="发表你的评论..."
              :rows="3"
              maxlength="500"
              show-word-limit
            />
            <div class="comment-actions">
              <el-button 
                type="primary" 
                @click="handleSubmitComment"
                :loading="submittingComment"
              >
                发表评论
              </el-button>
            </div>
          </div>
          
          <div v-else class="login-tip">
            <el-alert
              title="请登录后发表评论"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <router-link to="/login" class="login-link">立即登录</router-link>
              </template>
            </el-alert>
          </div>
          
          <!-- 评论列表 -->
          <div class="comments-list" v-if="comments.length">
            <CommentItem
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              @reply="handleReply"
              @delete="handleDeleteComment"
            />
          </div>
          
          <!-- 空评论 -->
          <el-empty v-else description="暂无评论" />
        </el-card>
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
import CommentItem from '@/components/CommentItem.vue'
import { useUserStore } from '@/store'
import { 
  getArticleDetail,
  likeArticle,
  unlikeArticle,
  collectArticle,
  uncollectArticle,
  deleteArticle
} from '@/api/article'
import { 
  getCommentList,
  createComment,
  deleteComment
} from '@/api/comment'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, ChatDotRound, Share } from '@element-plus/icons-vue'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 文章ID
const articleId = computed(() => route.params.id)

// 数据
const article = ref(null)
const comments = ref([])
const commentContent = ref('')
const submittingComment = ref(false)

// 计算属性
const showActions = computed(() => {
  return userStore.isLogin && 
         (userStore.isAdmin || userStore.userInfo.id === article.value?.authorId)
})

// 获取文章详情
const fetchArticleDetail = async () => {
  try {
    const res = await getArticleDetail(articleId.value)
    article.value = res.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getCommentList(articleId.value)
    comments.value = res.data
  } catch (error) {
    console.error('获取评论列表失败:', error)
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
    if (article.value.isLiked) {
      await unlikeArticle(articleId.value)
      article.value.likeCount--
      article.value.isLiked = false
      ElMessage.success('取消点赞')
    } else {
      await likeArticle(articleId.value)
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
    if (article.value.isCollected) {
      await uncollectArticle(articleId.value)
      article.value.isCollected = false
      ElMessage.success('取消收藏')
    } else {
      await collectArticle(articleId.value)
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
    
    await deleteArticle(articleId.value)
    ElMessage.success('删除成功')
    router.push('/articles')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  }
}

// 处理标签点击
const handleTagClick = (tag) => {
  router.push({
    path: '/articles',
    query: { tagId: tag.id }
  })
}

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    submittingComment.value = true
    await createComment({
      articleId: articleId.value,
      content: commentContent.value.trim()
    })
    
    ElMessage.success('评论发表成功')
    commentContent.value = ''
    fetchComments() // 刷新评论列表
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    submittingComment.value = false
  }
}

// 处理回复评论
const handleReply = (parentComment) => {
  commentContent.value = `@${parentComment.username} `
}

// 处理删除评论
const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(commentId)
    ElMessage.success('删除成功')
    fetchComments() // 刷新评论列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchArticleDetail(),
    fetchComments()
  ])
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
  background: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 文章头部 */
.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-title {
  font-size: 2rem;
  color: #303133;
  margin: 0 0 20px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 500;
  color: #303133;
}

.publish-time {
  font-size: 14px;
  color: #909399;
}

.article-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-tags .el-tag {
  cursor: pointer;
}

/* 文章内容 */
.article-content {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  margin-bottom: 30px;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: 20px 0 10px;
  color: #303133;
}

.article-content :deep(p) {
  margin: 15px 0;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 15px 0;
}

.article-content :deep(pre) {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 15px 0;
}

.article-content :deep(code) {
  background: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #409EFF;
  padding-left: 15px;
  margin: 15px 0;
  color: #606266;
}

/* 文章操作 */
.article-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.admin-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

/* 评论区 */
.comments-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-form {
  margin-bottom: 20px;
}

.comment-actions {
  margin-top: 10px;
  text-align: right;
}

.login-tip {
  margin-bottom: 20px;
}

.login-link {
  color: #409EFF;
  text-decoration: none;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .article-actions {
    flex-wrap: wrap;
  }
}
</style>