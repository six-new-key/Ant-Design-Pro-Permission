<template>
  <div :style="cssVars">
    <!-- 搜索区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="queryForm" class="search-form-compact">
          <a-form-item name="name">
            <a-input
              v-model:value="queryForm.name"
              placeholder="请输入套餐名称"
              allow-clear
              style="width: 180px"
              @pressEnter="handleQuery"
            />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect
              v-model:value="queryForm.status"
              dict-type="yes_no"
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
            <a-button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增
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
          </a-space>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'oldPrice'">
            <span style="color: #f5222d">¥{{ record.oldPrice }}</span>
          </template>
          <template v-if="column.key === 'price'">
            <span style="color: #f5222d">¥{{ record.price }}</span>
          </template>

          <template v-if="column.key === 'durationDays'">
            <a-tag color="blue">{{ record.durationDays }}天</a-tag>
          </template>

          <template v-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              @change="(checked) => handleStatusChange(record, checked)"
              checked-children="启用"
              un-checked-children="禁用"
            />
          </template>

          <template v-if="column.key === 'recommend'">
            <a-switch
              :checked="record.recommend === 1"
              @change="(checked) => handleRecommendChange(record, checked)"
              checked-children="推荐"
              un-checked-children="默认"
            />
          </template>

          <template v-if="column.key === 'action'">
            <a-space :size="8">
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确认删除该套餐吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitLoading"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="套餐名称" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="请输入套餐名称"
          />
        </a-form-item>

        <a-form-item label="原价" name="oldPrice">
          <a-input-number
            v-model:value="formState.oldPrice"
            :min="0"
            :precision="2"
            placeholder="请输入原价"
            style="width: 100%"
            addon-before="¥"
          />
        </a-form-item>

        <a-form-item label="价格" name="price">
          <a-input-number
            v-model:value="formState.price"
            :min="0"
            :precision="2"
            placeholder="请输入价格"
            style="width: 100%"
            addon-before="¥"
          />
        </a-form-item>

        <a-form-item label="有效期" name="durationDays">
          <a-input-number
            v-model:value="formState.durationDays"
            :min="1"
            placeholder="请输入有效期天数"
            style="width: 100%"
            addon-after="天"
          />
        </a-form-item>

        <a-form-item
          label="功能列表"
          :help="'请输入功能列表，用中文分号「；」分隔，例如：每日免费次数；专属客服；优先审核'"
        >
          <a-input
            v-model:value="formState.functionList"
            placeholder="每日免费次数；专属客服；优先审核"
          />
        </a-form-item>

        <a-form-item label="每日费用">
          <a-input
            v-model:value="formState.dailyFee"
            placeholder="每日花费费用"
          />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="是否推荐" name="recommend">
          <a-radio-group v-model:value="formState.recommend">
            <a-radio :value="1">推荐</a-radio>
            <a-radio :value="0">默认</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { theme, message } from "ant-design-vue";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons-vue";
import DictSelect from "@/components/custom/DictSelect.vue";
import {
  getMemberPackagePage,
  addMemberPackage,
  updateMemberPackage,
  deleteMemberPackage,
} from "@/api/member-package";

const { token } = theme.useToken();

// CSS 变量映射
const cssVars = computed(() => {
  const t = token.value || {};
  return {
    "--color-text": t.colorText,
    "--color-primary": t.colorPrimary,
    "--color-border": t.colorBorder,
    "--color-bg-container": t.colorBgContainer,
  };
});

// 搜索相关
const searchVisible = ref(true);
const queryForm = reactive({
  name: "",
  status: null,
});

const toggleSearch = () => {
  searchVisible.value = !searchVisible.value;
};

// 表格相关
const loading = ref(false);
const dataSource = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

const columns = [
  { title: "套餐名称", dataIndex: "name", key: "name", width: 200 },
  { title: "原价", dataIndex: "oldPrice", key: "oldPrice", width: 120 },
  { title: "价格", dataIndex: "price", key: "price", width: 120 },
  {
    title: "有效期",
    dataIndex: "durationDays",
    key: "durationDays",
    width: 120,
  },
  { title: "每日费用", dataIndex: "dailyFee", key: "dailyFee", width: 150 },
  {
    title: "功能列表",
    dataIndex: "functionList",
    key: "functionList",
    ellipsis: true,
  },
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  { title: "推荐", dataIndex: "recommend", key: "recommend", width: 100 },
  { title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
  { title: "操作", key: "action", fixed: "right", width: 180 },
];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getMemberPackagePage({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...queryForm,
    });
    if (res.code === 200) {
      dataSource.value = res.data.data || [];
      pagination.total = res.data.total || 0;
    }
  } catch (error) {
    console.error("加载数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

const handleQuery = () => {
  pagination.current = 1;
  loadData();
};

const handleReset = () => {
  queryForm.name = "";
  queryForm.status = null;
  handleQuery();
};

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref("新增会员套餐");
const submitLoading = ref(false);
const formRef = ref();
const formState = reactive({
  id: null,
  name: "",
  oldPrice: null,
  price: null,
  durationDays: null,
  functionList: "",
  dailyFee: "",
  status: 1,
  recommend: 0,
});

const formRules = {
  name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
  price: [{ required: true, message: "请输入价格", trigger: "blur" }],
  durationDays: [{ required: true, message: "请输入有效期", trigger: "blur" }],
};

const handleAdd = () => {
  modalTitle.value = "新增会员套餐";
  Object.assign(formState, {
    id: null,
    name: "",
    price: null,
    durationDays: null,
    description: "",
    status: 1,
  });
  modalVisible.value = true;
};

const handleEdit = (record) => {
  modalTitle.value = "编辑会员套餐";
  Object.assign(formState, record);
  modalVisible.value = true;
};

const handleCancel = () => {
  modalVisible.value = false;
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  await formRef.value?.validate();

  submitLoading.value = true;
  try {
    const api = formState.id ? updateMemberPackage : addMemberPackage;
    const res = await api(formState);
    if (res.code === 200) {
      message.success(formState.id ? "更新成功" : "新增成功");
      modalVisible.value = false;
      loadData();
    }
  } catch (error) {
    console.error("操作失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = async (record) => {
  try {
    const res = await deleteMemberPackage(record.id);
    if (res.code === 200) {
      message.success("删除成功");
      loadData();
    }
  } catch (error) {
    console.error("删除失败:", error);
  }
};

const handleStatusChange = async (record, checked) => {
  const res = await updateMemberPackage({
    ...record,
    status: checked ? 1 : 0,
  });
  if (res.code === 200) {
    message.success("状态更新成功");
    loadData();
  }
};

const handleRecommendChange = async (record, checked) => {
  const res = await updateMemberPackage({
    ...record,
    recommend: checked ? 1 : 0,
  });
  if (res.code === 200) {
    message.success("推荐更新成功");
    loadData();
  }
};

// 初始化加载
loadData();
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 16px;
}

.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form-compact {
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }
}
</style>
