import { Modal } from 'ant-design-vue'

/**
 * 通用确认删除对话框
 * @param {Object} options 配置选项
 * @param {string} options.title 标题
 * @param {string} options.content 内容
 * @param {Function} options.onOk 确认回调
 * @param {string} options.okText 确认按钮文字
 * @param {string} options.cancelText 取消按钮文字
 * @param {boolean} options.centered 是否居中显示
 * @returns {Promise}
 */
export function confirmDelete(options) {
  const {
    title = '确认删除',
    content,
    onOk,
    okText = '确定',
    cancelText = '取消',
    centered = true
  } = options

  return Modal.confirm({
    title,
    content,
    okText,
    okType: 'danger',
    cancelText,
    centered,
    onOk
  })
}

/**
 * 通用确认对话框
 * @param {Object} options 配置选项
 * @returns {Promise}
 */
export function confirm(options) {
  const {
    title = '确认',
    content,
    onOk,
    okText = '确定',
    cancelText = '取消',
    okType = 'primary',
    centered = true
  } = options

  return Modal.confirm({
    title,
    content,
    okText,
    okType,
    cancelText,
    centered,
    onOk
  })
}
