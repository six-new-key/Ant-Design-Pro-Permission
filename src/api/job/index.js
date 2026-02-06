import request from '@/utils/request'

/**
 * 分页查询定时任务
 */
export function getJobPage(params) {
  return request({
    url: '/api/schedule/job/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询定时任务
 */
export function getJobById(jobId) {
  return request({
    url: `/api/schedule/job/${jobId}`,
    method: 'get'
  })
}

/**
 * 新增定时任务
 */
export function addJob(data) {
  return request({
    url: '/api/schedule/job',
    method: 'post',
    data
  })
}

/**
 * 修改定时任务
 */
export function updateJob(data) {
  return request({
    url: '/api/schedule/job',
    method: 'put',
    data
  })
}

/**
 * 删除定时任务
 */
export function deleteJob(jobId) {
  return request({
    url: `/api/schedule/job/${jobId}`,
    method: 'delete'
  })
}

/**
 * 批量删除定时任务
 */
export function batchDeleteJobs(jobIds) {
  return request({
    url: '/api/schedule/job/batch',
    method: 'delete',
    data: jobIds
  })
}

/**
 * 修改任务状态
 */
export function changeStatus(jobId, status) {
  return request({
    url: '/api/schedule/job/changeStatus',
    method: 'put',
    params: { jobId, status }
  })
}

/**
 * 立即执行任务
 */
export function runJob(jobId) {
  return request({
    url: `/api/schedule/job/run/${jobId}`,
    method: 'post'
  })
}

/**
 * 分页查询定时任务日志
 */
export function getJobLogPage(params) {
  return request({
    url: '/api/schedule/job/log/page',
    method: 'get',
    params
  })
}

/**
 * 清空任务日志
 */
export function cleanJobLog() {
  return request({
    url: '/api/schedule/job/log/clean',
    method: 'delete'
  })
}
