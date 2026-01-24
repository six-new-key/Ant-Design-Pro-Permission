import { request } from "@/utils";

const PREFIX = "/ip_black";

// 分页查询IP黑名单
export function queryIpBlacklistList(pageNo, pageSize, params = {}) {
  return request({
    url: `${PREFIX}/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params
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
