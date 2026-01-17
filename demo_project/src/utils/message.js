import { MessagePlugin } from 'tdesign-vue-next'

// 用于存储已显示的消息，避免重复显示
const messageMap = new Map()

// 生成消息的唯一标识
const generateMessageKey = (type, content) => {
  return `${type}_${content}`
}

// 清理过期的消息记录
const cleanExpiredMessages = () => {
  const now = Date.now()
  for (const [key, data] of messageMap.entries()) {
    if (now > data.expireTime) {
      messageMap.delete(key)
    }
  }
}

// 封装的Message对象
const CustomMessage = {
  /**
   * 信息提示
   * @param {string|object} options - 消息内容或配置对象
   * @param {string} options.content - 消息内容
   * @param {number} options.duration - 显示时长，默认3000ms
   * @param {boolean} options.closeBtnProps - 是否显示关闭按钮
   * @param {string} options.placement - 弹出位置
   * @param {function} options.onClose - 关闭回调
   */
  info(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('info', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.info(config)
    }
  },
  
  /**
   * 成功提示
   * @param {string|object} options - 消息内容或配置对象
   */
  success(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('success', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.success(config)
    }
  },
  
  /**
   * 警告提示
   * @param {string|object} options - 消息内容或配置对象
   */
  warning(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('warning', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.warning(config)
    }
  },
  
  /**
   * 错误提示
   * @param {string|object} options - 消息内容或配置对象
   */
  error(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('error', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.error(config)
    }
  },
  
  /**
   * 加载提示
   * @param {string|object} options - 消息内容或配置对象
   */
  loading(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('loading', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.loading(config)
    }
  },
  
  /**
   * 问询提示
   * @param {string|object} options - 消息内容或配置对象
   */
  question(options) {
    const content = typeof options === 'string' ? options : options?.content || ''
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    const key = generateMessageKey('question', content)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + duration
      messageMap.set(key, { expireTime })
      
      const config = typeof options === 'string' ? { content: options } : options
      return MessagePlugin.question(config)
    }
  },
  
  /**
   * 清除所有消息
   */
  clear() {
    messageMap.clear()
    return MessagePlugin.closeAll()
  },
  
  /**
   * 关闭指定消息
   * @param {Promise} promise - 消息实例的Promise
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
   * 手动清理过期消息记录
   */
  cleanExpired() {
    cleanExpiredMessages()
  },
  
  /**
   * 配置全局默认选项
   * @param {object} config - 全局配置
   */
  config(config) {
    return MessagePlugin.config(config)
  }
}

export default CustomMessage