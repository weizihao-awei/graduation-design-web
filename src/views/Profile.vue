<template>
  <div class="profile-page">
    <Header />
    
    <div class="container">
      <div class="profile-container">
        <!-- 左侧导航 -->
        <div class="profile-sidebar">
          <el-card class="user-card">
            <div class="user-info">
              <el-avatar :size="80" :src="userStore.userInfo.avatar">
                {{ userStore.userInfo.nickname?.charAt(0) }}
              </el-avatar>
              <h3 class="username">{{ userStore.userInfo.nickname }}</h3>
              <p class="user-role">{{ userStore.isAdmin ? '管理员' : '普通用户' }}</p>
            </div>
          </el-card>
          
          <el-menu
            :default-active="activeTab"
            class="profile-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="info">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item index="articles">
              <el-icon><Document /></el-icon>
              <span>我的文章</span>
            </el-menu-item>
            <el-menu-item index="collects">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <!-- 右侧内容 -->
        <div class="profile-content">
          <!-- 个人信息 -->
          <div v-show="activeTab === 'info'" class="content-section">
            <el-card>
              <template #header>
                <span>个人信息</span>
              </template>
              
              <el-form
                ref="infoFormRef"
                :model="infoForm"
                :rules="infoRules"
                label-width="80px"
                class="profile-form"
              >
                <el-form-item label="用户名">
                  <el-input v-model="userStore.userInfo.username" disabled />
                </el-form-item>
                
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="infoForm.nickname" />
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="infoForm.email" />
                </el-form-item>
                
                <el-form-item label="头像" prop="avatar">
                  <div class="avatar-upload">
                    <el-avatar :size="80" :src="infoForm.avatar">
                      {{ infoForm.nickname?.charAt(0) }}
                    </el-avatar>
                    <el-input
                      v-model="infoForm.avatar"
                      placeholder="请输入头像URL"
                      class="avatar-input"
                    />
                  </div>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateInfo" :loading="updating">
                    更新信息
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
          
          <!-- 修改密码 -->
          <div v-show="activeTab === 'password'" class="content-section">
            <el-card>
              <template #header>
                <span>修改密码</span>
              </template>
              
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="80px"
                class="profile-form"
              >
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    show-password
                    placeholder="请输入旧密码"
                  />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    show-password
                    placeholder="请输入新密码"
                  />
                </el-form-item>
                
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    show-password
                    placeholder="请确认新密码"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword" :loading="updatingPassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
          
          <!-- 我的文章 -->
          <div v-show="activeTab === 'articles'" class="content-section">
            <el-card>
              <template #header>
                <div class="section-header">
                  <span>我的文章</span>
                  <el-button type="primary" @click="$router.push('/write')">
                    写文章
                  </el-button>
                </div>
              </template>
              
              <div class="article-list">
                <ArticleCard 
                  v-for="article in myArticles" 
                  :key="article.id" 
                  :article="article" 
                  :show-actions="true"
                  @delete="handleDeleteArticle"
                />
              </div>
              
              <!-- 加载更多 -->
              <div class="load-more" v-if="hasMoreArticles">
                <el-button 
                  type="primary" 
                  :loading="loadingArticles" 
                  @click="loadMoreArticles"
                >
                  {{ loadingArticles ? '加载中...' : '加载更多' }}
                </el-button>
              </div>
              
              <!-- 空状态 -->
              <el-empty v-if="!loadingArticles && myArticles.length === 0" description="暂无文章" />
            </el-card>
          </div>
          
          <!-- 我的收藏 -->
          <div v-show="activeTab === 'collects'" class="content-section">
            <el-card>
              <template #header>
                <span>我的收藏</span>
              </template>
              
              <div class="article-list">
                <ArticleCard 
                  v-for="article in myCollects" 
                  :key="article.id" 
                  :article="article" 
                  :show-actions="false"
                />
              </div>
              
              <!-- 加载更多 -->
              <div class="load-more" v-if="hasMoreCollects">
                <el-button 
                  type="primary" 
                  :loading="loadingCollects" 
                  @click="loadMoreCollects"
                >
                  {{ loadingCollects ? '加载中...' : '加载更多' }}
                </el-button>
              </div>
              
              <!-- 空状态 -->
              <el-empty v-if="!loadingCollects && myCollects.length === 0" description="暂无收藏" />
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
  updatePassword,
  getMyArticles,
  deleteArticle
} from '@/api/article'
import { getMyCollects } from '@/api/article'
import { ElMessage } from 'element-plus'
import { User, Lock, Document, Star } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 当前激活的标签
const activeTab = ref('info')

// 表单引用
const infoFormRef = ref()
const passwordFormRef = ref()

