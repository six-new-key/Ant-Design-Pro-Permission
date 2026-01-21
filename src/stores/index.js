import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
const pinia = createPinia()

// 使用持久化插件
pinia.use(
  createPersistedState({
    // 全局配置
    storage: localStorage, // 默认使用 localStorage
    auto: false, // 关键：禁用自动持久化，只持久化明确配置的字段
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },
    // 可以设置全局的 key 前缀
    key: id => `__persisted__${id}`
  })
)

export default pinia

// 导出 stores
export { useAppStore } from './modules/app'
export { useThemeStore } from './modules/theme'
export { useTabsStore } from './modules/tabsStore'
export { useLoginStore } from './modules/login'
export { useUserStore } from './modules/user'
