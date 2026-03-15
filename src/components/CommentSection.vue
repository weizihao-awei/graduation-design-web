<template>
  <!-- 评论卡片组件 -->
  <el-card class="comments-card">
    <!-- 卡片头部：显示评论数量 -->
    <template #header>
      <span>评论 ({{ comments.length }})</span>
    </template>

    <!-- 评论表单区域：仅登录用户可见 -->
    <div class="comment-form" v-if="userStore.isLogin">
      <!-- 回复提示：当正在回复某条评论时显示 -->
      <div v-if="replyingTo" class="replying-tip">
        <span>正在回复 @{{ replyingToUsername }}</span>
        <el-button type="text" @click="handleCancelReply">取消</el-button>
      </div>
      <!-- 评论输入框 -->
      <el-input v-model="commentContent" type="textarea" placeholder="发表你的评论..." :rows="3" maxlength="500"
        show-word-limit />
      <!-- 评论操作按钮 -->
      <div class="comment-actions">
        <el-button type="primary" @click="handleSubmitComment" :loading="submittingComment">
          发表评论
        </el-button>
      </div>
    </div>

    <!-- 未登录提示：引导用户登录 -->
    <div v-else class="login-tip">
      <el-alert title="请登录后发表评论" type="info" :closable="false" show-icon>
        <template #default>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </template>
      </el-alert>
    </div>

    <!-- 评论列表：当有评论时显示 -->
    <div class="comments-list" v-if="comments.length">
      <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" :show-actions="userStore.isLogin"
        @reply="handleReply" @delete="handleDeleteComment" />
    </div>

    <!-- 空状态提示：当没有评论时显示 -->
    <el-empty v-else description="暂无评论" />
  </el-card>
</template>

<script setup>
// 引入 Vue 核心功能
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入子组件
import CommentItem from '@/components/CommentItem.vue'
// 引入用户状态管理
import { useUserStore } from '@/store'
// 引入评论相关 API
import {
  getCommentList,
  createComment,
  deleteComment
} from '@/api/comment'
// 引入 Element Plus 组件
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义组件 Props：接收文章 ID
const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

// 定义组件 Emits：向父组件发送更新评论数量的事件
const emit = defineEmits(['update-comment-count'])

// 初始化路由和用户状态
const router = useRouter()
const userStore = useUserStore()

// 响应式数据定义
const comments = ref([]) // 评论列表
const commentContent = ref('') // 评论内容输入
const submittingComment = ref(false) // 提交评论的加载状态
const replyingTo = ref(null) // 正在回复的评论 ID
const replyingToUsername = ref('') // 正在回复的用户名

/**
 * 获取评论列表
 * 从后端获取指定文章的所有评论，并更新评论数量
 */
const fetchComments = async () => {
  try {
    const res = await getCommentList(props.articleId)
    comments.value = res.data
    emit('update-comment-count', comments.value.length)
  } catch (error) {
    console.error('获取评论列表失败:', error)
  }
}

/**
 * 提交评论
 * 验证评论内容后，调用 API 创建新评论或回复
 */
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    submittingComment.value = true
    await createComment({
      articleId: props.articleId,
      parentId: replyingTo.value ? String(replyingTo.value) : null,
      content: commentContent.value.trim()
    })

    ElMessage.success('评论发表成功')
    commentContent.value = ''
    replyingTo.value = null
    replyingToUsername.value = ''
    fetchComments() // 刷新评论列表
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    submittingComment.value = false
  }
}

/**
 * 处理回复评论
 * 设置正在回复的评论 ID 和用户名
 * @param {Object} parentComment - 被回复的评论对象
 */
const handleReply = (parentComment) => {
  replyingTo.value = parentComment.id
  replyingToUsername.value = parentComment.username
}

/**
 * 取消回复
 * 清除回复状态和输入框内容
 */
const handleCancelReply = () => {
  replyingTo.value = null
  replyingToUsername.value = ''
}

/**
 * 删除评论
 * 显示确认对话框后，调用 API 删除指定评论
 * @param {String|Number} commentId - 要删除的评论 ID
 */
const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteComment(String(commentId))
    ElMessage.success('删除成功')
    fetchComments() // 刷新评论列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 暴露方法给父组件调用
defineExpose({
  fetchComments
})
</script>

<style scoped>
/* 评论卡片样式 */
.comments-card {
  border-radius: var(--border-radius-xl);
  border: none;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-base);
}

/* 卡片悬停效果 */
.comments-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

/* 评论表单容器样式 */
.comment-form {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-page);
  border-radius: var(--border-radius-lg);
}

/* 回复提示样式 */
.replying-tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-light);
  border-radius: var(--border-radius-base);
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  font-weight: 500;
}

/* 回复提示中的按钮样式 */
.replying-tip .el-button {
  padding: 0;
  color: var(--primary-color);
}

/* 评论操作按钮区域 */
.comment-actions {
  margin-top: var(--spacing-md);
  text-align: right;
}

/* 登录提示区域 */
.login-tip {
  margin-bottom: var(--spacing-xl);
}

/* 登录链接样式 */
.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-fast);
}

/* 登录链接悬停效果 */
.login-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* 评论列表容器 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
</style>
