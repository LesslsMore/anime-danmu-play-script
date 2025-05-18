import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_baseURL,
  timeout: 15000 // 请求超时时间
})

// 请求拦截器（添加 Token）
request.interceptors.request.use((config) => {
  // config.headers.Authorization = "Bearer xxx";
  return config;
});

// 响应拦截器（提取核心数据）
request.interceptors.response.use((response) => {
  return response.data; // 直接返回 response.data，后续无需手动提取
}, (error) => {
  return Promise.reject(error);
});

export {
  request
}
