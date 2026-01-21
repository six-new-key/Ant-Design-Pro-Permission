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
 * 刷新缓存
 */
export function refreshSystemConfigCache() {
  return request({
    url: `${PREFIX}/refresh-cache`,
    method: 'POST'
  })
}

export function updateIpBlacklistEnabled(enabled) {
  return updateSystemConfig({
    configKey: 'ip_blacklist_enabled',
    configValue: enabled ? 'true' : 'false'
  })
}
