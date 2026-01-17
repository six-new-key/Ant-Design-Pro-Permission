/**
 * TDesign UI 组件封装使用示例
 * 展示各种使用场景和最佳实践
 */

import { Message, Notification } from "./ui.js";

// ==================== Message 使用示例 ====================

/**
 * 基础消息提示示例
 */
export const messageExamples = {
  // 成功消息
  showSuccess() {
    Message.success("操作成功！");

    // 带配置的成功消息
    Message.success({
      content: "数据保存成功",
      duration: 2000,
      onClose: () => console.log("成功消息已关闭"),
    });
  },

  // 错误消息
  showError() {
    Message.error("操作失败，请重试");

    // 长时间显示的错误消息
    Message.error({
      content: "网络连接失败，请检查网络设置",
      duration: 5000,
      closeBtnProps: true,
    });
  },

  // 警告消息
  showWarning() {
    Message.warning("请注意数据安全");
  },

  // 信息消息
  showInfo() {
    Message.info("这是一条提示信息");
  },

  // 加载消息
  showLoading() {
    const loadingMessage = Message.loading("正在处理中，请稍候...");

    // 模拟异步操作
    setTimeout(() => {
      Message.close(loadingMessage);
      Message.success("处理完成");
    }, 3000);
  },

  // 问询消息
  showQuestion() {
    Message.question("确定要删除这条记录吗？");
  },
};

/**
 * 实际业务场景示例
 */
export const businessMessageExamples = {
  // 表单提交
  async submitForm(formData) {
    const loading = Message.loading("正在提交表单...");

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Message.close(loading);
      Message.success({
        content: "表单提交成功",
        duration: 2000,
      });
    } catch (error) {
      Message.close(loading);
      Message.error({
        content: `提交失败：${error.message}`,
        duration: 4000,
        closeBtnProps: true,
      });
    }
  },

  // 文件上传
  async uploadFile(file) {
    if (!file) {
      Message.warning("请选择要上传的文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Message.error("文件大小不能超过 10MB");
      return;
    }

    const loading = Message.loading("正在上传文件...");

    try {
      // 模拟文件上传
      await new Promise((resolve) => setTimeout(resolve, 3000));

      Message.close(loading);
      Message.success("文件上传成功");
    } catch (error) {
      Message.close(loading);
      Message.error("文件上传失败，请重试");
    }
  },

  // 数据删除确认
  confirmDelete(itemName) {
    Message.question({
      content: `确定要删除 "${itemName}" 吗？此操作不可恢复`,
      duration: 0, // 不自动关闭
      closeBtnProps: true,
    });
  },
};

// ==================== Notification 使用示例 ====================

/**
 * 基础通知示例
 */
export const notificationExamples = {
  // 成功通知
  showSuccess() {
    Notification.success({
      title: "操作成功",
      content: "您的数据已成功保存到服务器",
    });
  },

  // 错误通知
  showError() {
    Notification.error({
      title: "操作失败",
      content: "网络连接超时，请检查网络设置后重试",
      duration: 6000,
    });
  },

  // 警告通知
  showWarning() {
    Notification.warning({
      title: "注意",
      content: "您的会话即将过期，请及时保存数据",
      duration: 0, // 不自动关闭
      onClick: () => {
        console.log("用户点击了通知");
      },
    });
  },

  // 信息通知
  showInfo() {
    Notification.info({
      title: "系统提醒",
      content: "系统将在今晚 23:00 进行维护，预计持续 2 小时",
    });
  },

  // 自定义位置
  showCustomPlacement() {
    Notification.info({
      title: "底部通知",
      content: "这是一个显示在底部的通知",
      placement: "bottom-right",
    });
  },
};

/**
 * 实际业务场景示例
 */
export const businessNotificationExamples = {
  // 系统通知
  systemNotification() {
    Notification.info({
      title: "系统通知",
      content: "您有 3 条新消息待查看",
      duration: 5000,
      onClick: () => {
        // 跳转到消息页面
        console.log("跳转到消息页面");
      },
    });
  },

  // 操作结果通知
  operationResult(success, message) {
    if (success) {
      Notification.success({
        title: "操作成功",
        content: message || "操作已完成",
        duration: 3000,
      });
    } else {
      Notification.error({
        title: "操作失败",
        content: message || "操作失败，请重试",
        duration: 5000,
        onClick: () => {
          // 可以提供重试选项
          console.log("用户点击了错误通知");
        },
      });
    }
  },

  // 权限提醒
  permissionReminder() {
    Notification.warning({
      title: "权限不足",
      content: "您没有执行此操作的权限，请联系管理员",
      duration: 0,
      closeBtnProps: true,
      onClick: () => {
        // 跳转到权限申请页面
        console.log("跳转到权限申请页面");
      },
    });
  },

  // 数据更新通知
  dataUpdateNotification(updateCount) {
    Notification.info({
      title: "数据更新",
      content: `检测到 ${updateCount} 条数据更新，点击刷新页面`,
      duration: 8000,
      onClick: () => {
        // 刷新页面数据
        window.location.reload();
      },
    });
  },
};

// ==================== 工具方法示例 ====================

/**
 * 批量操作提示
 */
export const batchOperationExample = {
  async batchDelete(selectedItems) {
    if (selectedItems.length === 0) {
      Message.warning("请选择要删除的项目");
      return;
    }

    // 确认提示
    Message.question({
      content: `确定要删除选中的 ${selectedItems.length} 个项目吗？`,
      duration: 0,
      closeBtnProps: true,
    });

    // 模拟批量删除操作
    const loading = Message.loading(
      `正在删除 ${selectedItems.length} 个项目...`
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Message.close(loading);

      // 成功通知
      Notification.success({
        title: "批量删除成功",
        content: `已成功删除 ${selectedItems.length} 个项目`,
        duration: 3000,
      });
    } catch (error) {
      Message.close(loading);

      // 错误通知
      Notification.error({
        title: "批量删除失败",
        content: "部分项目删除失败，请重试",
        duration: 5000,
      });
    }
  },
};

/**
 * 清理方法示例
 */
export const cleanupExamples = {
  // 清除所有消息
  clearAllMessages() {
    Message.clear();
  },

  // 清除所有通知
  clearAllNotifications() {
    Notification.clear();
  },

  // 清理过期记录
  cleanExpiredRecords() {
    Message.cleanExpired();
    Notification.cleanExpired();
  },
};

/**
 * Vue 组件中的使用示例
 */
export const vueComponentExample = `
<template>
  <div>
    <t-button @click="handleSave">保存</t-button>
    <t-button @click="handleDelete">删除</t-button>
  </div>
</template>

<script setup>
import { Message, Notification } from '@/utils/ui'

// 保存操作
const handleSave = async () => {
  const loading = Message.loading('正在保存...')
  
  try {
    // 调用 API
    await saveData()
    
    Message.close(loading)
    Message.success('保存成功')
    
    // 显示详细通知
    Notification.success({
      title: '数据保存成功',
      content: '您的更改已成功保存到服务器'
    })
  } catch (error) {
    Message.close(loading)
    Message.error('保存失败')
  }
}

// 删除操作
const handleDelete = () => {
  Message.question({
    content: '确定要删除这条记录吗？',
    duration: 0,
    closeBtnProps: true
  })
}
</script>
`;
