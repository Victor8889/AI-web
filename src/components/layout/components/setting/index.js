import { getThemes, setThemes } from '../../../../utils/storages'
// 定义变量
export const _data = {
  drawer: false,
  nightMode: false,
  /* `navbarType` is a variable that represents the type of navbar layout. It can have one of the
  following values: '左侧菜单模式' (left menu mode), '顶部菜单混合模式' (top menu mixed mode), '顶部菜单模式' (top menu
  mode), or '左侧菜单混合模式' (left menu mixed mode). This variable is used to determine the layout of the
  navbar and is updated when the user changes the navbar layout setting. */
  navbarType: '左侧菜单混合模式',
  navbarList: ['左侧菜单混合模式'],
  systemThemeColor: '#0960BD',
  systemThemeList: [
    '#0960BD',
    // '#0084F4',
    // '#009688',
    // '#536DF3',
    // '#FF5C93',
    // '#EE4F12',
    // '#0096C7',
    // '#9C27B0',
    // '#FF9800',
  ],
  navbarThemeColor: '#FFFFFF',
  navbarThemeList: [
    '#FFFFFF',
    // '#151515',
    // '#009688',
    // '#5172DC',
    // '#409EFF',
    // '#E74C3C',
    // '#24292E',
    // '#394664',
    // '#001529',
    // '#383F45',
  ],
  sidebarThemeColor: '#fff',
  /* `sidebarThemeList` 是一个数组，其中包含侧边栏主题的不同颜色选项。每种颜色都表示为十六进制值。该数组用于提供颜色选项列表，供用户在自定义侧边栏主题时进行选择。 */
  sidebarThemeList: [
    '#001529',
    // '#212121',
    // '#273352',
    // '#FFFFFF',
    // '#191B24',
    // '#191A23',
    // '#304156',
    // '#28333E',
    // '#344058',
    // '#383F45',
  ],
  showBreadcrumb: true,
  showTabs: true,
}

// 主题切换
/**
 * 函数“_changeSetting”更新设置值并在必要时触发主题更新。
 * @param params - 包含以下属性的对象：
 */
export const _changeSetting = (params) => {
  const { type, value, store, data } = params
  data[type] = value
  settingThemes({ type, value })
  if (type === 'navbarType') {
    data.drawer = false
    store.commit('getNavbarType', value)
  }
}

// 设置主题并暂存缓存
const settingThemes = (params) => {
  const { type, value } = params
  const themes = getThemes()
  themes[type] = value
  setThemes(themes)
  _getThemes()
}

// 读取主题
/**
 * `_getThemes` 函数应用主题颜色并根据提供的参数切换类。
 * @param params - `params` 参数是一个包含以下属性的对象：
 */
/**
 * 函数“_getThemes”使用“themes”对象中的相应值（如果存在）更新“data”对象的值。
 * @param params - `params` 参数是一个包含以下属性的对象：
 */
export const _getThemes = (params) => {
  const themes = getThemes()
  if (params) {
    const { data } = params
    Object.keys(data).forEach((key) => {
      data[key] = themes[key] || data[key]
    })
  }
  let attribute = ''
  if (themes.systemThemeColor) {
    attribute += `--systemThemeColor: ${themes.systemThemeColor};`
    const result = lighten(themes.systemThemeColor, 58)
    attribute += `--systemThemeColorActive: ${result};`
  }
  if (themes.navbarThemeColor) {
    attribute += `--navbarThemeColor: ${themes.navbarThemeColor};`
    const result = lighten(themes.navbarThemeColor, 6)
    attribute += `--sidebarThemeColorActive: ${result};`
  }
  if (themes.sidebarThemeColor) {
    attribute += `--sidebarThemeColor: ${themes.sidebarThemeColor};`
    toggleClass({
      flag: themes.sidebarThemeColor === '#FFFFFF',
      cls: 'sidebar--white',
    })
  }
  /* `toggleClass` 函数用于根据条件添加或删除 CSS 类。在本例中，它会检查“themes.nightMode”的值，
 如果条件为真，则将“night-mode”类添加到 body
 元素中。如果条件为 false，则会从 body 元素中删除该类。 */
  toggleClass({
    flag: themes.nightMode,
    cls: 'night-mode',
  })
  toggleClass({
    flag: themes.showBreadcrumb,
    dom: '.el-breadcrumb',
    cls: 'is-show',
  })
  toggleClass({
    flag: themes.showTabs,
    dom: '.tabs-content',
    cls: 'is-show',
  })
  /* `toggleClass` 函数用于根据条件添加或删除 CSS 类。 */
  toggleClass({
    flag: themes?.navbarThemeColor ? themes.navbarThemeColor === '#FFFFFF' : true,
    cls: 'navbar--white',
  })
  _data.navbarList.forEach((item, index) => {
    toggleClass({
      flag: item === _data.navbarType,
      cls: `layout-type-${index + 1}`,
    })
  })

  document.querySelector(':root').setAttribute('style', attribute)
}

// 添加移除class
const toggleClass = (params) => {
  let { flag, cls, dom } = params
  dom = dom || 'body'
  const classList = document.querySelector(dom)?.classList
  flag ? classList?.add(cls) : classList?.remove(cls)
}

// 颜色计算方法
const lighten = (color, amount) => {
  color = color.includes('#') ? color.substring(1, color.length) : color
  amount = Math.trunc((255 * amount) / 100)
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount,
  )}${addLight(color.substring(4, 6), amount)}`
}

// 颜色计算方法
const addLight = (color, amount) => {
  const cc = parseInt(color, 16) + amount
  const c = cc > 255 ? 255 : cc
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`
}
