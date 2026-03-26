<template>
  <div :style="cssVars">
    <!-- 搜索和操作区域 -->
    <transition name="search-slide">
      <a-card :bordered="false" class="search-card" v-show="searchVisible">
        <a-form layout="inline" :model="searchForm" class="search-form-compact">
          <a-form-item name="title">
            <a-input v-model:value="searchForm.title" placeholder="请输入菜单名称" allow-clear style="width: 180px" @pressEnter="handleSearch" />
          </a-form-item>
          <a-form-item name="type">
            <DictSelect 
              v-model:value="searchForm.type" 
              dict-type="menu_type" 
              placeholder="请选择菜单类型" 
              allow-clear 
              value-type="number"
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item name="status">
            <DictSelect 
              v-model:value="searchForm.status" 
              dict-type="menu_status" 
              placeholder="请选择状态" 
              allow-clear 
              style="width: 180px"
            />
          </a-form-item>
          <a-form-item>
            <a-space :size="12">
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
      </a-card>
    </transition>

    <!-- 数据表格区域 -->
    <a-card :bordered="false" class="table-card">
      <template #title>
        <div class="table-header-actions">
          <a-space :size="12">
            <a-button type="primary" @click="handleAdd" v-permission.disable="'permission:menu:add'">
              <template #icon>
                <PlusOutlined />
              </template>
              新增
            </a-button>
            <a-button @click="handleExpandAll">
              <template #icon>
                <component :is="isExpandAll ? 'MenuFoldOutlined' : 'MenuUnfoldOutlined'" />
              </template>
              {{ isExpandAll ? '收起' : '展开' }}
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
            
            <a-popover trigger="click" placement="bottomRight">
              <template #content>
                <div style="display: flex; flex-direction: column; gap: 8px; min-width: 120px;">
                  <a-checkbox 
                    v-for="col in configurableColumns" 
                    :key="col.key"
                    :checked="columnVisibility[col.key]" 
                    @change="() => toggleColumn(col.key)"
                  >
                    {{ col.title }}
                  </a-checkbox>
                </div>
              </template>
              <a-tooltip title="列显示设置">
                <a-button shape="circle">
                  <template #icon>
                    <SettingOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-popover>
          </a-space>
        </div>
      </template>

      <a-table
        :dataSource="tableData"
        :columns="visibleColumns"
        :loading="loading"
        row-key="id"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        :expandedRowKeys="expandedRowKeys"
        @expand="onExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'linkType'">
            <a-tag v-if="record.type === 1" :color="getLinkTypeColor(record.linkType)">
              {{ getLinkTypeLabel(record.linkType) }}
            </a-tag>
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'linkUrl'">
            <span v-if="record.linkUrl">{{ record.linkUrl }}</span>
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'icon'">
             <component v-if="record.icon && isAntDesignIcon(record.icon)" :is="record.icon" />
             <span v-else-if="record.icon">{{ record.icon }}</span>
             <span v-else>-</span>
          </template>

          <template v-if="column.key === 'status'">
            <a-switch 
              :checked="record.status === 1" 
              checked-children="启用" 
              un-checked-children="禁用"
              @change="() => handleToggleStatus(record)"
            />
          </template>

          <template v-if="column.key === 'operation'">
            <a-space :size="8">
              <a-tooltip v-if="record.type !== 2" title="新增子菜单">
                <a-button
                  type="link"
                  size="small"
                  @click="handleAddChild(record)"
                  v-permission.disable="'permission:menu:add'"
                >
                  <template #icon><PlusOutlined /></template>
                  新增
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑菜单">
                <a-button type="link" size="small" @click="handleEdit(record)" v-permission.disable="'permission:menu:edit'">
                  <template #icon><EditOutlined /></template>
                  编辑
                </a-button>
              </a-tooltip>
              
              <a-popconfirm title="确认删除该菜单吗？" @confirm="handleDelete(record)">
                <a-tooltip title="删除菜单">
                  <a-button type="link" danger size="small" v-permission.disable="'permission:menu:remove'">
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

    <!-- 新增/编辑菜单抽屉 -->
    <a-drawer
      v-model:open="menuDialogVisible"
      width="600px"
      :closable="false"
      placement="right"
    >
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 18px; font-weight: 600;">{{ isEdit ? '编辑菜单' : '新增菜单' }}</span>
          <a-space :size="12">
            <a-button @click="menuDialogVisible = false">取消</a-button>
            <a-button type="primary" :loading="submitLoading" @click="handleMenuSubmit">确定</a-button>
          </a-space>
        </div>
      </template>
      
      <div :style="cssVars">
        <a-form 
          ref="menuFormRef" 
          :model="menuForm" 
          :rules="menuFormRules" 
          layout="vertical"
          class="menu-form"
        >
          <!-- 上级菜单 -->
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="上级菜单" name="parentId">
                <!-- 编辑按钮时使用普通下拉选择器 -->
                <a-select
                  v-if="isEdit && menuForm.type === 2"
                  v-model:value="menuForm.parentId"
                  placeholder="请选择上级菜单"
                  :options="parentMenuOptions"
                  :field-names="{ label: 'title', value: 'id' }"
                  @change="handleParentChange"
                />
                
                <!-- 其他情况使用树形选择器 -->
                <a-tree-select
                  v-else
                  v-model:value="menuForm.parentId"
                  :tree-data="parentMenuOptions"
                  placeholder="请选择上级菜单"
                  tree-default-expand-all
                  :field-names="{ label: 'title', value: 'id', children: 'children' }"
                  @change="handleParentChange"
                >
                  <template #title="{ title }">
                    {{ title }}
                  </template>
                  <template #notFoundContent>
                    <a-empty :image="simpleImage" description="暂无数据" />
                  </template>
                  <template #suffixIcon>
                    <FolderOpenOutlined />
                  </template>
                </a-tree-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单类型 -->
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item name="type">
                <template #label>
                  <span>菜单类型</span>
                  <a-tooltip title="目录：用于组织菜单结构；菜单：实际页面；按钮：页面内操作权限">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <DictRadio 
                  v-model:value="menuForm.type" 
                  dict-type="menu_type" 
                  value-type="number"
                  :disabled="isEdit"
                  @change="handleTypeChange"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 链接类型（仅菜单类型显示） -->
          <a-row v-if="menuForm.type === 1" :gutter="24">
            <a-col :span="24">
              <a-form-item name="linkType">
                <template #label>
                  <span>链接类型</span>
                  <a-tooltip title="内部路由：Vue组件页面；外链：新窗口打开；内嵌iframe：在系统内嵌入外部页面">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <DictRadio 
                  v-model:value="menuForm.linkType" 
                  dict-type="link_type" 
                  value-type="number"
                  @change="handleLinkTypeChange"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 外链地址（仅外链和iframe显示） -->
          <a-row v-if="menuForm.type === 1 && (menuForm.linkType === 1 || menuForm.linkType === 2)" :gutter="24">
            <a-col :span="24">
              <a-form-item name="linkUrl">
                <template #label>
                  <span>外链地址</span>
                  <a-tooltip title="必须以 http:// 或 https:// 开头">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.linkUrl" 
                  placeholder="如：https://www.example.com"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单图标 + 显示排序（目录和菜单） -->
          <a-row v-if="menuForm.type !== 2" :gutter="24">
            <a-col :span="12">
              <a-form-item label="菜单图标" name="icon">
                <a-input 
                  v-model:value="menuForm.icon" 
                  placeholder="点击选择"
                  readonly
                  @click="iconSelectorVisible = true"
                  style="cursor: pointer"
                >
                  <template #prefix>
                    <component v-if="menuForm.icon && isAntDesignIcon(menuForm.icon)" :is="menuForm.icon" />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="sort">
                <template #label>
                  <span>显示排序</span>
                  <a-tooltip title="数字越小越靠前">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input-number 
                  v-model:value="menuForm.sort" 
                  :min="0" 
                  placeholder="排序"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单名称（外链 linkType=1：只显示菜单名称） -->
          <a-row v-if="menuForm.type === 1 && menuForm.linkType === 1" :gutter="24">
            <a-col :span="24">
              <a-form-item label="菜单名称" name="title">
                <a-input 
                  v-model:value="menuForm.title" 
                  placeholder="请输入菜单名称"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单名称 + 路由名称（内嵌iframe linkType=2） -->
          <a-row v-if="menuForm.type === 1 && menuForm.linkType === 2" :gutter="24">
            <a-col :span="12">
              <a-form-item label="菜单名称" name="title">
                <a-input 
                  v-model:value="menuForm.title" 
                  placeholder="请输入菜单名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="name">
                <template #label>
                  <span>路由名称</span>
                  <a-tooltip title="iframe需要路由名称">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.name" 
                  placeholder="如：ExternalDoc"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单名称 + 路由名称（目录和内部路由菜单 linkType=0） -->
          <a-row v-if="menuForm.type === 0 || (menuForm.type === 1 && menuForm.linkType === 0)" :gutter="24">
            <a-col :span="12">
              <a-form-item label="菜单名称" name="title">
                <a-input 
                  v-model:value="menuForm.title" 
                  placeholder="请输入菜单名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="name">
                <template #label>
                  <span>路由名称</span>
                  <a-tooltip title="必须以大写字母开头，如：User">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.name" 
                  placeholder="如：User"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 菜单名称（按钮） -->
          <a-row v-if="menuForm.type === 2" :gutter="24">
            <a-col :span="12">
              <a-form-item label="菜单名称" name="title">
                <a-input 
                  v-model:value="menuForm.title" 
                  placeholder="请输入菜单名称"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 路由路径（内嵌iframe linkType=2：显示路由路径，不显示组件路径） -->
          <a-row v-if="menuForm.type === 1 && menuForm.linkType === 2" :gutter="24">
            <a-col :span="12">
              <a-form-item name="path">
                <template #label>
                  <span>路由路径</span>
                  <a-tooltip title="必须是绝对路径，以 / 开头，如：/system/user">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.path" 
                  placeholder="如：/system/user（绝对路径）"
                  @blur="handlePathBlur"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 路由路径 + 组件路径（内部路由菜单 linkType=0） -->
          <a-row v-if="menuForm.type === 1 && menuForm.linkType === 0" :gutter="24">
            <a-col :span="12">
              <a-form-item name="path">
                <template #label>
                  <span>路由路径</span>
                  <a-tooltip title="必须是绝对路径，以 / 开头，如：/system/user">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.path" 
                  placeholder="如：/system/user（绝对路径）"
                  @blur="handlePathBlur"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="component">
                <template #label>
                  <span>组件路径</span>
                  <a-tooltip title="Vue组件路径，如：/views/system/user/User">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.component" 
                  placeholder="如：/views/system/user/User"
                >
                  <template #suffix>
                    <a-tooltip title="根据路由路径自动生成">
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="handleGenerateComponent"
                        style="padding: 0; height: auto;"
                      >
                        生成
                      </a-button>
                    </a-tooltip>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 路由路径 + 组件路径（目录） -->
          <a-row v-if="menuForm.type === 0" :gutter="24">
            <a-col :span="12">
              <a-form-item name="path">
                <template #label>
                  <span>路由路径</span>
                  <a-tooltip title="必须是绝对路径，以 / 开头，如：/system">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.path" 
                  placeholder="如：/system（绝对路径）"
                  @blur="handlePathBlur"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="component">
                <template #label>
                  <span>组件路径</span>
                  <a-tooltip title="目录固定为 LayoutManager">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.component" 
                  placeholder="LayoutManager" 
                  disabled
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 重定向 + 是否隐藏（目录） -->
          <a-row v-if="menuForm.type === 0" :gutter="24">
            <a-col :span="12">
              <a-form-item name="redirect">
                <template #label>
                  <span>重定向</span>
                  <a-tooltip title="目录的默认跳转路径">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.redirect" 
                  placeholder="如：permission/user"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="hidden">
                <template #label>
                  <span>是否隐藏</span>
                  <a-tooltip title="隐藏后不在菜单中显示">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <DictRadio 
                  v-model:value="menuForm.hidden" 
                  dict-type="yes_no" 
                  value-type="number"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 是否隐藏（菜单） -->
          <a-row v-if="menuForm.type === 1" :gutter="24">
            <a-col :span="12">
              <a-form-item name="hidden">
                <template #label>
                  <span>是否隐藏</span>
                  <a-tooltip title="隐藏后不在菜单中显示">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <DictRadio 
                  v-model:value="menuForm.hidden" 
                  dict-type="yes_no" 
                  value-type="number"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 权限标识 + 接口路径（按钮） -->
          <a-row v-if="menuForm.type === 2" :gutter="24">
            <a-col :span="12">
              <a-form-item name="permission">
                <template #label>
                  <span>权限标识</span>
                  <a-tooltip title="格式：模块:资源:操作">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.permission" 
                  placeholder="如：system:user:add"
                >
                  <template #suffix>
                    <a-popover trigger="click" placement="bottom">
                      <template #content>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                          <a-button type="text" size="small" @click="handleGeneratePermission('add')">新增</a-button>
                          <a-button type="text" size="small" @click="handleGeneratePermission('edit')">编辑</a-button>
                          <a-button type="text" size="small" @click="handleGeneratePermission('delete')">删除</a-button>
                          <a-button type="text" size="small" @click="handleGeneratePermission('query')">查询</a-button>
                          <a-button type="text" size="small" @click="handleGeneratePermission('export')">导出</a-button>
                          <a-button type="text" size="small" @click="handleGeneratePermission('import')">导入</a-button>
                        </div>
                      </template>
                      <a-tooltip title="根据父级路径自动生成">
                        <a-button 
                          type="link" 
                          size="small" 
                          style="padding: 0; height: auto;"
                        >
                          生成
                        </a-button>
                      </a-tooltip>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="apiPath">
                <template #label>
                  <span>接口路径</span>
                  <a-tooltip title="支持通配符，如：user/add">
                    <QuestionCircleOutlined style="margin-left: 4px; color: rgba(0, 0, 0, 0.45);" />
                  </a-tooltip>
                </template>
                <a-input 
                  v-model:value="menuForm.apiPath" 
                  placeholder="如：user/add"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-drawer>

    <!-- 图标选择器 -->
    <IconSelector 
      v-model:visible="iconSelectorVisible"
      v-model:value="menuForm.icon"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  FolderOpenOutlined
} from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import IconSelector from '@/components/custom/IconSelector.vue'

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

