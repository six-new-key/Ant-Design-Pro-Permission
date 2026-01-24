import request from '@/utils/request'

// ==================== 字典类型 ====================

/**
 * 分页查询字典类型
 */
export function getDictTypeList(pageNo, pageSize, params) {
  return request({
    url: `/dict/type/list/${pageNo}/${pageSize}`,
    method: 'get',
    params
  })
}

/**
 * 字典类型数据回显
 */
export function getDictTypeById(id) {
  return request({
    url: `/dict/type/echo/${id}`,
    method: 'get'
  })
}

/**
 * 新增字典类型
 */
export function addDictType(data) {
  return request({
    url: '/dict/type/add',
    method: 'post',
    data
  })
}

/**
 * 编辑字典类型
 */
export function editDictType(data) {
  return request({
    url: '/dict/type/edit',
    method: 'put',
    data
  })
}

/**
 * 批量删除字典类型
 */
export function deleteDictType(ids) {
  return request({
    url: `/dict/type/batch/remove/${ids}`,
    method: 'delete'
  })
}

/**
 * 修改字典类型状态
 */
export function updateDictTypeStatus(id) {
  return request({
    url: `/dict/type/edit/status/${id}`,
    method: 'put'
  })
}

/**
 * 查询所有启用的字典类型
 */
export function getAllDictTypes() {
  return request({
    url: '/dict/type/all',
    method: 'get'
  })
}

// ==================== 字典数据 ====================

/**
 * 分页查询字典数据
 */
export function getDictDataList(pageNo, pageSize, params) {
  return request({
    url: `/dict/data/list/${pageNo}/${pageSize}`,
    method: 'get',
    params
  })
}

/**
 * 字典数据回显
 */
export function getDictDataById(id) {
  return request({
    url: `/dict/data/echo/${id}`,
    method: 'get'
  })
}

/**
 * 根据字典类型查询数据（用于Select组件）
 */
export function getDictDataByType(type) {
  return request({
    url: `/dict/data/type/${type}`,
    method: 'get'
  })
}

/**
 * 新增字典数据
 */
export function addDictData(data) {
  return request({
    url: '/dict/data/add',
    method: 'post',
    data
  })
}

/**
 * 编辑字典数据
 */
export function editDictData(data) {
  return request({
    url: '/dict/data/edit',
    method: 'put',
    data
  })
}

/**
 * 批量删除字典数据
 */
export function deleteDictData(ids) {
  return request({
    url: `/dict/data/batch/remove/${ids}`,
    method: 'delete'
  })
}

/**
 * 修改字典数据状态
 */
export function updateDictDataStatus(id) {
  return request({
    url: `/dict/data/edit/status/${id}`,
    method: 'put'
  })
}
