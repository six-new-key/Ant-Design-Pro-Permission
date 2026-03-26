<template>
  <div class="order-management">
    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="order" tab="订单列表">
          <OrderList />
        </a-tab-pane>
        <a-tab-pane key="refund" tab="退款记录">
          <RefundList />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OrderList from './components/OrderList.vue'
import RefundList from './components/RefundList.vue'

const activeTab = ref('order')
</script>

<style scoped lang="scss">
.order-management {
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
