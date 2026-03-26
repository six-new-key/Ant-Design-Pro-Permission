/**
 * 字典类型常量
 * 
 * 统一管理系统中使用的字典类型
 * 使用常量而不是硬编码字符串，提高代码可维护性
 */

export const DICT_TYPES = {
  // 用户状态（启用/禁用）
  USER_STATUS: 'user_status',
  
  // 角色状态（启用/禁用）
  ROLE_STATUS: 'role_status',
  
  // 菜单状态（启用/禁用）
  MENU_STATUS: 'menu_status',
  
  // IP规则状态（启用/禁用）
  IP_RULE_STATUS: 'ip_rule_status',
  
  // 字典类型状态（启用/禁用）
  DICT_TYPE_STATUS: 'dict_type_status',
  
  // 字典数据状态（启用/禁用）
  DICT_DATA_STATUS: 'dict_data_status',
  
  // 性别（未知/男/女）
  GENDER: 'gender',
  
  // 菜单类型（目录/菜单/按钮）
  MENU_TYPE: 'menu_type',
  
  // 链接类型（无/外链/内嵌）
  LINK_TYPE: 'link_type',
  
  // 是否（是/否）
  YES_NO: 'yes_no',
  
  // 配置选择模式（单选/多选/标签）
  CONFIG_SELECT_MODE: 'config_select_mode',
  
  // 公告类型（系统通知/功能更新/维护公告/活动公告）
  ANNOUNCEMENT_TYPE: 'announcement_type',
  
  // 公告状态（草稿/已发布/已撤回）
  ANNOUNCEMENT_STATUS: 'announcement_status',
  
  // 公告级别（普通/重要/紧急）
  ANNOUNCEMENT_LEVEL: 'announcement_level',
  
  // 模板分类（默认/通知类/活动类/维护类/紧急类）
  TEMPLATE_CATEGORY: 'template_category',
  
  // 任务分组（默认/系统/测试）
  JOB_GROUP: 'job_group',
  
  // 任务状态（正常/禁用）
  JOB_STATUS: 'job_status',
  
  // 执行策略（立即执行/执行一次/放弃执行）
  JOB_MISFIRE_POLICY: 'job_misfire_policy',
  
  // 并发执行（允许/禁止）
  JOB_CONCURRENT: 'job_concurrent',
  
  // 任务日志状态（成功/失败）
  JOB_LOG_STATUS: 'job_log_status',
  
  // 登录状态（成功/失败）
  LOGIN_STATUS: 'login_status',
  
  // 操作状态（成功/失败）
  OPER_STATUS: 'oper_status',
  
  // 邮件模板分类（验证码/订单/通知/其他）
  MAIL_TEMPLATE_CATEGORY: 'mail_template_category',
  
  // 邮件模板类型（纯文本/HTML）
  MAIL_TEMPLATE_TYPE: 'mail_template_type',
  
  // 邮件模板允许重发（允许/不允许）
  MAIL_ALLOW_RESEND: 'mail_allow_resend',
  
  // 邮件服务提供商（QQ邮箱/阿里云/SendGrid/腾讯云）
  MAIL_PROVIDER: 'mail_provider',

  // 支付渠道（支付宝/微信支付）
  PAYMENT_CHANNEL: 'payment_channel'
}

/**
 * 字典类型描述映射
 * 用于调试和日志输出
 */
export const DICT_TYPE_LABELS = {
  [DICT_TYPES.USER_STATUS]: '用户状态',
  [DICT_TYPES.ROLE_STATUS]: '角色状态',
  [DICT_TYPES.MENU_STATUS]: '菜单状态',
  [DICT_TYPES.IP_RULE_STATUS]: 'IP规则状态',
  [DICT_TYPES.DICT_TYPE_STATUS]: '字典类型状态',
  [DICT_TYPES.DICT_DATA_STATUS]: '字典数据状态',
  [DICT_TYPES.GENDER]: '性别',
  [DICT_TYPES.MENU_TYPE]: '菜单类型',
  [DICT_TYPES.LINK_TYPE]: '链接类型',
  [DICT_TYPES.YES_NO]: '是否',
  [DICT_TYPES.CONFIG_SELECT_MODE]: '配置选择模式',
  [DICT_TYPES.ANNOUNCEMENT_TYPE]: '公告类型',
  [DICT_TYPES.ANNOUNCEMENT_STATUS]: '公告状态',
  [DICT_TYPES.ANNOUNCEMENT_LEVEL]: '公告级别',
  [DICT_TYPES.TEMPLATE_CATEGORY]: '模板分类',
  [DICT_TYPES.JOB_GROUP]: '任务分组',
  [DICT_TYPES.JOB_STATUS]: '任务状态',
  [DICT_TYPES.JOB_MISFIRE_POLICY]: '执行策略',
  [DICT_TYPES.JOB_CONCURRENT]: '并发执行',
  [DICT_TYPES.JOB_LOG_STATUS]: '任务日志状态',
  [DICT_TYPES.LOGIN_STATUS]: '登录状态',
  [DICT_TYPES.OPER_STATUS]: '操作状态',
  [DICT_TYPES.MAIL_TEMPLATE_CATEGORY]: '邮件模板分类',
  [DICT_TYPES.MAIL_TEMPLATE_TYPE]: '邮件模板类型',
  [DICT_TYPES.MAIL_ALLOW_RESEND]: '邮件模板允许重发',
  [DICT_TYPES.MAIL_PROVIDER]: '邮件服务提供商',
  [DICT_TYPES.PAYMENT_CHANNEL]: '支付渠道'
}
