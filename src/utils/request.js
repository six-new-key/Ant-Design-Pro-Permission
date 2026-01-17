//对于axios进行二次封装
import axios from "axios";
import { message ,AuthUtils} from "@/utils";
import router from "@/router";
import {useUserStore} from "@/stores";

//配置通用的基础路径和超时时间
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

//请求拦截器
request.interceptors.request.use((config) => {
  //config：配置对象，对象里面有一个属性很重要，headers请求头
  config.headers["Authorization"] = AuthUtils.getToken() || ""; // 设置请求头
  return config;
});

//响应拦截器
request.interceptors.response.use(
  (response) => {
    //响应成功的回调
    let userStore = useUserStore();
    const res = response.data;
    const code = res.code;
    if (code !== 200 && code !== 405) {
      message.error(res.message);
    }
    if (code === 405) {
      userStore.handleLogout();
    }
    return res;
  },
  (error) => {
    //响应失败的回调
    return Promise.reject(new Error("faile"));
  }
);

//对外暴露
export default request;
