//本地存储token
export const SET_TOKEN = (token) => {
  localStorage.setItem("TOKEN", token);
}

//删除token
export const REMOVE_TOKEN = () => {
  localStorage.removeItem("TOKEN");
}

//获取token
export const GET_TOKEN = () => {
  return localStorage.getItem("TOKEN");
}