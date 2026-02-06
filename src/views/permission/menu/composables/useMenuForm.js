import { ref, reactive, computed } from 'vue'
import { Message } from '@/utils'
import { addMenu, updateMenu, getMenuById, queryMenuList } from '@/api/menu'

/**
 * 菜单表单管理
 */
export function useMenuForm(fetchMenuList) {
  const menuDialogVisible = ref(false)
  const iconSelectorVisible = ref(false)
  const submitLoading = ref(false)
  const isEdit = ref(false)
  const isHeaderAdd = ref(false)
  const isChildAdd = ref(false)
  const parentMenuType = ref(null)
  const parentName = ref('')
  const menuFormRef = ref()
  const parentMenuOptions = ref([]) // 上级菜单选项

  const menuForm = reactive({
    id: null,
    parentId: 0,
    title: '',
    type: 0,
    name: '',
    path: '',
    component: '',
    icon: '',
    redirect: '',
    permission: '',
    apiPath: '',
    hidden: 0,
    sort: 0,
    linkType: 0,
    linkUrl: ''
  })

  // 父级菜单信息（用于智能控制）
  const parentMenuInfo = ref({
    type: null,
    path: ''
  })

  /**
   * 表单验证规则（computed）
   */
  const menuFormRules = computed(() => getMenuFormRules())

  /**
   * 获取表单验证规则
   */
  const getMenuFormRules = () => {
    const baseRules = {
      title: [
        { required: true, message: '菜单名称不能为空', trigger: 'blur' },
        { min: 1, max: 50, message: '菜单名称长度为1-50个字符', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '菜单类型不能为空', trigger: 'change' }
      ],
      icon: [
        { pattern: /^[A-Z][a-zA-Z]*(Outlined|Filled|TwoTone)$/, message: '图标名称格式：大写字母开头+Outlined/Filled/TwoTone结尾', trigger: 'blur' }
      ],
      sort: [
        { type: 'number', message: '排序必须是数字', trigger: 'blur' }
      ],
      linkUrl: [
        {
          validator: (rule, value) => {
            // 如果是外链或iframe，必须填写URL
            if ((menuForm.linkType === 1 || menuForm.linkType === 2) && !value) {
              return Promise.reject('外链地址不能为空')
            }
            // 如果填写了URL，验证格式
            if (value && !/^https?:\/\/.+/.test(value)) {
              return Promise.reject('外链地址必须以 http:// 或 https:// 开头')
            }
            return Promise.resolve()
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 路径验证规则：支持字母、数字、下划线、中划线、斜杠、通配符
    const pathPattern = /^[a-zA-Z0-9_\-/]+(\*\*)?$/
    
    // 权限标识验证规则：支持字母、数字、下划线、中划线，用冒号分隔
    const permissionPattern = /^[a-z]+:[a-z]+:[a-z]+$/
    
    // 自定义路径验证器：必须以 / 开头，且包含父路径
    const pathValidator = (rule, value) => {
      if (!value) {
        return Promise.reject('路由路径不能为空')
      }
      
      // 必须以 / 开头
      if (!value.startsWith('/')) {
        return Promise.reject('路由路径必须以 / 开头（绝对路径）')
      }
      
      // 如果有父级路径，子路径必须包含父路径
      const parentPath = parentMenuInfo.value.path
      if (parentPath && !value.startsWith(parentPath + '/') && value !== parentPath) {
        return Promise.reject(`子路径必须以父路径 ${parentPath}/ 开头`)
      }
      
      // 格式验证
      if (!pathPattern.test(value)) {
        return Promise.reject('路由路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符')
      }
      
      return Promise.resolve()
    }
    
    // 根据菜单类型动态添加规则
    if (menuForm.type === 0) {
      // 目录：需要路由名称、路由路径、重定向，组件路径固定为 LayoutManager
      return {
        ...baseRules,
        name: [
          { required: true, message: '路由名称不能为空', trigger: 'blur' },
          { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '路由名称必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
        ],
        path: [
          { required: true, validator: pathValidator, trigger: 'blur' }
        ],
        component: [
          { required: true, message: '组件路径不能为空', trigger: 'blur' },
          { pattern: /^LayoutManager$/, message: '目录的组件路径必须为 LayoutManager', trigger: 'blur' }
        ],
        redirect: [
          { pattern: pathPattern, message: '重定向路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
        ]
      }
    } else if (menuForm.type === 1) {
      // 菜单：根据链接类型动态添加规则
      if (menuForm.linkType === 0) {
        // 内部路由：需要路由名称、路由路径、组件路径
        return {
          ...baseRules,
          name: [
            { required: true, message: '路由名称不能为空', trigger: 'blur' },
            { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '路由名称必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
          ],
          path: [
            { required: true, validator: pathValidator, trigger: 'blur' }
          ],
          component: [
            { required: true, message: '组件路径不能为空', trigger: 'blur' },
            { pattern: pathPattern, message: '组件路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
          ]
        }
      } else if (menuForm.linkType === 1) {
        // 外链（新窗口）：只需要菜单名称、图标、排序
        return {
          ...baseRules
        }
      } else if (menuForm.linkType === 2) {
        // 内嵌iframe：需要路由名称、路由路径
        return {
          ...baseRules,
          name: [
            { required: true, message: '路由名称不能为空', trigger: 'blur' },
            { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '路由名称必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
          ],
          path: [
            { required: true, validator: pathValidator, trigger: 'blur' }
          ]
        }
      }
    } else if (menuForm.type === 2) {
      // 按钮：需要权限标识和接口路径
      return {
        ...baseRules,
        permission: [
          { required: true, message: '权限标识不能为空', trigger: 'blur' },
          { pattern: permissionPattern, message: '权限标识格式：模块:资源:操作（小写字母）', trigger: 'blur' }
        ],
        apiPath: [
          { required: true, message: '接口路径不能为空', trigger: 'blur' },
          { pattern: pathPattern, message: '接口路径格式错误，支持字母、数字、下划线、中划线、斜杠、通配符', trigger: 'blur' }
        ]
      }
    }
    
    return baseRules
  }

  /**
   * 根据父级类型判断子级可选类型
   */
  const getAllowedChildTypes = computed(() => {
    const parentType = parentMenuInfo.value.type
    
    if (parentType === null) {
      // 顶级菜单（主类目）：只能是目录
      return [0]
    } else if (parentType === 0) {
      // 父级是目录：子级可以是目录或菜单
      return [0, 1]
    } else if (parentType === 1) {
      // 父级是菜单：子级只能是按钮
      return [2]
    } else if (parentType === 2) {
      // 父级是按钮：不能有子节点
      return []
    }
    
    return []
  })

  /**
   * 判断某个类型是否可选
   */
  const isTypeAllowed = (type) => {
    return getAllowedChildTypes.value.includes(type)
  }

  /**
   * 自动生成路径（根据父级路径）
   */
  const generatePath = (inputValue) => {
    if (!inputValue) return ''
    
    const parentPath = parentMenuInfo.value.path || ''
    
    // 如果用户输入的是绝对路径，直接返回
    if (inputValue.startsWith('/')) {
      return inputValue
    }
    
    // 否则，拼接父级路径
    if (parentPath) {
      return `${parentPath}/${inputValue}`
    } else {
      return `/${inputValue}`
    }
  }

  /**
   * 自动生成组件路径（根据路由路径）
   */
  const generateComponent = (path) => {
    if (!path || !path.startsWith('/')) return ''
    
    // 移除开头的 /
    const cleanPath = path.substring(1)
    
    // 分割路径
    const parts = cleanPath.split('/')
    
    // 最后一部分首字母大写
    const lastPart = parts[parts.length - 1]
    const componentName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
    
    // 生成组件路径：/views/路径/组件名
    return `/views/${cleanPath}/${componentName}`
  }

  /**
   * 自动生成权限标识（根据路径和操作）
   */
  const generatePermission = (path, operation) => {
    if (!path || !path.startsWith('/')) return ''
    
    // 移除开头的 /
    const cleanPath = path.substring(1)
    
    // 分割路径，用冒号连接
    const parts = cleanPath.split('/')
    
    // 添加操作
    if (operation) {
      parts.push(operation)
    }
    
    return parts.join(':')
  }

  /**
   * 加载上级菜单选项（根据当前菜单类型过滤）
   */
  const loadParentMenuOptions = async () => {
    try {
      const response = await queryMenuList()
      if (response.code === 200) {
        const allMenus = response.data || []
        
        // 扁平化菜单列表（用于按钮类型）
        const flattenMenus = (menus, result = []) => {
          menus.forEach(menu => {
            result.push({
              ...menu,
              _type: menu.type,
              _path: menu.path
            })
            if (menu.children && menu.children.length > 0) {
              flattenMenus(menu.children, result)
            }
          })
          return result
        }
        
        // 根据当前菜单类型和编辑状态过滤上级菜单
        const filterMenus = (menus) => {
          return menus
            .filter(menu => {
              // 编辑时，排除当前节点及其子节点（避免循环引用）
              if (isEdit.value && Number(menu.id) === Number(menuForm.id)) return false
              
              // 根据当前菜单类型过滤可选的上级菜单
              if (isEdit.value) {
                // 编辑目录或菜单：上级只能是目录
                if (menuForm.type === 0 || menuForm.type === 1) {
                  return menu.type === 0
                }
                // 编辑按钮：上级只能是菜单
                else if (menuForm.type === 2) {
                  return menu.type === 1
                }
              } else {
                // 新增时：按钮不能作为父级
                return menu.type !== 2
              }
              
              return true
            })
            .map(menu => ({
              ...menu,
              // 保存完整信息，用于智能控制
              _type: menu.type,
              _path: menu.path,
              children: menu.children ? filterMenus(menu.children) : []
            }))
        }
        
        // 编辑按钮时，使用扁平化的菜单列表（只显示菜单类型）
        if (isEdit.value && menuForm.type === 2) {
          const flatMenus = flattenMenus(allMenus)
          parentMenuOptions.value = flatMenus
            .filter(menu => {
              // 只显示菜单类型
              if (menu.type !== 1) return false
              // 排除当前节点（类型转换）
              if (Number(menu.id) === Number(menuForm.id)) return false
              return true
            })
            .map(menu => ({
              id: Number(menu.id),  // 转换为数字类型
              title: menu.title,
              _type: menu.type,
              _path: menu.path
            }))
        } else {
          // 其他情况使用树形结构
          const filteredMenus = filterMenus(allMenus)
          
          parentMenuOptions.value = [
            {
              id: 0,
              title: '主类目',
              _type: null,
              _path: '',
              children: filteredMenus
            }
          ]
        }
      }
    } catch (error) {
      console.error('加载上级菜单失败:', error)
    }
  }

  /**
   * 监听上级菜单变化，更新父级信息
   */
  const handleParentChange = (value, option) => {
    if (value === 0) {
      // 选择了主类目
      parentMenuInfo.value = {
        type: null,
        path: ''
      }
    } else {
      // 编辑按钮时，parentMenuOptions 是扁平列表
      if (isEdit.value && menuForm.type === 2) {
        const selectedMenu = parentMenuOptions.value.find(menu => menu.id === value)
        if (selectedMenu) {
          parentMenuInfo.value = {
            type: selectedMenu._type,
            path: selectedMenu._path || ''
          }
        }
      } else {
        // 其他情况，parentMenuOptions 是树形结构
        const findMenu = (menus, id) => {
          for (const menu of menus) {
            if (menu.id === id) {
              return menu
            }
            if (menu.children) {
              const found = findMenu(menu.children, id)
              if (found) return found
            }
          }
          return null
        }
        
        const selectedMenu = findMenu(parentMenuOptions.value, value)
        if (selectedMenu) {
          parentMenuInfo.value = {
            type: selectedMenu._type,
            path: selectedMenu._path || ''
          }
          
          // 根据父级类型自动设置子级类型
          const allowedTypes = getAllowedChildTypes.value
          if (allowedTypes.length > 0 && !allowedTypes.includes(menuForm.type)) {
            menuForm.type = allowedTypes[0]
            handleTypeChange({ target: { value: allowedTypes[0] } })
          }
        }
      }
    }
  }

  /**
   * 路径输入框失焦时，自动补全为绝对路径
   */
  const handlePathBlur = () => {
    if (menuForm.path && !menuForm.path.startsWith('/')) {
      menuForm.path = generatePath(menuForm.path)
    }
  }

  /**
   * 自动生成组件路径按钮点击
   */
  const handleGenerateComponent = () => {
    if (menuForm.path) {
      menuForm.component = generateComponent(menuForm.path)
    } else {
      Message.warning('请先输入路由路径')
    }
  }

  /**
   * 自动生成权限标识按钮点击
   */
  const handleGeneratePermission = (operation = 'add') => {
    if (menuForm.path) {
      menuForm.permission = generatePermission(menuForm.path, operation)
    } else {
      // 如果没有路径，尝试从父级路径生成
      const parentPath = parentMenuInfo.value.path
      if (parentPath) {
        menuForm.permission = generatePermission(parentPath, operation)
      } else {
        Message.warning('请先输入路由路径或选择上级菜单')
      }
    }
  }

  /**
   * 新增顶级菜单（目录）
   */
  const handleAdd = async () => {
    isEdit.value = false
    isHeaderAdd.value = true
    isChildAdd.value = false
    parentMenuType.value = null
    resetMenuForm()
    
    // 加载上级菜单选项
    await loadParentMenuOptions()
    
    // 新增目录，parentId 设置为 0
    menuForm.type = 0
    menuForm.parentId = 0
    menuForm.component = 'LayoutManager' // 目录默认组件路径
    parentName.value = '主类目' // 显示友好的名称
    
    menuDialogVisible.value = true
  }

  /**
   * 新增下级菜单
   */
  const handleAddChild = async (row) => {
    isEdit.value = false
    isHeaderAdd.value = false
    isChildAdd.value = true
    resetMenuForm()
    
    // 加载上级菜单选项
    await loadParentMenuOptions()
    
    // 设置父级信息
    parentName.value = row.title
    parentMenuType.value = row.type
    menuForm.parentId = row.id  // ✅ 直接设置父菜单的 ID
    
    // 设置父级菜单信息（用于智能控制）
    parentMenuInfo.value = {
      type: row.type,
      path: row.path || ''
    }
    
    // 根据父级类型自动设置子级类型
    const allowedTypes = getAllowedChildTypes.value
    if (allowedTypes.length > 0) {
      menuForm.type = allowedTypes[0]
      if (menuForm.type === 0) {
        menuForm.component = 'LayoutManager'
      }
    }
    
    menuDialogVisible.value = true
  }

  /**
   * 编辑菜单
   */
  const handleEdit = async (row) => {
    isEdit.value = true
    isHeaderAdd.value = false
    isChildAdd.value = false
    parentMenuType.value = null
    
    const response = await getMenuById(row.id)
    if (response.code === 200) {
      Object.assign(menuForm, response.data)
      // 设置父级菜单名称
      parentName.value = response.data.parentName || '主类目'
      
      // 先加载上级菜单选项（需要知道当前菜单类型）
      await loadParentMenuOptions()
      
      // 设置父级菜单信息（用于智能控制）
      if (menuForm.parentId === 0) {
        parentMenuInfo.value = {
          type: null,
          path: ''
        }
      } else {
        // 编辑按钮时，parentMenuOptions 是扁平列表
        if (menuForm.type === 2) {
          const parentMenu = parentMenuOptions.value.find(menu => menu.id === menuForm.parentId)
          if (parentMenu) {
            parentMenuInfo.value = {
              type: parentMenu._type,
              path: parentMenu._path || ''
            }
          }
        } else {
          // 其他情况，parentMenuOptions 是树形结构
          const findMenu = (menus, id) => {
            for (const menu of menus) {
              if (menu.id === id) {
                return menu
              }
              if (menu.children) {
                const found = findMenu(menu.children, id)
                if (found) return found
              }
            }
            return null
          }
          
          const parentMenu = findMenu(parentMenuOptions.value, menuForm.parentId)
          if (parentMenu) {
            parentMenuInfo.value = {
              type: parentMenu._type,
              path: parentMenu._path || ''
            }
          }
        }
      }
      
      menuDialogVisible.value = true
    }
  }

  /**
   * 菜单类型变化
   */
  const handleTypeChange = (e) => {
    const value = e.target.value
    if (value === 2) {
      // 按钮：清空路由相关字段，保留权限标识和接口路径
      menuForm.name = ''
      menuForm.path = ''
      menuForm.component = ''
      menuForm.icon = ''
      menuForm.redirect = ''
      menuForm.hidden = 0
      menuForm.linkType = 0
      menuForm.linkUrl = ''
    } else if (value === 0) {
      // 目录：组件路径固定为 LayoutManager，清空权限相关字段
      menuForm.component = 'LayoutManager'
      menuForm.permission = ''
      menuForm.apiPath = ''
    } else if (value === 1) {
      // 菜单：清空权限相关字段和重定向，清空组件路径让用户输入
      menuForm.component = ''
      menuForm.permission = ''
      menuForm.apiPath = ''
      menuForm.redirect = ''
    }
  }

  /**
   * 链接类型变化
   */
  const handleLinkTypeChange = (e) => {
    const value = e.target.value
    if (value === 0) {
      // 内部路由：清空外链地址
      menuForm.linkUrl = ''
    } else if (value === 1 || value === 2) {
      // 外链或iframe：清空组件路径（后端会自动处理）
      if (menuForm.type === 1) {
        menuForm.component = ''
      }
    }
  }

  /**
   * 提交表单
   */
  const handleMenuSubmit = () => {
    menuFormRef.value.validate().then(async () => {
      submitLoading.value = true
      
      // 根据类型清理不需要的字段
      const submitData = { ...menuForm }
      
      // 清理前端特有字段（后端不需要）
      delete submitData.createTime
      delete submitData.updateTime
      delete submitData.parentName
      delete submitData.status  // 状态由单独的接口控制
      
      if (menuForm.type === 0) {
        // 目录：确保组件路径为 LayoutManager，清空权限相关字段和外链字段
        submitData.component = 'LayoutManager'
        submitData.permission = ''
        submitData.apiPath = ''
        submitData.linkType = 0
        submitData.linkUrl = ''
      } else if (menuForm.type === 1) {
        // 菜单：根据链接类型处理
        submitData.permission = ''
        submitData.apiPath = ''
        submitData.redirect = ''
        
        if (menuForm.linkType === 1) {
          // 外链（新窗口）：清空路由相关字段
          submitData.name = ''
          submitData.path = ''
          submitData.component = ''
        } else if (menuForm.linkType === 2) {
          // 内嵌iframe：清空组件路径（后端会自动设置）
          submitData.component = ''
        }
        // linkType === 0（内部路由）：保留所有字段
      } else if (menuForm.type === 2) {
        // 按钮：清空路由相关字段和外链字段
        submitData.name = ''
        submitData.path = ''
        submitData.component = ''
        submitData.icon = ''
        submitData.redirect = ''
        submitData.hidden = 0
        submitData.sort = 0
        submitData.linkType = 0
        submitData.linkUrl = ''
      }

      try {
        let response
        if (isEdit.value) {
          // 编辑：使用 PUT 方法
          response = await updateMenu(submitData)
        } else {
          // 新增：使用 POST 方法
          response = await addMenu(submitData)
        }

        if (response.code === 200) {
          Message.success(isEdit.value ? '更新成功' : '创建成功')
          menuDialogVisible.value = false
          fetchMenuList()
        }
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }).catch(() => {
      // validation failed
    })
  }

  /**
   * 重置表单
   */
  const resetMenuForm = () => {
    Object.assign(menuForm, {
      id: null,
      parentId: 0,
      title: '',
      type: 0,
      name: '',
      path: '',
      component: '',
      icon: '',
      redirect: '',
      permission: '',
      apiPath: '',
      hidden: 0,
      sort: 0,
      linkType: 0,
      linkUrl: ''
    })
    parentName.value = ''
    if (menuFormRef.value) {
      menuFormRef.value.clearValidate()
    }
  }

  return {
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
  }
}
