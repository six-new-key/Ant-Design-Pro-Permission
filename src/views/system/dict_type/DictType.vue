<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="queryForm" class="search-form-compact">
          <a-form-item name="name">
            <a-input v-model:value="queryForm.name" placeholder="请输入字典名称" allow-clear style="width: 180px" @pressEnter="handleQuery" />
          </a-form-item>
          <a-form-item name="type">
            <a-input v-model:value="queryForm.type" placeholder="请输入字典类型" allow-clear style="width: 180px" @pressEnter="handleQuery" />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect 
              v-model:value="queryForm.status" 
              dict-type="dict_type_status" 
              placeholder="请选择状态" 
              allow-clear 
              value-type="number"
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item>
            <a-space :size="12">
              <a-button type="primary" @click="handleQuery">
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
      </a-card>
    </transition>

    <!-- 数据表格区域 -->
    <a-card :bordered="false">
      <template #title>
        <div class="table-header-actions">
          <a-space :size="12">
            <a-button type="primary" @click="handleAdd" v-permission.disable="'system:dict:add'">
              <template #icon><PlusOutlined /></template>
              新增
            </a-button>
            <a-button type="primary" danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete" v-permission.disable="'system:dict:remove'">
              <template #icon><DeleteOutlined /></template>
              删除 {{ selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : '' }}
            </a-button>
          </a-space>

          <a-space :size="12">
            <a-tooltip :title="searchVisible ? '隐藏搜索栏' : '显示搜索栏'">
              <a-button shape="circle" @click="toggleSearch">
                <template #icon>
                  <EyeInvisibleOutlined v-if="searchVisible" />
                  <EyeOutlined v-else />
                </template>
              </a-button>
            </a-tooltip>
            
            <a-dropdown placement="bottomRight">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-for="col in configurableColumns" :key="col.key">
                    <a-checkbox 
                      :checked="columnVisibility[col.key]" 
                      @change="() => toggleColumn(col.key)"
                    >
                      {{ col.title }}
                    </a-checkbox>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-tooltip title="列显示设置">
                <a-button shape="circle">
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-dropdown>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="visibleColumns"
        :data-source="dataSource"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a @click="handleShowData(record)">{{ record.type }}</a>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              checked-children="启用"
              un-checked-children="禁用"
              @change="() => handleStatusChange(record)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="8">
              <a-tooltip title="编辑">
                <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'system:dict:edit'">
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
              </a-tooltip>
              <a-popconfirm title="确认删除该字典类型吗？" @confirm="handleDelete(record.id)">
                <a-tooltip title="删除">
                  <a-button type="link" danger size="small" v-permission.disable="'system:dict:remove'">
                    <template #icon><DeleteOutlined /></template>
                    删除
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      width="600px"
      :footer="null"
      :closable="false"
      centered
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ modalTitle }}</span>
          <a-space :size="12">
            <a-button @click="handleModalCancel">取消</a-button>
            <a-button type="primary" :loading="modalLoading" @click="handleModalOk">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <a-divider />
      
      <div :style="cssVars">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="字典名称" name="name">
                <a-input v-model:value="formData.name" placeholder="请输入字典名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="字典类型" name="type">
                <a-input v-model:value="formData.type" placeholder="请输入字典类型" :disabled="isEdit" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="状态" name="status">
                <DictRadio 
                  v-model:value="formData.status" 
                  dict-type="dict_type_status" 
                  value-type="number"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="备注" name="remark">
                <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="4" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>

    <!-- 字典数据抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      title="字典数据"
      width="70%"
      @close="handleDrawerClose"
    >
      <DictData :dict-id="currentDictId" :dict-type="currentDictType" />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { theme, Modal } from 'ant-design-vue'
import { Message } from '@/utils'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import {
  getDictTypeList,
  getDictTypeById,
  addDictType,
  editDictType,
  deleteDictType,
  updateDictTypeStatus
} from '@/api/dict'
import DictData from '../dict_data/DictData.vue'

