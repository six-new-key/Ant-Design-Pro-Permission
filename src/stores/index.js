import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
const pinia = createPinia()

// 使用持久化插件
pinia.use(
  createPersistedState({
    // 全局配置
    storage: localStorage, // 默认使用 localStorage
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
