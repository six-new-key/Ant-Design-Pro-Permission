import vitePluginsAutoI18n, { YoudaoTranslator } from 'vite-auto-i18n-plugin'
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
//引入path路径，用于路径别名
import path from "path";
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueDevTools from 'vite-plugin-vue-devtools'

// 导出 Vite 配置
export default defineConfig(({ command, mode }) => {
  //加载各环境下的配置
  let env = loadEnv(mode, process.cwd());
  return {
    base: "./", // 开发或生产环境服务的公共基础路径
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // 路径别名
      },
    },
    server: {
      host: true, // 监听所有地址
      port: 5173,
      proxy: {
        //设置代理，必须填
        [env.VITE_APP_BASE_API]: {
          //目标代理服务器地址：部署时将localhost改成自己服务器的地址即可
          target: env.VITE_DEV_SERVE,
          // target: env.VITE_PROD_SERVE,
          changeOrigin: true, //是否设置同源，输入是的
          //重写路径
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
      Components({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
      createSvgIconsPlugin({
        // 配置svg图标所在位置
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
      }),
      // vueDevTools(),
      vitePluginsAutoI18n({
        targetLangList: ['en'],
        originLang: 'zh-cn',
        translator: new YoudaoTranslator({
          appId: '6506288d0eeee40d',
          appKey: 'G3BHB83E6EgHaATIcu2HaL2YOhSteSsv'
        })
      })
    ],
    // CSS 预处理器配置
    css: {
      preprocessorOptions: {
        scss: {
          // 使用现代 Sass API 替代 legacy JS API
          api: 'modern-compiler',
          // 如果需要全局样式变量，可以取消注释下面的行
          // additionalData: '@import "./src/style/global.scss";',
        },
      },
    },
  };
});