// Composables
import { useMenuTable } from './composables/useMenuTable'
import { useMenuSearch } from './composables/useMenuSearch'
import { useMenuForm } from './composables/useMenuForm'
import { useMenuOperations } from './composables/useMenuOperations'
import { useTableSettings } from './composables/useTableSettings'

const { useToken } = theme
const { token } = useToken()

/**
 * CSS 变量（用于 Modal 样式穿透）
 */
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

// ==================== 组合各个功能模块 ====================

// 搜索功能（先创建，获取 reactive searchForm）
const {
  searchForm,
  handleSearch,
  handleReset
} = useMenuSearch(null) // 先传 null，后面通过闭包访问

// 表格功能（传入 searchForm）
const {
  loading,
  tableData,
  expandedRowKeys,
  isExpandAll,
  columns,
  fetchMenuList,
  onExpand,
  handleExpandAll
} = useMenuTable(searchForm)

// 更新 useMenuSearch 中的依赖
handleSearch.fetchMenuList = fetchMenuList
handleReset.fetchMenuList = fetchMenuList

// 表格设置（搜索栏显隐、列显隐）
const {
  searchVisible,
  columnVisibility,
  toggleSearch,
  toggleColumn,
  getVisibleColumns,
  getConfigurableColumns
} = useTableSettings(columns)

