<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLogin && !userStore.userInfo.id) {
    try {
      await userStore.getUserInfoAction()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
