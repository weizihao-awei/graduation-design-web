<template>
  <div class="comment-item">
    <div class="comment-content">
      <div class="comment-header">
        <el-avatar :size="32" :src="comment.userAvatar">
          {{ comment.username?.charAt(0) }}
        </el-avatar>
        <div class="comment-meta">
          <span class="username">{{ comment.username }}</span>
          <span class="time">{{ formatRelativeTime(comment.createTime) }}</span>
        </div>

        <div class="comment-actions" v-if="shouldShowActions">
          <el-button type="primary" size="small" link @click="$emit('reply', comment)">
            回复
          </el-button>
          <el-button type="danger" size="small" link @click="handleDelete">
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

    <!-- 子评论 -->
    <div v-if="comment.children && comment.children.length" class="comment-children">
      <CommentItem v-for="child in comment.children" :key="child.id" :comment="child" :show-actions="showActions"
        @reply="$emit('reply', $event)" @delete="$emit('delete', $event)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatRelativeTime } from '@/utils'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'delete'])

const userStore = useUserStore()

// 计算是否显示操作按钮
const shouldShowActions = computed(() => {
  return props.showActions &&
    (userStore.isLogin &&
      (userStore.isAdmin || userStore.userInfo.id === props.comment.userId))
})

// 处理删除评论
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    emit('delete', props.comment.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
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
