import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/recommend-articles',
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
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: '重置密码' }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('@/views/Articles.vue'),
    meta: { title: '文章列表' }
  },
  {
    path: '/hot-articles',
    name: 'HotArticles',
    component: () => import('@/views/HotArticles.vue'),
    meta: { title: '热门文章' }
  },
  {
    path: '/latest-articles',
    name: 'LatestArticles',
    component: () => import('@/views/LatestArticles.vue'),
    meta: { title: '最新文章' }
  },
  {
    path: '/recommend-articles',
    name: 'RecommendArticles',
    component: () => import('@/views/RecommendArticles.vue'),
    meta: { title: '推荐文章' }
  },
  {
    path: '/article-query',
    name: 'ArticleQuery',
    component: () => import('@/views/ArticleQuery.vue'),
    meta: { title: '文章搜索' }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetail.vue'),
    meta: { title: '文章详情' }
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

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 博客系统` : '博客系统'
  
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
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
