// 设置导航
import { reactive } from 'vue'
/**
 * 该函数根据给定值设置列表中选项卡的活动状态，并将更新后的列表存储在会话存储中。
 * @param data - 表示选项卡的对象数组。每个对象应该有一个“id”属性来唯一标识该选项卡，以及一个“active”属性来指示该选项卡当前是否处于活动状态。
 * @param value - `value` 参数是需要设置为活动的选项卡的 ID。
 */
export const setTabs = (data, value) => {
  if (value)
    data.forEach(item => (item.active = item.id === value))

  sessionStorage.setItem('TABS_LIST', JSON.stringify(data))
}

// 获取导航
/**
 * 函数“getTabs”从会话存储中检索选项卡列表，如果未找到选项卡，则返回空数组。
 * @returns 函数“getTabs”返回一个选项卡数组。
 */
export const getTabs = () => {
  let result = sessionStorage.getItem('TABS_LIST')
  result = result ? JSON.parse(result) : []
  return result
}

// 设置主题
/**
 * setThemes 函数将提供的数据作为 JSON 字符串存储在浏览器的本地存储中。
 * @param data - “data”参数是一个对象，其中包含要存储在浏览器本地存储中的主题数据。
 */
export const setThemes = (data) => {
  localStorage.setItem('THEMES', JSON.stringify(data))
}

// 获取主题

/**
 * 函数“getThemes”从本地存储中检索一组主题，如果没有找到，则返回一组默认主题。
 * @returns 函数“getThemes”返回存储在 localStorage
 * 中“THEMES”键中的值。如果该值存在，则使用“JSON.parse”将其从字符串解析为对象。如果该值不存在，则返回属性“showBreadcrumb”和“showTabs”设置为“true”的默认对象。
 */
export const getThemes = () => {
  let result = localStorage.getItem('THEMES')
  result = result
    ? JSON.parse(result)
    : {
        showBreadcrumb: true,
        showTabs: true,
        nightMode: false,
      }
  return result
}
export const getNight = () => {
  let result = localStorage.getItem('THEMES')
  result = result
    ? JSON.parse(result)
    : {
        showBreadcrumb: true,
        showTabs: true,
        nightMode: false,
      }
  return reactive(result)
}
// 设置面包屑
/**
 * 该函数在会话存储中设置面包屑数据，并反转数据的顺序（如果提供）。
 * @param data - “data”参数是一个表示面包屑路径的数组。数组中的每个元素代表轨迹中的一个步骤。
 */
export const setBreadcrumb = (data) => {
  data = data || []
  data = data.reverse()
  sessionStorage.setItem('BREADCRUMB', JSON.stringify(data))
}

// 获取面包屑
/**
 * 函数“getBreadcrumb”从会话存储中检索面包屑数据并将其作为数组返回。
 * @returns 函数“getBreadcrumb”返回“result”变量的值，该变量是一个数组。
 */
export const getBreadcrumb = () => {
  let result = sessionStorage.getItem('BREADCRUMB')
  result = result ? JSON.parse(result) : []
  return result
}
