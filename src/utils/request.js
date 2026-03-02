import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果状态码不是200，则认为有错误
    if (res.code !== 200) {
      // 处理不同错误码
      switch (res.code) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('无权限访问')
          break
        case 404:
          console.error('资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service