// 状态
const updating = ref(false)
const updatingPassword = ref(false)
const loadingArticles = ref(false)
const loadingCollects = ref(false)
const hasMoreArticles = ref(true)
const hasMoreCollects = ref(true)
const articlesPageNum = ref(1)
const collectsPageNum = ref(1)

// 个人信息表单
const infoForm = reactive({
  nickname: '',
  email: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 我的文章
const myArticles = ref([])

// 我的收藏
const myCollects = ref([])

// 表单验证规则
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

// 处理菜单选择
const handleMenuSelect = (index) => {
  activeTab.value = index
  
  // 根据选择的菜单加载数据
  if (index === 'articles' && myArticles.value.length === 0) {
    fetchMyArticles(true)
  } else if (index === 'collects' && myCollects.value.length === 0) {
    fetchMyCollects(true)
  }
}

// 更新个人信息
const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return
  
  try {
    await infoFormRef.value.validate()
    updating.value = true
    
    await updateUserInfo(infoForm)
    
    // 更新store中的用户信息
    userStore.setUserInfo({
      ...userStore.userInfo,
      ...infoForm
    })
    
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
  } finally {
    updating.value = false
  }
}

// 修改密码
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
    
    // 清空表单
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

// 获取我的文章
const fetchMyArticles = async (reset = false) => {
  if (loadingArticles.value) return
  
  try {
    loadingArticles.value = true
    
    if (reset) {
      articlesPageNum.value = 1
      myArticles.value = []
      hasMoreArticles.value = true
    }
    
    const res = await getMyArticles({
      pageNum: articlesPageNum.value,
      pageSize: 10
    })
    
    if (reset) {
      myArticles.value = res.data.list || []
    } else {
      myArticles.value = [...myArticles.value, ...(res.data.list || [])]
    }
    
    hasMoreArticles.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取我的文章失败:', error)
    ElMessage.error('获取我的文章失败')
  } finally {
    loadingArticles.value = false
  }
}

// 加载更多文章
const loadMoreArticles = () => {
  if (!hasMoreArticles.value || loadingArticles.value) return
  articlesPageNum.value++
  fetchMyArticles()
}

// 获取我的收藏
const fetchMyCollects = async (reset = false) => {
  if (loadingCollects.value) return
  
  try {
    loadingCollects.value = true
    
    if (reset) {
      collectsPageNum.value = 1
      myCollects.value = []
      hasMoreCollects.value = true
    }
    
    const res = await getMyCollects({
      pageNum: collectsPageNum.value,
      pageSize: 10
    })
    
    if (reset) {
      myCollects.value = res.data.list || []
    } else {
      myCollects.value = [...myCollects.value, ...(res.data.list || [])]
    }
    
    hasMoreCollects.value = res.data.hasNextPage
  } catch (error) {
    console.error('获取我的收藏失败:', error)
    ElMessage.error('获取我的收藏失败')
  } finally {
    loadingCollects.value = false
  }
}

// 加载更多收藏
const loadMoreCollects = () => {
  if (!hasMoreCollects.value || loadingCollects.value) return
  collectsPageNum.value++
  fetchMyCollects()
}

// 删除文章
const handleDeleteArticle = async (articleId) => {
  try {
    await deleteArticle(articleId)
    ElMessage.success('删除成功')
    fetchMyArticles(true)
  } catch (error) {
    console.error('删除文章失败:', error)
    ElMessage.error('删除文章失败')
  }
}

// 初始化个人信息表单
const initInfoForm = () => {
  const userInfo = userStore.userInfo
  Object.assign(infoForm, {
    nickname: userInfo.nickname || '',
    email: userInfo.email || '',
    avatar: userInfo.avatar || ''
  })
}

// 初始化数据
const initData = () => {
  // 检查登录状态
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  initInfoForm()
  
  // 处理路由参数
  const tab = router.currentRoute.value.query.tab
  if (tab) {
    activeTab.value = tab
    
    // 根据选择的菜单加载数据
    if (tab === 'articles' && myArticles.value.length === 0) {
      fetchMyArticles(true)
    } else if (tab === 'collects' && myCollects.value.length === 0) {
      fetchMyCollects(true)
    }
  }
}

onMounted(() => {
  initData()
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
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

/* 左侧边栏 */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  text-align: center;
}

.user-info {
  padding: 20px 0;
}

.username {
  margin: 15px 0 5px;
  font-size: 18px;
  color: #303133;
}

.user-role {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.profile-menu {
  border-radius: 4px;
  overflow: hidden;
}

/* 右侧内容 */
.profile-content {
  min-height: 500px;
}

.content-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-form {
  max-width: 500px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-input {
  flex: 1;
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
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
}
</style>