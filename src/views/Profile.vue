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
            <ProfileArticleList ref="collectionListRef" type="collection" title="我的收藏" empty-text="暂无收藏"
              :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'praise'" class="content-section">
            <ProfileArticleList ref="praiseListRef" type="praise" title="我的点赞" empty-text="暂无点赞"
              :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'read'" class="content-section">
            <ProfileArticleList ref="readListRef" type="read" title="浏览记录" empty-text="暂无浏览记录" :user-id="userInfo.id" />
          </div>

          <div v-show="activeTab === 'followers'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span class="section-title">我的粉丝</span>
                </div>
              </template>
              <div class="user-list" v-infinite-scroll="loadMoreFollowers"
                :infinite-scroll-disabled="!followersHasMore || followersLoadingMore" :infinite-scroll-distance="50">
                <div v-for="user in followersList" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
                  <el-avatar :size="48" :src="getAvatarUrl(user.avatar)">
                    {{ user.nickname?.charAt(0) }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ user.nickname }}</div>
                    <div class="user-intro">{{ user.intro || '这个人很懒，还没有写简介~' }}</div>
                  </div>
                </div>
              </div>
              <div class="loading-more" v-if="followersLoadingMore">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>
              <el-empty v-if="!followersLoading && followersList.length === 0" description="暂无粉丝" />
            </el-card>
          </div>

          <div v-show="activeTab === 'following'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span class="section-title">我的关注</span>
                </div>
              </template>
              <div class="user-list" v-infinite-scroll="loadMoreFollowing"
                :infinite-scroll-disabled="!followingHasMore || followingLoadingMore" :infinite-scroll-distance="50">
                <div v-for="user in followingList" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
                  <el-avatar :size="48" :src="getAvatarUrl(user.avatar)">
                    {{ user.nickname?.charAt(0) }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ user.nickname }}</div>
                    <div class="user-intro">{{ user.intro || '这个人很懒，还没有写简介~' }}</div>
                  </div>
                </div>
              </div>
              <div class="loading-more" v-if="followingLoadingMore">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>
              <el-empty v-if="!followingLoading && followingList.length === 0" description="暂无关注" />
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import ProfileInfo from '@/components/profile/ProfileInfo.vue'
import ProfilePassword from '@/components/profile/ProfilePassword.vue'
import ProfileArticleList from '@/components/profile/ProfileArticleList.vue'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { getUserInfo } from '@/api/user'
import { getFollowers, getFollowing, getFollowersCount, getFollowingCount } from '@/api/relation'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('info')
const userInfo = ref({})

const publishedListRef = ref()
const collectionListRef = ref()
const praiseListRef = ref()
const readListRef = ref()

// 粉丝/关注列表相关
const followersList = ref([])
const followingList = ref([])
const followersLoading = ref(false)
const followingLoading = ref(false)
const followersLoadingMore = ref(false)
const followingLoadingMore = ref(false)
const followersHasMore = ref(true)
const followingHasMore = ref(true)
const followersPageNum = ref(1)
const followingPageNum = ref(1)

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
  } else if (index === 'followers') {
    fetchFollowers(true)
  } else if (index === 'following') {
    fetchFollowing(true)
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

    // 获取粉丝和关注数量
    await fetchRelationCounts()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取粉丝和关注数量
const fetchRelationCounts = async () => {
  if (!userInfo.value.id) return

  try {
    const [followersRes, followingRes] = await Promise.all([
      getFollowersCount(userInfo.value.id),
      getFollowingCount(userInfo.value.id)
    ])

    userInfo.value.followersCount = followersRes.data || 0
    userInfo.value.followingCount = followingRes.data || 0
  } catch (error) {
    console.error('获取粉丝/关注数量失败:', error)
  }
}

// 获取粉丝列表
const fetchFollowers = async (reset = false) => {
  if (!userInfo.value.id) return

  try {
    if (reset) {
      followersLoading.value = true
      followersPageNum.value = 1
      followersList.value = []
      followersHasMore.value = true
    } else {
      followersLoadingMore.value = true
    }

    const res = await getFollowers({
      userId: userInfo.value.id,
      pageNum: followersPageNum.value,
      pageSize: 10
    })

    const list = res.data.list || []
    if (reset) {
      followersList.value = list
    } else {
      followersList.value = [...followersList.value, ...list]
    }

    followersHasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取粉丝列表失败:', error)
  } finally {
    followersLoading.value = false
    followersLoadingMore.value = false
  }
}

// 获取关注列表
const fetchFollowing = async (reset = false) => {
  if (!userInfo.value.id) return

  try {
    if (reset) {
      followingLoading.value = true
      followingPageNum.value = 1
      followingList.value = []
      followingHasMore.value = true
    } else {
      followingLoadingMore.value = true
    }

    const res = await getFollowing({
      userId: userInfo.value.id,
      pageNum: followingPageNum.value,
      pageSize: 10
    })

    const list = res.data.list || []
    if (reset) {
      followingList.value = list
    } else {
      followingList.value = [...followingList.value, ...list]
    }

    followingHasMore.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取关注列表失败:', error)
  } finally {
    followingLoading.value = false
    followingLoadingMore.value = false
  }
}

// 加载更多粉丝
const loadMoreFollowers = () => {
  if (!followersHasMore.value || followersLoadingMore.value || followersLoading.value) return
  followersPageNum.value++
  fetchFollowers()
}

// 加载更多关注
const loadMoreFollowing = () => {
  if (!followingHasMore.value || followingLoadingMore.value || followingLoading.value) return
  followingPageNum.value++
  fetchFollowing()
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
  router.push(`/author/${userId}`)
}

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'followers' && followersList.value.length === 0) {
    fetchFollowers(true)
  } else if (newTab === 'following' && followingList.value.length === 0) {
    fetchFollowing(true)
  }
})

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
