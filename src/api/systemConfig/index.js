import { request } from "@/utils";

const PREFIX = "/system_config";

/**
 * 查询所有系统配置
 */
export function getSystemConfigList() {
  return request({
    url: `${PREFIX}/list`,
    method: 'GET'
  })
}

/**
 * 新增配置
 */
export function addSystemConfig(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

/**
 * 修改配置值
 */
export function updateSystemConfig(data) {
  return request({
    url: `${PREFIX}/update`,
    method: 'PUT',
    data
  })
}

/**
 * 删除配置
 */
export function deleteSystemConfig(id) {
  return request({
    url: `${PREFIX}/delete/${id}`,
    method: 'DELETE'
  })
}

/**
 * 刷新缓存
 */
export function refreshSystemConfigCache() {
  return request({
    url: `${PREFIX}/refresh-cache`,
    method: 'POST'
  })
}
