import request from '@/utils/request'

//请求前缀
const PREFIX_JOB = "/schedule/job";
const PREFIX_JOB_LOG = "/schedule/job/log";

/**
 * 分页查询定时任务
 */
export function getJobPage(data) {
  return request({
    url: `${PREFIX_JOB}/page`,
    method: 'post',
    data
  })
}

/**
 * 根据ID查询定时任务
 */
export function getJobById(jobId) {
  return request({
    url: `${PREFIX_JOB}/detail/${jobId}`,
    method: 'get'
  })
}

/**
 * 新增定时任务
 */
export function addJob(data) {
  return request({
    url: `${PREFIX_JOB}/add`,
    method: 'post',
    data
  })
}

/**
 * 修改定时任务
 */
export function updateJob(data) {
  return request({
    url: `${PREFIX_JOB}/update`,
    method: 'put',
    data
  })
}

/**
 * 删除定时任务
 */
export function deleteJob(jobId) {
  return request({
    url: `${PREFIX_JOB}/single/${jobId}`,
    method: 'delete'
  })
}

/**
 * 批量删除定时任务
 */
export function batchDeleteJobs(jobIds) {
  return request({
    url: `${PREFIX_JOB}/batch`,
    method: 'delete',
    data: jobIds
  })
}

/**
 * 修改任务状态
 */
export function changeStatus(jobId, status) {
  return request({
    url: `${PREFIX_JOB}/changeStatus`,
    method: 'put',
    params: { jobId, status }
  })
}

/**
 * 立即执行任务
 */
export function runJob(jobId) {
  return request({
    url: `${PREFIX_JOB}/run/${jobId}`,
    method: 'post'
  })
}

/**
 * 分页查询定时任务日志
 */
export function getJobLogPage(data) {
  return request({
    url: `${PREFIX_JOB_LOG}/page`,
    method: 'post',
    data
  })
}

/**
 * 清空任务日志
 */
export function cleanJobLog() {
  return request({
    url: `${PREFIX_JOB_LOG}/clean`,
    method: 'delete'
  })
}
