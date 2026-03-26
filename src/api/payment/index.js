import request from '@/utils/request'

// ==================== 支付操作 ====================

/**
 * 发起支付
 */
export function createPayment(data) {
  return request({
    url: '/payment/pay',
    method: 'post',
    data
  })
}

/**
 * 查询订单状态
 */
export function queryPayment(data) {
  return request({
    url: '/payment/query',
    method: 'post',
    data
  })
}

/**
 * 发起退款
 */
export function refundPayment(data) {
  return request({
    url: '/payment/refund',
    method: 'post',
    data
  })
}

/**
 * 查询退款状态
 */
export function queryRefundStatus(data) {
  return request({
    url: '/payment/refund/query',
    method: 'post',
    data
  })
}

/**
 * 关闭订单
 */
export function closePayment(data) {
  return request({
    url: '/payment/close',
    method: 'post',
    data
  })
}

/**
 * 撤销订单（仅支付宝）
 */
export function cancelPayment(data) {
  return request({
    url: '/payment/cancel',
    method: 'post',
    data
  })
}

// ==================== 订单管理 ====================

/**
 * 分页查询订单列表
 */
export function queryOrderPage(params) {
  return request({
    url: '/pay/order/page',
    method: 'get',
    params
  })
}

/**
 * 查询订单详情
 */
export function getOrderById(id) {
  return request({
    url: `/pay/order/${id}`,
    method: 'get'
  })
}

/**
 * 删除订单
 */
export function deleteOrder(id) {
  return request({
    url: `/pay/order/delete/${id}`,
    method: 'delete'
  })
}

// ==================== 退款记录 ====================

/**
 * 分页查询退款记录
 */
export function queryRefundPage(params) {
  return request({
    url: '/pay/order/refund/page',
    method: 'get',
    params
  })
}

/**
 * 查询退款记录详情
 */
export function getRefundById(id) {
  return request({
    url: `/pay/order/refund/${id}`,
    method: 'get'
  })
}

/**
 * 删除退款记录
 */
export function deleteRefund(id) {
  return request({
    url: `/pay/order/delete/refund/${id}`,
    method: 'delete'
  })
}
