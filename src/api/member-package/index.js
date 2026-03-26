import request from '@/utils/request'

/**
 * 查询所有会员套餐
 */
export function getMemberPackageList() {
  return request({
    url: '/member_package/list',
    method: 'get'
  })
}

/**
 * 分页查询会员套餐
 */
export function getMemberPackagePage(params) {
  return request({
    url: '/member_package/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询会员套餐
 */
export function getMemberPackageById(id) {
  return request({
    url: `/member_package/${id}`,
    method: 'get'
  })
}

/**
 * 新增会员套餐
 */
export function addMemberPackage(data) {
  return request({
    url: '/member_package/add',
    method: 'post',
    data
  })
}

/**
 * 更新会员套餐
 */
export function updateMemberPackage(data) {
  return request({
    url: '/member_package/edit',
    method: 'put',
    data
  })
}

/**
 * 删除会员套餐
 */
export function deleteMemberPackage(id) {
  return request({
    url: `/member_package/remove/${id}`,
    method: 'delete'
  })
}
