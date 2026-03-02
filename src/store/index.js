import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 计算属性
  const isLogin = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value.role === 1)

  // actions
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfo()
      setUserInfo(res.data)
      return res.data
    } catch (error) {
      ElMessage.error('获取用户信息失败')
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLogin,
    isAdmin,
    setToken,
    setUserInfo,
    getUserInfoAction,
    logout
  }
})

// 全局状态store
export const useGlobalStore = defineStore('global', () => {
  const loading = ref(false)
  const sidebarCollapsed = ref(false)

  const setLoading = (status) => {
    loading.value = status
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    loading,
    sidebarCollapsed,
    setLoading,
    toggleSidebar
  }
})

// 创建pinia实例
import { createPinia } from 'pinia'
const pinia = createPinia()

export default pinia