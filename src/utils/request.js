import axios from "axios";
import JSONbig from "json-bigint";

// 创建 JSONbig 实例，只将大整数转换为字符串
const JSONbigString = JSONbig({ storeAsString: true });

// 创建axios实例
const service = axios.create({
  baseURL: "http://localhost:8081/api",
  timeout: 15000,
  // 使用 json-bigint 处理大整数，将大整数转换为字符串
  transformResponse: [
    function (data) {
      try {
        return JSONbigString.parse(data);
      } catch (e) {
        return data;
      }
    },
  ],
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 获取token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 添加调试日志
    console.log("Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.log("Request error:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 添加调试日志
    console.log("Response:", {
      status: response.status,
      data: res,
    });

    // 如果状态码不是200，则认为有错误
    if (res.code !== 200) {
      // 处理不同错误码
      switch (res.code) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          window.location.href = "/login";
          break;
        case 403:
          console.error("无权限访问");
          break;
        case 404:
          console.error("资源不存在");
          break;
        case 500:
          console.error("服务器内部错误");
          break;
        default:
          console.error(res.message || "请求失败");
      }
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    console.log("Response error:", error);
    // 处理网络错误或服务器未响应的情况
    if (error.response) {
      // 服务器返回了响应，但状态码不在2xx范围内
      const status = error.response.status;
      let message = "请求失败";

      switch (status) {
        case 400:
          message = "请求参数错误";
          break;
        case 401:
          message = "未授权，请登录";
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求地址不存在";
          break;
        case 500:
          message = "服务器内部错误";
          break;
        default:
          message = `连接出错(${status})!`;
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      return Promise.reject(new Error("网络连接异常，请检查网络"));
    } else {
      // 其他错误
      return Promise.reject(new Error(error.message || "未知错误"));
    }
  },
);

export default service;
