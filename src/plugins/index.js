//引入所有需要注册为全局组件的组件
//封装svg图标
import SvgIcon from "@/components/custom/SvgIcon.vue";
//封装iconfont.cn图标库
import IconFont from "@/components/custom/IconFont.vue";

//全局对象
const allGlobalComponent = { IconFont, SvgIcon };

//对外暴露插件对象
export default {
    //务必使用install方法
    install(app) {
        //注册项目中的所有全局组件
        Object.keys(allGlobalComponent).forEach(key => {
            //注册为全局组件
            app.component(key, allGlobalComponent[key]);
        });
    }
}