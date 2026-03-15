<template>
  <div class="comment-item">
    <div class="comment-content">
      <div class="comment-header">
        <el-avatar :size="32" :src="getAvatarUrl(comment.userAvatar)">
          {{ comment.username?.charAt(0) }}
        </el-avatar>
        <div class="comment-meta">
          <span class="username">{{ comment.username }}</span>
          <span class="time">{{ formatRelativeTime(comment.createTime) }}</span>
        </div>

        <div class="comment-actions" v-if="shouldShowReply || shouldShowDelete">
          <el-button v-if="shouldShowReply" type="primary" size="small" link @click="handleToggleReply">
            {{ showReplyBox ? '取消回复' : '回复' }}
          </el-button>
          <el-button v-if="shouldShowDelete" type="danger" size="small" link @click="handleDelete">
            删除
          </el-button>
        </div>
      </div>

      <div class="comment-body">
        <div v-if="comment.replyToUsername" class="reply-to">
          回复 @{{ comment.replyToUsername }}
        </div>
        <div class="comment-text">{{ comment.content }}</div>
      </div>
    </div>

    <!-- 回复框 -->
    <div v-if="showReplyBox" class="reply-box">
      <el-input v-model="replyContent" type="textarea" :placeholder="replyPlaceholder" :rows="3" maxlength="500"
        show-word-limit />
      <div class="reply-actions">
        <el-button @click="handleToggleReply">取消</el-button>
        <el-button type="primary" @click="handleSubmitReply" :loading="submittingReply">
          发送回复
        </el-button>
      </div>
    </div>

    <!-- 子评论 -->
    <div v-if="comment.children && comment.children.length" class="comment-children">
      <CommentItem v-for="child in comment.children" :key="child.id" :comment="child" :show-actions="showActions"
        :article-id="articleId" :is-login="isLogin" :active-reply-id="activeReplyId"
        @reply-submitted="$emit('reply-submitted')" @delete="$emit('delete', $event)"
        @toggle-reply="$emit('toggle-reply', $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'
import { formatRelativeTime } from '@/utils'
import { createComment } from '@/api/comment'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  articleId: {
    type: String,
    required: true
  },
  isLogin: {
    type: Boolean,
    default: false
  },
  activeReplyId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['reply-submitted', 'delete', 'toggle-reply'])

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

const showReplyBox = computed(() => {
  return props.activeReplyId === props.comment.id
})

const replyPlaceholder = computed(() => {
  return `回复 @${props.comment.username}...`
})
const replyContent = ref('')
const submittingReply = ref(false)

const shouldShowReply = computed(() => {
  return props.showActions && props.isLogin
})

const shouldShowDelete = computed(() => {
  return props.showActions &&
    props.isLogin &&
    (userStore.isAdmin || userStore.userInfo.id === props.comment.userId)
})

const handleToggleReply = () => {
  emit('toggle-reply', props.comment.id)
  if (!showReplyBox.value) {
    replyContent.value = ''
  }
}

const handleSubmitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    submittingReply.value = true
    await createComment({
      articleId: props.articleId,
      parentId: String(props.comment.id),
      content: `@${props.comment.username} ${replyContent.value.trim()}`
    })

    ElMessage.success('回复成功')
    replyContent.value = ''
    emit('toggle-reply', null)
    emit('reply-submitted')
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  } finally {
    submittingReply.value = false
  }
}

const handleDelete = () => {
  emit('delete', props.comment.id)
}
</script>

<style scoped>
.comment-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 500;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-body {
  margin-left: 44px;
}

.reply-to {
  font-size: 12px;
  color: #409EFF;
  margin-bottom: 5px;
}

.comment-text {
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
}

.reply-box {
  margin-left: 44px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.comment-children {
  margin-left: 44px;
  margin-top: 15px;
  padding-left: 15px;
  border-left: 2px solid #f0f0f0;
}

@media (max-width: 768px) {
  .comment-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .comment-actions {
    width: 100%;
    margin-top: 5px;
  }

  .comment-body,
  .comment-children {
    margin-left: 0;
  }

  .comment-children {
    padding-left: 10px;
  }
}
</style>
