/**
 * 二次封装消息提示组件
 */
import { notification } from 'ant-design-vue'

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
   * @param {string|object} config - 通知内容或配置对象
   */
  info(config = {}) {
    // 如果传入的是字符串，转换为配置对象
    if (typeof config === 'string') {
      config = { message: config }
    }
    
    const { message: title = '', description: content = '', duration = 4.5 } = config
    const key = generateNotificationKey('info', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + (duration * 1000)
      notificationMap.set(key, { expireTime })
      
      return notification.info({
        placement: 'topRight',
        duration,
        ...config
      })
    }
  },
  
  /**
   * 成功通知
   * @param {string|object} config - 通知内容或配置对象
   */
  success(config = {}) {
    // 如果传入的是字符串，转换为配置对象
    if (typeof config === 'string') {
      config = { message: config }
    }
    
    const { message: title = '', description: content = '', duration = 4.5 } = config
    const key = generateNotificationKey('success', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + (duration * 1000)
      notificationMap.set(key, { expireTime })
      
      return notification.success({
        placement: 'topRight',
        duration,
        ...config
      })
    }
  },
  
  /**
   * 警告通知
   * @param {string|object} config - 通知内容或配置对象
   */
  warning(config = {}) {
    // 如果传入的是字符串，转换为配置对象
    if (typeof config === 'string') {
      config = { message: config }
    }
    
    const { message: title = '', description: content = '', duration = 4.5 } = config
    const key = generateNotificationKey('warning', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + (duration * 1000)
      notificationMap.set(key, { expireTime })
      
      return notification.warning({
        placement: 'topRight',
        duration,
        ...config
      })
    }
  },
  
  /**
   * 错误通知
   * @param {string|object} config - 通知内容或配置对象
   */
  error(config = {}) {
    // 如果传入的是字符串，转换为配置对象
    if (typeof config === 'string') {
      config = { message: config }
    }
    
    const { message: title = '', description: content = '', duration = 4.5 } = config
    const key = generateNotificationKey('error', title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + (duration * 1000)
      notificationMap.set(key, { expireTime })
      
      return notification.error({
        placement: 'topRight',
        duration,
        ...config
      })
    }
  },
  
  /**
   * 通用通知方法
   * @param {object} config - 通知配置对象
   * @param {string} config.type - 通知类型：'info'|'success'|'warning'|'error'
   */
  open(config = {}) {
    const { type = 'info', message: title = '', description: content = '', duration = 4.5 } = config
    const key = generateNotificationKey(type, title, content)
    
    cleanExpiredNotifications()
    
    if (!notificationMap.has(key)) {
      const expireTime = Date.now() + (duration * 1000)
      notificationMap.set(key, { expireTime })
      
      return notification.open({
        placement: 'topRight',
        duration,
        ...config
      })
    }
  },
  
  /**
   * 清除所有通知
   */
  destroy() {
    notificationMap.clear()
    return notification.destroy()
  },
  
  /**
   * 关闭指定通知
   * @param {string} key - 通知的唯一标识
   */
  close(key) {
    return notification.close(key)
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
   * @param {string} config.placement - 弹出位置
   * @param {number} config.duration - 默认显示时长
   * @param {boolean} config.closeIcon - 是否显示关闭按钮
   * @param {string} config.top - 距离顶部的位置
   * @param {string} config.bottom - 距离底部的位置
   * @param {boolean} config.rtl - 是否开启RTL模式
   */
  config(config) {
    return notification.config(config)
  }
}

export default CustomNotification