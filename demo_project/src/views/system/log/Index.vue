<template>
  <div>日志管理</div>
  <t-button type="primary" @click="handleMsg">测试msg</t-button>
    <t-button type="primary" @click="handleNotification">测试notification</t-button>
</template>


<script setup>
import { Message, Notification } from '@/utils/ui'
import { ref } from 'vue'

const msg = ref('')
const notification = ref('')

const handleMsg = () => {
  Message.success({
    content: '表单提交成功',
    duration: 2000
  })
}

const handleNotification = () => {
  Notification.success({
    title: '成功',
    content: notification.value
  })
}

</script>
