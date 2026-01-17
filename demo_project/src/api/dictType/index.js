import httpRequest from '@/utils/request'

// 新增字典类型
export const addDictType = (data) => {
  return httpRequest({
    url: '/dict/type/add',
    method: 'POST',
    data
  })
}

// 修改字典类型
export const updateDict = (data) => {
  return httpRequest({
    url: '/dict/type/update',
    method: 'PUT',
    data
  })
}

// 修改字典状态
export const updateDictStatus = (id) => {
  return httpRequest({
    url: `/dict/type/update/status/${id}`,
    method: 'PUT'
  })
}

// 删除字典类型
export const deleteDict = (id) => {
  return httpRequest({
    url: `/dict/type/delete/${id}`,
    method: 'DELETE'
  })
}

// 批量删除字典类型
export const batchDeleteDict = (ids) => {
  return httpRequest({
    url: `/dict/type/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 分页查询字典类型数据
export const queryDictList = (pageNo, pageSize, dto) => {
  return httpRequest({
    url: `/dict/type/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: dto
  })
}

// 字典类型数据回显
export const echoDictById = (id) => {
  return httpRequest({
    url: `/dict/type/echo/${id}`,
    method: 'GET'
  })
}

// 查询字典类型数据
export const queryAllTypeData = () => {
  return httpRequest({
    url: '/dict/type/query/type',
    method: 'GET'
  })
}