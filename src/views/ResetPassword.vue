<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-box">
        <div class="reset-password-header">
          <h2>重置密码</h2>
          <p>通过邮箱验证码重置您的密码</p>
        </div>
        
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          label-width="0"
          class="reset-password-form"
        >
          <el-form-item prop="email">
            <div class="email-input-container">
              <el-input
                v-model="resetForm.email"
                placeholder="请输入邮箱"
                size="large"
                :prefix-icon="Message"
              />
              <el-button
                type="primary"
                size="large"
                :disabled="!canSendCode || countdown > 0"
                :loading="sendingCode"
                class="code-button"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item prop="verificationCode">
            <el-input
              v-model="resetForm.verificationCode"
              placeholder="请输入邮箱验证码"
              size="large"
              :prefix-icon="Key"
            />
          </el-form-item>
          
          <el-form-item prop="newPassword">
            <el-input
              v-model="resetForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleResetPassword"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="reset-password-button"
              :loading="loading"
              @click="handleResetPassword"
            >
              {{ loading ? '重置中...' : '重置密码' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="reset-password-footer">
          <p>
            记起密码了？
            <router-link to="/login">返回登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { sendVerificationCode, resetPassword } from '@/api/auth'
import { validateEmail, validatePassword } from '@/utils'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key } from '@element-plus/icons-vue'

const router = useRouter()

const resetFormRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const resetForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 计算属性：是否可以发送验证码
const canSendCode = computed(() => {
  return validateEmail(resetForm.email)
})

const validateEmailRule = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!validateEmail(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validateVerificationCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码为6位数字'))
  } else {
    callback()
  }
}

const validatePasswordRule = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (!validatePassword(value)) {
    callback(new Error('密码长度为6-20位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  email: [
    { validator: validateEmailRule, trigger: 'blur' }
  ],
  verificationCode: [
    { validator: validateVerificationCode, trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePasswordRule, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 发送验证码
const handleSendCode = async () => {
  if (!validateEmail(resetForm.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }
  
  try {
    sendingCode.value = true
    await sendVerificationCode({
      email: resetForm.email,
      type: 'reset'
    })
    
    ElMessage.success('验证码已发送，请注意查收')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('发送验证码失败，请检查网络连接')
    }
  } finally {
    sendingCode.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    // 直接发送整个表单数据，包括确认密码
    await resetPassword(resetForm)
    
    ElMessage.success('密码重置成功，请登录')
    router.push('/login')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('重置密码失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.reset-password-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
}

.reset-password-container {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
}

.reset-password-box {
  background: var(--bg-white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.reset-password-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.reset-password-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.reset-password-header h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 700;
  position: relative;
}

.reset-password-header h2::after {
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

.reset-password-header p {
  margin: 0;
  color: var(--text-regular);
  font-size: 1rem;
  font-weight: 500;
}

.reset-password-form {
  margin-bottom: var(--spacing-lg);
}

.reset-password-form .el-form-item {
  margin-bottom: var(--spacing-lg);
}

.reset-password-form .el-input__wrapper {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-lighter);
  transition: var(--transition-base);
  padding: 4px 0;
}

.reset-password-form .el-input__wrapper:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-light);
}

.reset-password-form .el-input__wrapper.is-focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.email-input-container {
  display: flex;
  gap: 10px;
}

.email-input-container .el-input {
  flex: 1;
}

.code-button {
  flex-shrink: 0;
  width: 120px;
  height: 40px;
  font-size: 14px;
}

.reset-password-button {
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

.reset-password-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.reset-password-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.reset-password-button:hover::before {
  left: 100%;
}

.reset-password-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-regular);
  margin-top: var(--spacing-lg);
}

.reset-password-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-fast);
  position: relative;
  padding-bottom: 2px;
}

.reset-password-footer a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-fast);
}

.reset-password-footer a:hover {
  color: var(--primary-dark);
}

.reset-password-footer a:hover::after {
  width: 100%;
}

@media (max-width: 480px) {
  .reset-password-container {
    max-width: 350px;
  }
  
  .reset-password-box {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .reset-password-header h2 {
    font-size: 1.5rem;
  }
}
</style>