// 获取可见的列
const visibleColumns = computed(() => getVisibleColumns())
const configurableColumns = computed(() => getConfigurableColumns())

// 表单功能
const {
  menuDialogVisible,
  iconSelectorVisible,
  submitLoading,
  isEdit,
  isHeaderAdd,
  isChildAdd,
  parentMenuType,
  parentName,
  menuFormRef,
  menuForm,
  menuFormRules,
  parentMenuOptions,
  parentMenuInfo,
  getAllowedChildTypes,
  isTypeAllowed,
  generatePath,
  generateComponent,
  generatePermission,
  handleParentChange,
  handlePathBlur,
  handleGenerateComponent,
  handleGeneratePermission,
  handleAdd,
  handleAddChild,
  handleEdit,
  handleTypeChange,
  handleLinkTypeChange,
  handleMenuSubmit
} = useMenuForm(fetchMenuList)

// 菜单操作
const {
  handleDelete,
  handleToggleStatus,
  getTypeColor,
  getTypeLabel,
  getLinkTypeColor,
  getLinkTypeLabel,
  isAntDesignIcon
} = useMenuOperations(fetchMenuList)

// ==================== 初始化 ====================
onMounted(() => {
  fetchMenuList()
})
</script>

<style lang="scss" scoped>
@import './styles/menu.scss';
</style>
