import { request } from "@/utils";

//请求前缀
const PREFIX = "/llm";

export function queryConversationHistory() {
  return request({
    //模板字符串拼接参数
    url: `${PREFIX}/query/conversation/history`,
    method: "POST"
  });
}