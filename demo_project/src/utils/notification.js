import { NotifyPlugin } from 'tdesign-vue-next'

// 用于存储已显示的通知，避免重复显示
const notificationMap = new Map()

// 生成通知的唯一标识
const generateNotificationKey = (type, title, content) => {
  return `${type}_${title}_${content}`
}

// 清理过期的通知记录
const cleanExpiredNotifications = () => {
  const now = Date.now()
  for (const [key, data] of notificationMap.entries()) {
    if (now > data.expireTime) {
      notificationMap.delete(key)
    }
  }
}

// 封装的Notification对象
const CustomNotification = {
  /**
   * 信息通知
   * @param {object} options - 通知配置对象
   * @param {string} options.title - 通知标题
   * @param {string} options.content - 通知内容
   * @param {number} options.duration - 显示时长，默认3000ms
   * @param {string} options.placement - 弹出位置，默认'top-right'
   * @param {boolean} options.closeBtnProps - 是否显示关闭按钮
   * @param {function} options.onClose - 关闭回调
   * @param {function} options.onClick - 点击回调
   */
  info(options = {}) {
    const { title = '', content = '', duration = 3000 } = options
    const key = generateNotificationKey('info', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + duration
      notificationMap.set(key, { expireTime })
      
      return NotifyPlugin.info({
        placement: 'top-right',
        ...options
      })
    }
  },
  
  /**
   * 成功通知
   * @param {object} options - 通知配置对象
   */
  success(options = {}) {
    const { title = '', content = '', duration = 3000 } = options
    const key = generateNotificationKey('success', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + duration
      notificationMap.set(key, { expireTime })
      
      return NotifyPlugin.success({
        placement: 'top-right',
        ...options
      })
    }
  },
  
  /**
   * 警告通知
   * @param {object} options - 通知配置对象
   */
  warning(options = {}) {
    const { title = '', content = '', duration = 3000 } = options
    const key = generateNotificationKey('warning', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + duration
      notificationMap.set(key, { expireTime })
      
      return NotifyPlugin.warning({
        placement: 'top-right',
        ...options
      })
    }
  },
  
  /**
   * 错误通知
   * @param {object} options - 通知配置对象
   */
  error(options = {}) {
    const { title = '', content = '', duration = 3000 } = options
    const key = generateNotificationKey('error', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + duration
      notificationMap.set(key, { expireTime })
      
      return NotifyPlugin.error({
        placement: 'top-right',
        ...options
      })
    }
  },
  
  /**
   * 通用通知方法
   * @param {object} options - 通知配置对象
   * @param {string} options.theme - 通知类型：'info'|'success'|'warning'|'error'
   */
  open(options = {}) {
    const { theme = 'info', title = '', content = '', duration = 3000 } = options
    const key = generateNotificationKey(theme, title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + duration
      notificationMap.set(key, { expireTime })
      
      return NotifyPlugin({
        placement: 'top-right',
        ...options
      })
    }
  },
  
  /**
   * 清除所有通知
   */
  clear() {
    notificationMap.clear()
    return NotifyPlugin.closeAll()
  },
  
  /**
   * 关闭指定通知
   * @param {Promise} promise - 通知实例的Promise
   */
  close(promise) {
    if (promise && typeof promise.then === 'function') {
      promise.then(instance => {
        if (instance && instance.close) {
          instance.close()
        }
      })
    }
  },
  
  /**
   * 手动清理过期通知记录
   */
  cleanExpired() {
    cleanExpiredNotifications()
  },
  
  /**
   * 配置全局默认选项
   * @param {object} config - 全局配置
   */
  config(config) {
    return NotifyPlugin.config(config)
  }
}

export default CustomNotification