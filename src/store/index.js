// 引入 Pinia 的 defineStore 方法，用于定义 store
import { defineStore } from "pinia";
// 引入 Vue 的 ref 和 computed，用于创建响应式数据和计算属性
import { ref, computed } from "vue";
// 引入获取用户信息的 API 方法
import { getUserInfo } from "@/api/user";
// 引入 Element Plus 的消息提示组件
import { ElMessage } from "element-plus";

/**
 * 用户状态管理 Store
 * 用于管理用户的登录状态、用户信息、权限等
 */
export const useUserStore = defineStore("user", () => {
  // ==================== 状态定义 ====================
  // 从 localStorage 中获取 token，如果不存在则为空字符串
  const token = ref(localStorage.getItem("token") || "");
  // 从 localStorage 中获取用户信息，如果不存在则为空对象
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo") || "{}"));

  // ==================== 计算属性 ====================
  // 判断用户是否已登录，token 存在即表示已登录
  const isLogin = computed(() => !!token.value);
  // 判断用户是否为管理员，role 为 1 表示管理员
  const isAdmin = computed(() => userInfo.value.role === 1);

  // ==================== Actions 方法 ====================
  /**
   * 设置 token
   * @param {string} newToken - 新的 token 值
   */
  const setToken = (newToken) => {
    token.value = newToken;
    // 同时将 token 保存到 localStorage，实现持久化存储
    localStorage.setItem("token", newToken);
  };

  /**
   * 设置用户信息
   * @param {object} info - 用户信息对象
   */
  const setUserInfo = (info) => {
    userInfo.value = info;
    // 将用户信息序列化为 JSON 字符串后保存到 localStorage
    localStorage.setItem("userInfo", JSON.stringify(info));
  };

  /**
   * 获取用户信息
   * 从服务器获取最新的用户信息并更新到 store
   * @returns {Promise<object>} 返回用户信息对象
   */
  const getUserInfoAction = async () => {
    try {
      // 调用 API 获取用户信息
      const res = await getUserInfo();
      // 更新 store 中的用户信息
      setUserInfo(res.data);
      return res.data;
    } catch (error) {
      // 获取失败时显示错误提示
      ElMessage.error("获取用户信息失败");
      // 抛出错误，让调用方处理
      throw error;
    }
  };

  /**
   * 用户登出
   * 清空 token 和用户信息，并清除 localStorage 中的数据
   */
  const logout = () => {
    token.value = "";
    userInfo.value = {};
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  };

  // 导出状态、计算属性和方法
  return {
    token,
    userInfo,
    isLogin,
    isAdmin,
    setToken,
    setUserInfo,
    getUserInfoAction,
    logout,
  };
});

/**
 * 全局状态管理 Store
 * 用于管理应用的全局状态，如加载状态、侧边栏折叠状态等
 */
export const useGlobalStore = defineStore("global", () => {
  // ==================== 状态定义 ====================
  // 全局加载状态，默认为 false
  const loading = ref(false);
  // 侧边栏折叠状态，默认为 false（展开状态）
  const sidebarCollapsed = ref(false);

  // ==================== Actions 方法 ====================
  /**
   * 设置全局加载状态
   * @param {boolean} status - 加载状态，true 表示加载中，false 表示加载完成
   */
  const setLoading = (status) => {
    loading.value = status;
  };

  /**
   * 切换侧边栏折叠/展开状态
   */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  // 导出状态和方法
  return {
    loading,
    sidebarCollapsed,
    setLoading,
    toggleSidebar,
  };
});

// ==================== Pinia 实例创建 ====================
// 引入 createPinia 方法用于创建 Pinia 实例
import { createPinia } from "pinia";
// 创建 Pinia 实例，用于在应用中管理所有状态
const pinia = createPinia();

// 导出 Pinia 实例，供 main.js 中注册使用
export default pinia;
