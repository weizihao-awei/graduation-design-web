<template>
  <div class="profile-page">
    <Header />

    <div class="container">
      <div class="profile-container">
        <div class="profile-sidebar">
          <el-card class="user-card">
            <div class="user-info">
              <el-avatar :size="80" :src="getAvatarUrl(userStore.userInfo.avatar)">
                {{ userStore.userInfo.nickname?.charAt(0) }}
              </el-avatar>
              <h3 class="username">{{ userStore.userInfo.nickname }}</h3>
              <p class="user-role">{{ userStore.isAdmin ? '管理员' : '普通用户' }}</p>
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

        <div class="profile-content">
          <div v-show="activeTab === 'info'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>个人信息</span>
                  <el-button v-if="!isEditing" type="primary" @click="handleEdit">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    编辑
                  </el-button>
                </div>
              </template>

              <div v-if="!isEditing" class="info-display">
                <div class="info-item">
                  <span class="info-label">用户名</span>
                  <span class="info-value">{{ userStore.userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">昵称</span>
                  <span class="info-value">{{ infoForm.nickname || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">邮箱</span>
                  <span class="info-value">{{ infoForm.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">性别</span>
                  <span class="info-value">{{ getGenderText(infoForm.gender) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">个性签名</span>
                  <span class="info-value">{{ infoForm.signature || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">简介</span>
                  <span class="info-value">{{ infoForm.intro || '-' }}</span>
                </div>
              </div>

              <el-form v-else ref="infoFormRef" :model="infoForm" :rules="infoRules" label-width="80px"
                class="profile-form">
                <el-form-item label="头像" prop="avatar">
                  <div class="avatar-upload">
                    <div class="avatar-preview" @click="handleUploadAvatar">
                      <el-avatar :size="80" :src="getAvatarUrl(infoForm.avatar)">
                        {{ infoForm.nickname?.charAt(0) }}
                      </el-avatar>
                      <div class="avatar-overlay">
                        <el-icon>
                          <Upload />
                        </el-icon>
                        <span>点击上传</span>
                      </div>
                    </div>
                    <div class="avatar-input-wrapper">
                      <el-input v-model="infoForm.avatar" placeholder="或输入头像URL" class="avatar-input" />
                      <el-button type="primary" size="small" @click="handleUploadAvatar" :loading="uploading">
                        选择图片
                      </el-button>
                    </div>
                  </div>
                </el-form-item>

                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="infoForm.nickname" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="infoForm.email" />
                </el-form-item>

                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="infoForm.gender">
                    <el-radio :label="0">未知</el-radio>
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="个性签名" prop="signature">
                  <el-input v-model="infoForm.signature" type="textarea" :rows="2" placeholder="请输入个性签名" />
                </el-form-item>

                <el-form-item label="简介" prop="intro">
                  <el-input v-model="infoForm.intro" type="textarea" :rows="3" placeholder="请输入个人简介" />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdateInfo" :loading="updating">
                    保存
                  </el-button>
                  <el-button @click="handleCancel">
                    取消
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

          <div v-show="activeTab === 'password'" class="content-section">
            <el-card>
              <template #header>
                <span>修改密码</span>
              </template>

              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px"
                class="profile-form">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请确认新密码" />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword" :loading="updatingPassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

          <div v-show="activeTab === 'published'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>我的文章</span>
                  <el-button type="primary" @click="$router.push('/write')">
                    写文章
                  </el-button>
                </div>
              </template>

              <div class="article-list" v-infinite-scroll="loadMoreArticles"
                :infinite-scroll-disabled="!hasMoreArticles || loadingArticles">
                <ArticleCard v-for="article in publishedArticles" :key="article.id" :article="article" />
              </div>

              <div class="loading-more" v-if="loadingArticles">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>

              <el-empty v-if="!loadingArticles && publishedArticles.length === 0" description="暂无文章" />
            </el-card>
          </div>

          <div v-show="activeTab === 'collection'" class="content-section">
            <el-card>
              <template #header>
                <span>我的收藏</span>
              </template>

              <div class="article-list" v-infinite-scroll="loadMoreCollections"
                :infinite-scroll-disabled="!hasMoreCollections || loadingCollections">
                <ArticleCard v-for="article in collectionArticles" :key="article.id" :article="article" />
              </div>

              <div class="loading-more" v-if="loadingCollections">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>

              <el-empty v-if="!loadingCollections && collectionArticles.length === 0" description="暂无收藏" />
            </el-card>
          </div>

          <div v-show="activeTab === 'praise'" class="content-section">
            <el-card>
              <template #header>
                <span>我的点赞</span>
              </template>

              <div class="article-list" v-infinite-scroll="loadMorePraises"
                :infinite-scroll-disabled="!hasMorePraises || loadingPraises">
                <ArticleCard v-for="article in praiseArticles" :key="article.id" :article="article" />
              </div>

              <div class="loading-more" v-if="loadingPraises">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>

              <el-empty v-if="!loadingPraises && praiseArticles.length === 0" description="暂无点赞" />
            </el-card>
          </div>

          <div v-show="activeTab === 'read'" class="content-section">
            <el-card>
              <template #header>
                <span>浏览记录</span>
              </template>

              <div class="article-list" v-infinite-scroll="loadMoreReads"
                :infinite-scroll-disabled="!hasMoreReads || loadingReads">
                <ArticleCard v-for="article in readArticles" :key="article.id" :article="article" />
              </div>

              <div class="loading-more" v-if="loadingReads">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>加载中...</span>
              </div>

              <el-empty v-if="!loadingReads && readArticles.length === 0" description="暂无浏览记录" />
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { useUserStore } from '@/store'
import {
  updateUserInfo,
  updatePassword
} from '@/api/user'
import {
  getUserCollections,
  getUserPraises,
  getUserReads,
  getUserPublished
} from '@/api/user'
import { uploadImage, updateImage } from '@/api/image'
import { ElMessage } from 'element-plus'
import { User, Lock, Document, Star, StarFilled, View, Loading, Edit, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('info')
const isEditing = ref(false)
const infoFormRef = ref()
const passwordFormRef = ref()

const updating = ref(false)
const updatingPassword = ref(false)
const uploading = ref(false)

const loadingArticles = ref(false)
const loadingCollections = ref(false)
const loadingPraises = ref(false)
const loadingReads = ref(false)

const hasMoreArticles = ref(true)
const hasMoreCollections = ref(true)
const hasMorePraises = ref(true)
const hasMoreReads = ref(true)

const articlesPageNum = ref(1)
const collectionsPageNum = ref(1)
const praisesPageNum = ref(1)
const readsPageNum = ref(1)

const infoForm = reactive({
  nickname: '',
  email: '',
  avatar: '',
  gender: 0,
  intro: '',
  signature: ''
})

const originalInfoForm = reactive({
  nickname: '',
  email: '',
  avatar: '',
  gender: 0,
  intro: '',
  signature: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const publishedArticles = ref([])
const collectionArticles = ref([])
const praiseArticles = ref([])
const readArticles = ref([])

const infoRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleMenuSelect = (index) => {
  activeTab.value = index

  if (index === 'published' && publishedArticles.value.length === 0) {
    fetchPublishedArticles(true)
  } else if (index === 'collection' && collectionArticles.value.length === 0) {
    fetchCollectionArticles(true)
  } else if (index === 'praise' && praiseArticles.value.length === 0) {
    fetchPraiseArticles(true)
  } else if (index === 'read' && readArticles.value.length === 0) {
    fetchReadArticles(true)
  }

  if (index !== 'info') {
    isEditing.value = false
  }
}

const handleEdit = () => {
  isEditing.value = true
  Object.assign(originalInfoForm, { ...infoForm })
}

const handleCancel = () => {
  isEditing.value = false
  Object.assign(infoForm, { ...originalInfoForm })
}

const getGenderText = (gender) => {
  const genderMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return genderMap[gender] || '未知'
}

const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return

  try {
    await infoFormRef.value.validate()
    updating.value = true

    await updateUserInfo(infoForm)

    userStore.setUserInfo({
      ...userStore.userInfo,
      ...infoForm
    })

    isEditing.value = false
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
  } finally {
    updating.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    updatingPassword.value = true

    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')

    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    updatingPassword.value = false
  }
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

const handleUploadAvatar = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 10MB')
      return
    }

    uploading.value = true

    try {
      let uri
      const oldUri = infoForm.avatar

      if (oldUri) {
        const res = await updateImage('avatar', oldUri, file)
        uri = res.data.uri
      } else {
        const res = await uploadImage('avatar', file)
        uri = res.data.uri
      }

      infoForm.avatar = uri
      userStore.setUserInfo({
        ...userStore.userInfo,
        avatar: uri
      })

      ElMessage.success('头像上传成功')
    } catch (error) {
      console.error('上传头像失败:', error)
      ElMessage.error('上传头像失败')
    } finally {
      uploading.value = false
    }
  }

  input.click()
}

const fetchPublishedArticles = async (reset = false) => {
  if (loadingArticles.value) return

  try {
    loadingArticles.value = true

    if (reset) {
      articlesPageNum.value = 1
      publishedArticles.value = []
      hasMoreArticles.value = true
    }

    const res = await getUserPublished({
      pageNum: articlesPageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    })

    if (reset) {
      publishedArticles.value = res.data.list || []
    } else {
      publishedArticles.value = [...publishedArticles.value, ...(res.data.list || [])]
    }

    hasMoreArticles.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取我的文章失败:', error)
    ElMessage.error('获取我的文章失败')
  } finally {
    loadingArticles.value = false
  }
}

const loadMoreArticles = () => {
  if (!hasMoreArticles.value || loadingArticles.value) return
  articlesPageNum.value++
  fetchPublishedArticles()
}

const fetchCollectionArticles = async (reset = false) => {
  if (loadingCollections.value) return

  try {
    loadingCollections.value = true

    if (reset) {
      collectionsPageNum.value = 1
      collectionArticles.value = []
      hasMoreCollections.value = true
    }

    const res = await getUserCollections({
      pageNum: collectionsPageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    })

    if (reset) {
      collectionArticles.value = res.data.list || []
    } else {
      collectionArticles.value = [...collectionArticles.value, ...(res.data.list || [])]
    }

    hasMoreCollections.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取我的收藏失败:', error)
    ElMessage.error('获取我的收藏失败')
  } finally {
    loadingCollections.value = false
  }
}

const loadMoreCollections = () => {
  if (!hasMoreCollections.value || loadingCollections.value) return
  collectionsPageNum.value++
  fetchCollectionArticles()
}

const fetchPraiseArticles = async (reset = false) => {
  if (loadingPraises.value) return

  try {
    loadingPraises.value = true

    if (reset) {
      praisesPageNum.value = 1
      praiseArticles.value = []
      hasMorePraises.value = true
    }

    const res = await getUserPraises({
      pageNum: praisesPageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    })

    if (reset) {
      praiseArticles.value = res.data.list || []
    } else {
      praiseArticles.value = [...praiseArticles.value, ...(res.data.list || [])]
    }

    hasMorePraises.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取我的点赞失败:', error)
    ElMessage.error('获取我的点赞失败')
  } finally {
    loadingPraises.value = false
  }
}

const loadMorePraises = () => {
  if (!hasMorePraises.value || loadingPraises.value) return
  praisesPageNum.value++
  fetchPraiseArticles()
}

const fetchReadArticles = async (reset = false) => {
  if (loadingReads.value) return

  try {
    loadingReads.value = true

    if (reset) {
      readsPageNum.value = 1
      readArticles.value = []
      hasMoreReads.value = true
    }

    const res = await getUserReads({
      pageNum: readsPageNum.value,
      pageSize: 10,
      order: 'desc',
      documentType: 1
    })

    if (reset) {
      readArticles.value = res.data.list || []
    } else {
      readArticles.value = [...readArticles.value, ...(res.data.list || [])]
    }

    hasMoreReads.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取浏览记录失败:', error)
    ElMessage.error('获取浏览记录失败')
  } finally {
    loadingReads.value = false
  }
}

const loadMoreReads = () => {
  if (!hasMoreReads.value || loadingReads.value) return
  readsPageNum.value++
  fetchReadArticles()
}

const initInfoForm = () => {
  const userInfo = userStore.userInfo || {}
  Object.assign(infoForm, {
    nickname: userInfo.nickname || '',
    email: userInfo.email || '',
    avatar: userInfo.avatar || '',
    gender: userInfo.gender || 0,
    intro: userInfo.intro || '',
    signature: userInfo.signature || ''
  })
}

const initData = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  initInfoForm()

  const tab = router.currentRoute.value.query.tab
  if (tab) {
    activeTab.value = tab

    if (tab === 'published' && publishedArticles.value.length === 0) {
      fetchPublishedArticles(true)
    } else if (tab === 'collection' && collectionArticles.value.length === 0) {
      fetchCollectionArticles(true)
    } else if (tab === 'praise' && praiseArticles.value.length === 0) {
      fetchPraiseArticles(true)
    } else if (tab === 'read' && readArticles.value.length === 0) {
      fetchReadArticles(true)
    }
  }
}

onMounted(() => {
  console.log('Profile component mounted')
  initData()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  text-align: center;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.user-info {
  padding: 20px 0;
}

.username {
  margin: 15px 0 5px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-role {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.profile-menu {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.profile-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 5px 10px;
  border-radius: 6px;
  transition: all 0.3s;
}

.profile-menu .el-menu-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.profile-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.profile-menu .el-menu-item.is-active .el-icon {
  color: #fff;
}

.profile-content {
  min-height: 500px;
}

.content-section {
  margin-bottom: 20px;
}

.content-section .el-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-display {
  padding: 5px 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 18px 28px;
  margin: 10px 0;
  background: #ffffff;
  border-radius: 16px;
  border: 2px solid #f0f0f0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.info-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.info-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15), 0 5px 10px rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.info-item:hover::before {
  opacity: 1;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 100px;
  font-weight: 700;
  color: #1a1a2e;
  flex-shrink: 0;
  font-size: 14px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  position: relative;
  padding-left: 8px;
}

.info-label::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 16px;
  background: linear-gradient(180deg, #e0e0e0 0%, #f5f5f5 100%);
  border-radius: 1px;
}

.info-value {
  flex: 1;
  color: #2d2d2d;
  line-height: 1.7;
  font-size: 15px;
  padding-left: 24px;
  word-break: break-all;
  font-weight: 400;
  letter-spacing: 0.2px;
}

.profile-form {
  max-width: 500px;
}

.avatar-upload {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.avatar-preview {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  gap: 4px;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar-input {
  flex: 1;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-more .el-icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    order: 2;
  }

  .profile-content {
    order: 1;
  }

  .article-list {
    max-height: 500px;
  }
}
</style>
