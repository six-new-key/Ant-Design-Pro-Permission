import request from '@/utils/request'

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
 * 根据key获取配置值（只返回值，带缓存）
 */
export function getSystemConfigValue(configKey) {
  return request({
    url: `${PREFIX}/value/${configKey}`,
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
 * 更新配置
 */
export function updateSystemConfig(id, data) {
  return request({
    url: `${PREFIX}/update/${id}`,
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
