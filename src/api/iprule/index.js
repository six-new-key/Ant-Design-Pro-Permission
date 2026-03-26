import { request } from "@/utils";

const PREFIX = "/iprule";

// 分页查询IP黑名单
export function queryIpBlacklistList(data) {
  return request({
    url: `${PREFIX}/list`,
    method: 'POST',
    data
  })
}

// 新增IP黑名单
export function addIpBlacklist(data) {
  return request({
    url: `${PREFIX}/add`,
    method: 'POST',
    data
  })
}

// 修改IP黑名单
export function updateIpBlacklist(data) {
  return request({
    url: `${PREFIX}/edit`,
    method: 'PUT',
    data
  })
}

// 批量删除IP黑名单
export function batchDeleteIpBlacklist(ids) {
  return request({
    url: `${PREFIX}/batch/remove/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 修改IP黑名单状态
export function updateIpBlacklistStatus(id) {
  return request({
    url: `${PREFIX}/status/${id}`,
    method: 'PUT'
  })
}

// IP黑名单数据回显
export function echoIpBlacklist(id) {
  return request({
    url: `${PREFIX}/echo/${id}`,
    method: 'GET'
  })
}

// 刷新IP黑名单缓存
export function refreshIpBlacklistCache() {
  return request({
    url: `${PREFIX}/refresh-cache`,
    method: 'POST'
  })
}

// 导出IP黑名单
export function exportIpBlacklist(params = {}) {
  return request({
    url: `${PREFIX}/export`,
    method: 'GET',
    params,
    responseType: 'blob'
  })
}

// 导入IP黑名单
export function importIpBlacklist(data) {
  return request({
    url: `${PREFIX}/import`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载IP黑名单导入模板
export function downloadIpBlacklistTemplate() {
  return request({
    url: `${PREFIX}/import/template`,
    method: 'GET',
    responseType: 'blob'
  })
}
