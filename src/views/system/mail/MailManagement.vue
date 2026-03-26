<template>
  <div class="mail-management">
    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 模板管理 -->
        <a-tab-pane key="template" tab="模板管理">
          <MailTemplate />
        </a-tab-pane>
        
        <!-- 发送记录 -->
        <a-tab-pane key="record" tab="发送记录">
          <MailRecord />
        </a-tab-pane>
        
        <!-- 发送邮件 -->
        <a-tab-pane key="send" tab="发送邮件">
          <MailSend />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MailTemplate from './components/MailTemplate.vue'
import MailRecord from './components/MailRecord.vue'
import MailSend from './components/MailSend.vue'

const activeTab = ref('template')
</script>

<style scoped lang="scss">
.mail-management {
  :deep(.ant-card-body) {
    padding: 0;
  }
  
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
    padding: 0 24px;
  }
  
  :deep(.ant-tabs-content) {
    padding: 24px;
  }
}
</style>
