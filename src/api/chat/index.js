/**
 * 聊天接口 - 流式响应
 */

import {AuthUtils} from "@/utils";

export const chatStream = async (chatDto) => {
  // 使用代理路径，避免跨域问题
  const response = await fetch('/api/llm/chat', {
            method: 'POST',
            headers: {
                'Authorization': AuthUtils.getToken(),
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'text/plain',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(chatDto)
        })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}
