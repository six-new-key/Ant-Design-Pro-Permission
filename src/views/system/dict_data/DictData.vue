<template>
  <div class="dict-data-container">
    <!-- 查询表单 -->
    <a-form layout="inline" :model="queryForm" style="margin-bottom: 16px">
      <a-form-item label="字典标签">
        <a-input v-model:value="queryForm.label" placeholder="请输入字典标签" allow-clear style="width: 200px" />
      </a-form-item>
      <a-form-item label="状态">
        <a-select v-model:value="queryForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleQuery">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <!-- 操作按钮 -->
    <div style="margin-bottom: 16px">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增
        </a-button>
        <a-button danger :disabled="!hasSelected" @click="handleBatchDelete">
          <template #icon><DeleteOutlined /></template>
          删除
        </a-button>
      </a-space>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :row-selection="rowSelection"
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-switch
            :checked="record.status === 1"
            checked-children="启用"
            un-checked-children="禁用"
            @change="handleStatusChange(record)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除吗？" @confirm="handleDelete(record.id)">
              <a style="color: #ff4d4f">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="字典标签" name="label">
          <a-input v-model:value="formData.label" placeholder="请输入字典标签" />
        </a-form-item>
        <a-form-item label="字典键值" name="value">
          <a-input v-model:value="formData.value" placeholder="请输入字典键值" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import message from '@/utils/message'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import {
  getDictDataList,
  getDictDataById,
  addDictData,
  editDictData,
  deleteDictData,
  updateDictDataStatus
} from '@/api/dict'

const props = defineProps({
  dictId: {
    type: Number,
    required: true
  },
  dictType: {
    type: String,
    required: true
  }
})

// 查询表单
const queryForm = reactive({
  label: '',
  status: undefined
})

// 表格列定义
const columns = [
  { title: '字典数据ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '字典标签', dataIndex: 'label', key: 'label' },
  { title: '字典键值', dataIndex: 'value', key: 'value' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 表格数据
const dataSource = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

const hasSelected = computed(() => selectedRowKeys.value.length > 0)

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('')
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  dictId: props.dictId,
  label: '',
  value: '',
  sort: 0,
  status: 1,
  remark: ''
})

const formRules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      dictId: props.dictId,
      label: queryForm.label || undefined,
      status: queryForm.status
    }
    const res = await getDictDataList(pagination.current, pagination.pageSize, params)
    if (res.code === 200) {
      dataSource.value = res.data.records
      pagination.total = res.data.total
    }
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryForm.label = ''
  queryForm.status = undefined
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '新增字典数据'
  formData.id = null
  formData.dictId = props.dictId
  formData.label = ''
  formData.value = ''
  formData.sort = 0
  formData.status = 1
  formData.remark = ''
  modalVisible.value = true
}

// 编辑
const handleEdit = async (record) => {
  isEdit.value = true
  modalTitle.value = '编辑字典数据'
  try {
    const res = await getDictDataById(record.id)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      modalVisible.value = true
    }
  } catch (error) {
    message.error('加载数据失败')
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    const res = await deleteDictData(id)
    if (res.code === 200) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据')
    return
  }
  handleDelete(selectedRowKeys.value.join(','))
  selectedRowKeys.value = []
}

// 状态切换
const handleStatusChange = async (record) => {
  try {
    const res = await updateDictDataStatus(record.id)
    if (res.code === 200) {
      message.success('状态修改成功')
      loadData()
    }
  } catch (error) {
    message.error('状态修改失败')
  }
}

// 弹窗确定
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true
    const api = isEdit.value ? editDictData : addDictData
    const res = await api(formData)
    if (res.code === 200) {
      message.success(isEdit.value ? '编辑成功' : '新增成功')
      modalVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error(error)
  } finally {
    modalLoading.value = false
  }
}

// 弹窗取消
const handleModalCancel = () => {
  formRef.value?.resetFields()
}

// 监听 dictId 变化
watch(() => props.dictId, (newVal) => {
  if (newVal) {
    loadData()
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dict-data-container {
  // 样式
}
</style>
