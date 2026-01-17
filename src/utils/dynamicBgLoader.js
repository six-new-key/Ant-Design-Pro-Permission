/**
 * 动态背景库加载器
 * 负责加载所有动态背景库并避免相互覆盖
 */

/**
 * 通过script标签动态加载脚本
 */
const loadScriptTag = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * 动态加载所有背景库，避免相互覆盖
 * @returns {Promise<void>}
 */
// export const loadDynamicBgLibraries = async () => {
//   // 初始化全局对象
//   if (!window.Color4Bg) {
//     window.Color4Bg = {};
//   }
  
//   // 动态背景库文件列表
//   const bgLibraries = [
//     { name: 'AestheticFluidBg', path: '/src/assets/js/AestheticFluidBg.min.js' },
//     { name: 'ChaosWavesBg', path: '/src/assets/js/ChaosWavesBg.min.js' },
//     { name: 'SwirlingCurvesBg', path: '/src/assets/js/SwirlingCurvesBg.min.js' },
//     { name: 'BlurGradientBg', path: '/src/assets/js/BlurGradientBg.min.js' },
//     { name: 'AbstractShapeBg', path: '/src/assets/js/AbstractShapeBg.min.js' },
//     { name: 'BlurDotBg', path: '/src/assets/js/BlurDotBg.min.js' }
//   ];
  
//   // 通过 import.meta.glob 预声明所有可能的动态库，便于 Vite 构建期分析
//   const moduleLoaders = import.meta.glob('/src/assets/js/*.min.js');
  
//   // 逐个加载库并保存到全局对象
//   for (const lib of bgLibraries) {
//     try {
//       // 临时保存已有的类
//       const existingClasses = { ...window.Color4Bg };
      
//       // 使用预声明的模块加载器来按需导入，避免 Vite 动态导入分析失败
//       const loader = moduleLoaders[lib.path];
//       if (typeof loader === 'function') {
//         await loader();
//       } else {
//         console.warn(`Module loader not found for ${lib.name} at ${lib.path}`);
//       }
      
//       // 恢复之前的类并添加新类
//       Object.assign(window.Color4Bg, existingClasses);
      
//       console.log(`Loaded ${lib.name}:`, window.Color4Bg[lib.name] ? 'Success' : 'Failed');
//     } catch (error) {
//       console.error(`Failed to load ${lib.name}:`, error);
//     }
//   }
  
//   console.log('All dynamic background libraries loaded:', Object.keys(window.Color4Bg));
// };

export const loadDynamicBgLibraries = async () => {
  // 初始化全局对象
  if (!window.Color4Bg) {
    window.Color4Bg = {};
  }
  
  // 动态背景库文件列表 - 修改为public目录路径
  const bgLibraries = [
    { name: 'AestheticFluidBg', path: '/js/AestheticFluidBg.min.js' },
    { name: 'ChaosWavesBg', path: '/js/ChaosWavesBg.min.js' },
    { name: 'SwirlingCurvesBg', path: '/js/SwirlingCurvesBg.min.js' },
    { name: 'BlurGradientBg', path: '/js/BlurGradientBg.min.js' },
    { name: 'AbstractShapeBg', path: '/js/AbstractShapeBg.min.js' },
    { name: 'BlurDotBg', path: '/js/BlurDotBg.min.js' }
  ];
  
  // 逐个加载库并保存到全局对象
  for (const lib of bgLibraries) {
    try {
      // 临时保存已有的类
      const existingClasses = { ...window.Color4Bg };
      
      // 使用script标签加载
      await loadScriptTag(lib.path);
      
      // 恢复之前的类并添加新类
      Object.assign(window.Color4Bg, existingClasses);
      
      console.log(`Loaded ${lib.name}:`, window.Color4Bg[lib.name] ? 'Success' : 'Failed');
    } catch (error) {
      console.error(`Failed to load ${lib.name}:`, error);
    }
  }
  
  console.log('All dynamic background libraries loaded:', Object.keys(window.Color4Bg));
};

/**
 * 检查动态背景库是否已加载
 * @param {string} bgType - 背景类型名称
 * @returns {boolean}
 */
export const isDynamicBgLoaded = (bgType) => {
  return window.Color4Bg && typeof window.Color4Bg[bgType] === 'function';
};

/**
 * 获取所有已加载的动态背景类型
 * @returns {string[]}
 */
export const getLoadedBgTypes = () => {
  return window.Color4Bg ? Object.keys(window.Color4Bg) : [];
};
