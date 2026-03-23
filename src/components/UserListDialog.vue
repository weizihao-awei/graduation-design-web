<template>
  <el-dialog v-model="visible" :title="title" width="500px" :close-on-click-modal="false" destroy-on-close>
    <div class="user-list-container" v-loading="loading">
      <div class="user-list" v-infinite-scroll="loadMore" :infinite-scroll-disabled="!hasMore || loadingMore"
        :infinite-scroll-distance="50">
        <div v-for="user in userList" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
          <el-avatar :size="48" :src="getAvatarUrl(user.avatar)">
            {{ user.nickname?.charAt(0) }}
          </el-avatar>
          <div class="user-info">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-intro">{{ user.intro || '这个人很懒，还没有写简介~' }}</div>
          </div>
        </div>
      </div>

      <div class="loading-more" v-if="loadingMore">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>加载中...</span>
      </div>

      <el-empty v-if="!loading && userList.length === 0" description="暂无数据" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '用户列表'
  },
  userList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'loadMore'])

const router = useRouter()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const loadMore = () => {
  if (!props.hasMore || props.loadingMore) return
  emit('loadMore')
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

const goToUserProfile = (userId) => {
  visible.value = false
  router.push(`/author/${userId}`)
}
</script>

<style scoped>
.user-list-container {
  max-height: 500px;
  overflow-y: auto;
}

.user-list {
  padding: 10px 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: var(--bg-light);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-intro {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--text-secondary);
}

.loading-more .el-icon {
  margin-right: 8px;
}
</style>
