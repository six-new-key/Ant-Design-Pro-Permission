/**
 * 二次封装消息提示组件
 */

import { message } from 'ant-design-vue'

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
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长，默认1.5秒
   * @param {function} onClose - 关闭回调
   */
  info(content, duration = 1.5, onClose) {
    const contentStr = typeof content === 'string' ? content : content?.content || ''
    const durationNum = typeof content === 'object' ? content.duration || 1.5 : duration
    const key = generateMessageKey('info', contentStr)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + (durationNum * 1000)
      messageMap.set(key, { expireTime })
      
      if (typeof content === 'object') {
        return message.info(content)
      } else {
        return message.info(content, duration, onClose)
      }
    }
  },
  
  /**
   * 成功提示
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长，默认1.5秒
   * @param {function} onClose - 关闭回调
   */
  success(content, duration = 1.5, onClose) {
    const contentStr = typeof content === 'string' ? content : content?.content || ''
    const durationNum = typeof content === 'object' ? content.duration || 1.5 : duration
    const key = generateMessageKey('success', contentStr)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + (durationNum * 1000)
      messageMap.set(key, { expireTime })
      
      if (typeof content === 'object') {
        return message.success(content)
      } else {
        return message.success(content, duration, onClose)
      }
    }
  },
  
  /**
   * 警告提示
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长，默认1.5秒
   * @param {function} onClose - 关闭回调
   */
  warning(content, duration = 1.5, onClose) {
    const contentStr = typeof content === 'string' ? content : content?.content || ''
    const durationNum = typeof content === 'object' ? content.duration || 1.5 : duration
    const key = generateMessageKey('warning', contentStr)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + (durationNum * 1000)
      messageMap.set(key, { expireTime })
      
      if (typeof content === 'object') {
        return message.warning(content)
      } else {
        return message.warning(content, duration, onClose)
      }
    }
  },
  
  /**
   * 错误提示
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长，默认1.5秒
   * @param {function} onClose - 关闭回调
   */
  error(content, duration = 1.5, onClose) {
    const contentStr = typeof content === 'string' ? content : content?.content || ''
    const durationNum = typeof content === 'object' ? content.duration || 1.5 : duration
    const key = generateMessageKey('error', contentStr)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = Date.now() + (durationNum * 1000)
      messageMap.set(key, { expireTime })
      
      if (typeof content === 'object') {
        return message.error(content)
      } else {
        return message.error(content, duration, onClose)
      }
    }
  },
  
  /**
   * 加载提示
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长，默认0（不自动关闭）
   * @param {function} onClose - 关闭回调
   */
  loading(content, duration = 0, onClose) {
    const contentStr = typeof content === 'string' ? content : content?.content || ''
    const durationNum = typeof content === 'object' ? content.duration || 0 : duration
    const key = generateMessageKey('loading', contentStr)
    
    cleanExpiredMessages()
    
    if (!messageMap.has(key)) {
      const expireTime = durationNum > 0 ? Date.now() + (durationNum * 1000) : Date.now() + 30000 // 30秒后清理记录
      messageMap.set(key, { expireTime })
      
      if (typeof content === 'object') {
        return message.loading(content)
      } else {
        return message.loading(content, duration, onClose)
      }
    }
  },
  
  /**
   * 清除所有消息
   */
  destroy() {
    messageMap.clear()
    return message.destroy()
  },

  /**
   * 关闭指定消息
   * @param {string} key - 消息的唯一标识
   */
  close(key) {
    return message.close && message.close(key)
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
   * @param {number} config.duration - 默认显示时长
   * @param {number} config.maxCount - 最大显示数量
   * @param {string} config.top - 距离顶部的位置
   * @param {boolean} config.rtl - 是否开启RTL模式
   */
  config(config) {
    return message.config(config)
  }
}

export default CustomMessage