<template>
  <header class="blog-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <router-link to="/">
            <el-icon size="24">
              <Promotion />
            </el-icon>
            <span>博客系统</span>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link to="/recommend-articles" class="nav-item" active-class="active">推荐</router-link>
          <div class="nav-divider"></div>
          <router-link to="/hot-articles" class="nav-item" active-class="active">热门</router-link>
          <div class="nav-divider"></div>
          <router-link to="/latest-articles" class="nav-item" active-class="active">最新</router-link>
          <div class="nav-divider"></div>
          <router-link to="/articles" class="nav-item" active-class="active">全部文章</router-link>
          <div class="nav-divider"></div>
          <router-link to="/write" class="nav-item nav-write" active-class="active">写文章</router-link>
        </nav>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索文章..." clearable @keyup.enter="handleSearch">
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
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="write">写文章</el-dropdown-item>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
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
      path: '/article-query',
      query: { keyword: searchKeyword.value.trim() }
    })
    searchKeyword.value = ''
  }
}

const handleUserCommand = async (command) => {
  console.log('Dropdown command:', command)
  console.log('Is logged in:', userStore.isLogin)
  console.log('User info:', userStore.userInfo)

  switch (command) {
    case 'write':
      router.push('/write')
      break
    case 'profile':
      console.log('Navigating to profile')
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
  background: var(--bg-white);
  box-shadow: var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.header-content {
  display: flex;
  align-items: center;
  height: 70px;
  gap: var(--spacing-xl);
}

.logo a {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition-fast);
  position: relative;
}

.logo a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-fast);
}

.logo a:hover {
  transform: scale(1.05);
}

.logo a:hover::after {
  width: 100%;
}

.nav-menu {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
  align-items: center;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border-lighter);
}

.nav-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.nav-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-base);
  text-decoration: none;
  color: var(--text-regular);
  font-weight: 500;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: var(--primary-color);
  transform: translateY(-2px);
}

.nav-item:hover::before,
.nav-item.active::before {
  transform: scaleX(1);
}

.nav-item .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.nav-item:hover .el-icon {
  transform: scale(1.1);
}

.nav-item.nav-write {
  color: var(--primary-color) !important;
  font-weight: 600;
}

.nav-item.nav-write::before {
  background: var(--primary-color);
  opacity: 0.3;
}

.nav-item.nav-write:hover::before,
.nav-item.nav-write.active::before {
  opacity: 1;
}

.search-box {
  width: 280px;
  position: relative;
}

.search-box .el-input__wrapper {
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-lighter);
  transition: var(--transition-base);
}

.search-box .el-input__wrapper:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-light);
}

.search-box .el-input__wrapper.is-focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.user-area {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.user-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  opacity: 0;
  transition: var(--transition-fast);
}

.user-info:hover {
  background: var(--bg-page);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.user-info:hover::before {
  opacity: 0.1;
}

.username {
  font-size: 14px;
  color: var(--text-regular);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.auth-buttons .el-button {
  padding: 8px 16px;
  font-weight: 500;
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
}

.auth-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    max-width: 100%;
    padding: 0 var(--spacing-md);
  }

  .nav-menu {
    gap: var(--spacing-sm);
  }

  .search-box {
    width: 220px;
  }
}

@media (max-width: 900px) {
  .header-content {
    gap: var(--spacing-lg);
  }

  .nav-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .search-box {
    width: 200px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: var(--spacing-md) 0;
    gap: var(--spacing-md);
  }

  .logo {
    order: 1;
    width: 100%;
    justify-content: center;
    margin-bottom: var(--spacing-md);
  }

  .nav-menu {
    order: 2;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .nav-divider {
    display: none;
  }

  .nav-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-box {
    order: 3;
    width: 100%;
    max-width: 400px;
  }

  .user-area {
    order: 4;
    width: 100%;
    justify-content: center;
    padding-top: var(--spacing-md);
  }

  .auth-buttons {
    width: 100%;
    justify-content: center;
  }

  .auth-buttons .el-button {
    flex: 1;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: var(--spacing-sm) 0;
    gap: var(--spacing-sm);
  }

  .nav-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 14px;
  }

  .nav-item .el-icon {
    font-size: 14px;
  }

  .search-box {
    max-width: 100%;
  }
}
</style>
