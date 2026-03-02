<template>
  <header class="blog-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <router-link to="/">
            <el-icon size="24"><Promotion /></el-icon>
            <span>博客系统</span>
          </router-link>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" active-class="active">首页</router-link>
          <router-link to="/articles" class="nav-item" active-class="active">文章</router-link>
          <router-link to="/tags" class="nav-item" active-class="active">标签</router-link>
        </nav>
        
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        
        <!-- 用户区域 -->
        <div class="user-area">
          <template v-if="userStore.isLogin">
            <!-- 已登录 -->
            <el-dropdown @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userInfo.avatar">
                  {{ userStore.userInfo.nickname?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo.nickname }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="write">写文章</el-dropdown-item>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="my-articles">我的文章</el-dropdown-item>
                  <el-dropdown-item command="my-collects">我的收藏</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" command="admin">后台管理</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <!-- 未登录 -->
            <div class="auth-buttons">
              <el-button type="primary" @click="$router.push('/login')">登录</el-button>
              <el-button @click="$router.push('/register')">注册</el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Promotion, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/articles',
      query: { keyword: searchKeyword.value.trim() }
    })
    searchKeyword.value = ''
  }
}

const handleUserCommand = async (command) => {
  switch (command) {
    case 'write':
      router.push('/write')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'my-articles':
      router.push('/my-articles')
      break
    case 'my-collects':
      router.push('/my-collects')
      break
    case 'admin':
      router.push('/admin/dashboard')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        ElMessage.success('退出登录成功')
        router.push('/')
      } catch {
        // 取消操作
      }
      break
  }
}
</script>

<style scoped>
.blog-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 60px;
  gap: 30px;
}

.logo a {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  color: #606266;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background: #ecf5ff;
  color: #409EFF;
}

.search-box {
  width: 300px;
}

.user-area {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 0;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .search-box {
    width: 200px;
  }
}
</style>