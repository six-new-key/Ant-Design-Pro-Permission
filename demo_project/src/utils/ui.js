/**
 * TDesign UI 组件统一封装入口
 * 提供全局提示组件的统一导入和使用
 */

import CustomMessage from './message.js'
import CustomNotification from './notification.js'

// 导出封装的组件
export const Message = CustomMessage
export const Notification = CustomNotification

// 默认导出
export default {
  Message: CustomMessage,
  Notification: CustomNotification
}

/**
 * 使用示例：
 * 
 * // 方式1：按需导入
 * import { Message, Notification } from '@/utils/ui'
 * Message.success('操作成功')
 * Notification.info({ title: '提示', content: '这是一条信息' })
 * 
 * // 方式2：全量导入
 * import UI from '@/utils/ui'
 * UI.Message.success('操作成功')
 * UI.Notification.info({ title: '提示', content: '这是一条信息' })
 * 
 * // 方式3：直接导入单个组件
 * import Message from '@/utils/message'
 * import Notification from '@/utils/notification'
 */