const { useToken } = theme
const { token } = useToken()

const cssVars = computed(() => {
  const t = token.value || {}
  return {
    '--color-text': t.colorText,
    '--color-primary': t.colorPrimary,
    '--color-border-secondary': t.colorBorderSecondary,
    '--border-radius': `${t.borderRadius}px`,
    '--color-fill-alter': t.colorFillAlter,
    '--font-size-lg': `${t.fontSizeLG}px`,
    '--color-bg-container': t.colorBgContainer,
    '--color-border': t.colorBorder
  }
})

// 查询表单
const queryForm = reactive({
  name: '',
  type: '',
  status: undefined
})

// 搜索栏显隐
const searchVisible = ref(true)
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value
}

// 表格列定义
const columns = [
  { title: '字典ID', dataIndex: 'id', key: 'id', width: 180, fixed: 'left' },
  { title: '字典名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '字典类型', dataIndex: 'type', key: 'type', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 列显隐控制
const columnVisibility = ref({
  id: true,
  name: true,
  type: true,
  status: true,
  remark: true,
  createTime: true
})

const toggleColumn = (key) => {
  columnVisibility.value[key] = !columnVisibility.value[key]
}

const visibleColumns = computed(() => {
  return columns.filter(col => {
    if (col.key === 'action') return true
    return columnVisibility.value[col.key] !== false
  })
})

const configurableColumns = computed(() => {
  return columns.filter(col => col.key !== 'action')
})

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
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  showLessItems: true
})

// 行选择
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('')
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  type: '',
  status: 1,
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 抽屉
const drawerVisible = ref(false)
const currentDictId = ref(null)
const currentDictType = ref('')

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = {
      name: queryForm.name || undefined,
      type: queryForm.type || undefined,
      status: queryForm.status,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await getDictTypeList(data)
    if (res.code === 200) {
      dataSource.value = res.data.data
      pagination.total = res.data.total
    }
  } catch (error) {
    Message.error('加载数据失败')
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
  queryForm.name = ''
  queryForm.type = ''
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
  modalTitle.value = '新增字典类型'
  formData.id = null
  formData.name = ''
  formData.type = ''
  formData.status = 1
  formData.remark = ''
  modalVisible.value = true
}

// 编辑
const handleEdit = async (record) => {
  isEdit.value = true
  modalTitle.value = '编辑字典类型'
  try {
    const res = await getDictTypeById(record.id)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      modalVisible.value = true
    }
  } catch (error) {
    Message.error('加载数据失败')
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    const res = await deleteDictType(id)
    if (res.code === 200) {
      Message.success('删除成功')
      loadData()
    }
  } catch (error) {
    Message.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的数据')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条字典类型吗？此操作不可撤销。`,
    okText: '确定删除',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      await handleDelete(selectedRowKeys.value.join(','))
      selectedRowKeys.value = []
    }
  })
}

// 状态切换
const handleStatusChange = async (record) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要${record.status === 1 ? '禁用' : '启用'}该字典类型吗？`,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async () => {
      try {
        const res = await updateDictTypeStatus(record.id)
        if (res.code === 200) {
          Message.success('状态修改成功')
          loadData()
        }
      } catch (error) {
        Message.error('状态修改失败')
      }
    }
  })
}

// 弹窗确定
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true
    const api = isEdit.value ? editDictType : addDictType
    const res = await api(formData)
    if (res.code === 200) {
      Message.success(isEdit.value ? '编辑成功' : '新增成功')
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
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 显示字典数据
const handleShowData = (record) => {
  currentDictId.value = record.id
  currentDictType.value = record.type
  drawerVisible.value = true
}

// 关闭抽屉
const handleDrawerClose = () => {
  currentDictId.value = null
  currentDictType.value = ''
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
/* 搜索栏过渡动画 */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.search-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.search-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.search-card {
  margin-bottom: 16px;
  overflow: hidden;
}

.search-form-compact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  
  :deep(.ant-form-item) {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
