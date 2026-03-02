import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('@/views/Articles.vue'),
    meta: { title: '文章列表' }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags.vue'),
    meta: { title: '标签' }
  },
  {
    path: '/tag/:id',
    name: 'TagArticles',
    redirect: to => {
      return {
        path: '/articles',
        query: { tagId: to.params.id }
      }
    }
  },
  {
    path: '/write',
    name: 'Write',
    component: () => import('@/views/Write.vue'),
    meta: { title: '写文章', requiresAuth: true }
  },
  {
    path: '/write/:id',
    name: 'Edit',
    component: () => import('@/views/Write.vue'),
    meta: { title: '编辑文章', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/my-articles',
    redirect: to => {
      return {
        path: '/profile',
        query: { tab: 'articles' }
      }
    }
  },
  {
    path: '/my-collects',
    redirect: to => {
      return {
        path: '/profile',
        query: { tab: 'collects' }
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 博客系统` : '博客系统'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (userInfo.role !== 1) {
        ElMessage.error('无权限访问')
        next('/')
        return
      }
    }
  }
  
  next()
})

export default router