<template>
  <div class="profile-sidebar">
    <el-card class="user-card">
      <div class="user-info">
        <el-avatar :size="80" :src="getAvatarUrl(userInfo.avatar)">
          {{ userInfo.nickname?.charAt(0) }}
        </el-avatar>
        <h3 class="username">{{ userInfo.nickname }}</h3>
        <p class="user-role">{{ userInfo.role === 1 ? '管理员' : '普通用户' }}</p>
      </div>
    </el-card>

    <el-menu :default-active="activeTab" class="profile-menu" @select="handleMenuSelect">
      <el-menu-item index="info">
        <el-icon>
          <User />
        </el-icon>
        <span>个人信息</span>
      </el-menu-item>
      <el-menu-item index="password">
        <el-icon>
          <Lock />
        </el-icon>
        <span>修改密码</span>
      </el-menu-item>
      <el-menu-item index="published">
        <el-icon>
          <Document />
        </el-icon>
        <span>我的文章</span>
      </el-menu-item>
      <el-menu-item index="collection">
        <el-icon>
          <Star />
        </el-icon>
        <span>我的收藏</span>
      </el-menu-item>
      <el-menu-item index="praise">
        <el-icon>
          <StarFilled />
        </el-icon>
        <span>我的点赞</span>
      </el-menu-item>
      <el-menu-item index="read">
        <el-icon>
          <View />
        </el-icon>
        <span>浏览记录</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { User, Lock, Document, Star, StarFilled, View } from '@element-plus/icons-vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'info'
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select'])

const handleMenuSelect = (index) => {
  emit('select', index)
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
</script>

<style scoped>
.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  text-align: center;
  padding: 20px 0;
}

.username {
  margin: 15px 0 5px;
  font-size: 20px;
  font-weight: 600;
}

.user-role {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.profile-menu {
  border-right: none;
}
</style>
