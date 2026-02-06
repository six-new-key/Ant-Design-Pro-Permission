<template>
  <a-card :bordered="false">
    <template #title>
      <a-form layout="inline">
        <a-form-item>
          <a-input
            v-model:value="searchForm.jobName"
            placeholder="任务名称"
            allow-clear
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.jobGroup"
            placeholder="任务分组"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="DEFAULT">默认</a-select-option>
            <a-select-option value="SYSTEM">系统</a-select-option>
            <a-select-option value="TEST">测试</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.status"
            placeholder="执行状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="0">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>

    <template #extra>
      <a-space>
        <a-button @click="handleBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回
        </a-button>
        <a-button danger @click="handleClean">
          <template #icon><DeleteOutlined /></template>
          清空日志
        </a-button>
      </a-space>
    </template>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1500 }"
      row-key="logId"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 执行状态 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </template>

        <!-- 执行耗时 -->
        <template v-else-if="column.key === 'duration'">
          {{ record.duration }}ms
        </template>

        <!-- 操作 -->
        <template v-else-if="column.key === 'action'">
          <a-button
            v-if="record.status === 0"
            type="link"
            size="small"
            @click="handleViewException(record)"
          >
            查看异常
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 异常信息弹窗 -->
    <a-modal
      v-model:open="exceptionVisible"
      title="异常信息"
      :width="800"
      :footer="null"
    >
      <a-textarea
        :value="exceptionInfo"
        :rows="15"
        readonly
        style="font-family: monospace"
      />
    </a-modal>
  </a-card>
</template>

<script setup>
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useJobLogTable } from './composables/useJobLogTable'
import { useJobLogOperations } from './composables/useJobLogOperations'

// 表格相关
const {
  loading,
  dataSource,
  pagination,
  searchForm,
  columns,
  loadData,
  handleSearch,
  handleReset,
  handleTableChange
} = useJobLogTable()

// 操作相关
const {
  exceptionVisible,
  exceptionInfo,
  handleBack,
  handleClean,
  handleViewException
} = useJobLogOperations(loadData)
</script>
