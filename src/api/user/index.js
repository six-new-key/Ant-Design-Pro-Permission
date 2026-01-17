import {request} from "@/utils";

//请求前缀
const PREFIX = "/user";

export function login(data) {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/login`,
    method: "POST",
    data: data,
  });
}

export function querySelf() {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/info`,
    method: "POST"
  });
}

export function logout() {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/logout`,
    method: "POST"
  });
}