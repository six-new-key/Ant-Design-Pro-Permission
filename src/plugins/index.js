//引入所有需要注册为全局组件的组件
//封装svg图标
import SvgIcon from "@/components/custom/SvgIcon.vue";
//封装iconfont.cn图标库
import IconFont from "@/components/custom/IconFont.vue";
//字典组件
import DictSelect from "@/components/custom/DictSelect.vue";
import DictRadio from "@/components/custom/DictRadio.vue";
import DictTag from "@/components/custom/DictTag.vue";
//引入自定义指令
import { permission, role } from "@/directives/permission";

//全局对象
const allGlobalComponent = { 
    IconFont, 
    SvgIcon,
    DictSelect,
    DictRadio,
    DictTag
};

//对外暴露插件对象
export default {
    //务必使用install方法
    install(app) {
        //注册项目中的所有全局组件
        Object.keys(allGlobalComponent).forEach(key => {
            //注册为全局组件
            app.component(key, allGlobalComponent[key]);
        });
        
        //注册自定义指令
        app.directive('permission', permission);
        app.directive('role', role);
    }
}