//对于axios进行二次封装
import axios from "axios";
import { Message } from "@/utils/ui";
import router from "@/router/index";
import { useUserStore } from "@/store/modules/user";

//配置通用的基础路径和超时时间
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 60000,
});

//请求拦截器
httpRequest.interceptors.request.use((config) => {
  //config：配置对象，对象里面有一个属性很重要，headers请求头
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers["authorization"] = userStore.token; // 设置请求头
  }
  return config;
});

//响应拦截器
httpRequest.interceptors.response.use(
  (response) => {
    //响应成功的回调
    const res = response.data;
    const code = res.code;
    
    // 只有非200状态码才显示错误信息
    if (code !== 200) {
      Message.error(res.message || '请求失败');
    }
    
    // 401未授权，清除token并跳转登录页
    if (code === 401) {
      const userStore = useUserStore();
      userStore.logout();
      Message.error('登录已过期，请重新登录');
      router.push('/login');
    }
    
    return res;
  },
  (error) => {
    //响应失败的回调
    console.error('请求错误:', error);
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          const userStore = useUserStore();
          userStore.logout();
          Message.error('登录已过期，请重新登录');
          router.push('/login');
          break;
        case 403:
          Message.error('没有权限访问');
          break;
        case 404:
          Message.error('请求的资源不存在');
          break;
        case 500:
          Message.error('服务器内部错误');
          break;
        default:
          Message.error('网络错误，请稍后重试');
      }
    } else {
      Message.error('网络连接失败，请检查网络');
    }
    
    return Promise.reject(error);
  }
);

//对外暴露
export default httpRequest;
