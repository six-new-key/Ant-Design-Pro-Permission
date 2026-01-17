import httpRequest from '@/utils/request'

// 新增字典数据
export const addDictData = (data) => {
  return httpRequest({
    url: '/dict/data/add',
    method: 'POST',
    data
  })
}

// 修改字典数据
export const updateDict = (data) => {
  return httpRequest({
    url: '/dict/data/update',
    method: 'PUT',
    data
  })
}

// 修改字典数据状态
export const updateDictStatus = (id) => {
  return httpRequest({
    url: `/dict/data/update/status/${id}`,
    method: 'PUT'
  })
}

// 删除字典数据
export const deleteDict = (id) => {
  return httpRequest({
    url: `/dict/data/delete/${id}`,
    method: 'DELETE'
  })
}

// 批量删除字典数据
export const batchDeleteDict = (ids) => {
  return httpRequest({
    url: `/dict/data/batch/delete/${ids.join(',')}`,
    method: 'DELETE'
  })
}

// 分页查询字典数据
export const queryDictDataList = (pageNo, pageSize, dto) => {
  return httpRequest({
    url: `/dict/data/list/${pageNo}/${pageSize}`,
    method: 'GET',
    params: dto
  })
}

// 字典数据回显
export const echoDictById = (id) => {
  return httpRequest({
    url: `/dict/data/echo/${id}`,
    method: 'GET'
  })
}

// 查询字典标签数据
export const queryDictLabelList = (type) => {
  return httpRequest({
    url: '/dict/data/query/label',
    method: 'GET',
    params: { type }
  })
}