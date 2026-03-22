<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <!-- 登录框头部 -->
        <div class="login-header">
          <h2>用户登录</h2>
          <p>欢迎回到博客系统</p>
        </div>

        <!-- 登录表单 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login-form">
          <!-- 用户名输入框 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock"
              show-password @keyup.enter="handleLogin" />
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 登录框底部链接 -->
        <div class="login-footer">
          <p>
            还没有账号？
            <router-link to="/register">立即注册</router-link>
          </p>
          <p class="forgot-password">
            <router-link to="/reset-password">忘记密码？</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store'
import { login } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const res = await login(loginForm)

    userStore.setToken(res.data.token)

    await userStore.getUserInfoAction()

    ElMessage.success('登录成功')

    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
}

.login-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 2;
}

.login-box {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.login-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.login-header h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 700;
  position: relative;
}

.login-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius-base);
}

.login-header p {
  margin: 0;
  color: var(--text-regular);
  font-size: 1rem;
  font-weight: 500;
}

.login-form {
  margin-bottom: var(--spacing-lg);
}

.login-form .el-form-item {
  margin-bottom: var(--spacing-lg);
}

.login-form .el-input__wrapper {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-lighter);
  transition: var(--transition-base);
  padding: 4px 0;
}

.login-form .el-input__wrapper:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-light);
}

.login-form .el-input__wrapper.is-focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  box-shadow: var(--shadow-light);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.login-button:hover::before {
  left: 100%;
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-regular);
  margin-top: var(--spacing-lg);
}

.login-footer p {
  margin: 8px 0;
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-fast);
  position: relative;
  padding-bottom: 2px;
}

.login-footer a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-fast);
}

.login-footer a:hover {
  color: var(--primary-dark);
}

.login-footer a:hover::after {
  width: 100%;
}

@media (max-width: 480px) {
  .login-container {
    max-width: 350px;
  }

  .login-box {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .login-header h2 {
    font-size: 1.5rem;
  }
}
</style>
