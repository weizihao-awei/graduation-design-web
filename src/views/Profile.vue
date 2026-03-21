<template>
  <div class="profile-page">
    <Header />

    <div class="container">
      <div class="profile-container">
        <ProfileSidebar :active-tab="activeTab" :user-info="userInfo" @select="handleMenuSelect" />

        <div class="profile-content">
          <div v-show="activeTab === 'info'" class="content-section">
            <ProfileInfo :user-info="userInfo" @update="handleUpdateUserInfo" />
          </div>

          <div v-show="activeTab === 'password'" class="content-section">
            <ProfilePassword />
          </div>

          <div v-show="activeTab === 'published'" class="content-section">
            <ProfileArticleList ref="publishedListRef" type="published" title="我的文章" empty-text="暂无文章"
              :show-write-button="true" :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'collection'" class="content-section">
            <ProfileArticleList ref="collectionListRef" type="collection" title="我的收藏" empty-text="暂无收藏" :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'praise'" class="content-section">
            <ProfileArticleList ref="praiseListRef" type="praise" title="我的点赞" empty-text="暂无点赞" :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'read'" class="content-section">
            <ProfileArticleList ref="readListRef" type="read" title="浏览记录" empty-text="暂无浏览记录" :user-id="userInfo.id" />
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import ProfileInfo from '@/components/profile/ProfileInfo.vue'
import ProfilePassword from '@/components/profile/ProfilePassword.vue'
import ProfileArticleList from '@/components/profile/ProfileArticleList.vue'
import { useUserStore } from '@/store'
import { getUserInfo } from '@/api/user'

const userStore = useUserStore()

const activeTab = ref('info')
const userInfo = ref({})

const publishedListRef = ref()
const collectionListRef = ref()
const praiseListRef = ref()
const readListRef = ref()

const handleMenuSelect = (index) => {
  activeTab.value = index

  if (index === 'published' && publishedListRef.value) {
    publishedListRef.value.refresh()
  } else if (index === 'collection' && collectionListRef.value) {
    collectionListRef.value.refresh()
  } else if (index === 'praise' && praiseListRef.value) {
    praiseListRef.value.refresh()
  } else if (index === 'read' && readListRef.value) {
    readListRef.value.refresh()
  }
}

const handleUpdateUserInfo = (updatedInfo) => {
  userInfo.value = { ...userInfo.value, ...updatedInfo }
  userStore.setUserInfo({ ...userStore.userInfo, ...updatedInfo })
}

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.data
    userStore.setUserInfo(res.data)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.profile-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }
}
</style>
