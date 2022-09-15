import { $consts } from 'src/plugins'

/**
 * 生成 Antd Menu items 和 Tree items 适用的数据
 * @param menus 菜单树
 * @param targetItems 目标菜单树
 */
export const generateMenus = (menus: any[], targetItems: any[]) => {
  menus.forEach((menu: any, index) => {
    let { id, MenuName, MenuPath = '', Children = [] } = menu
    !MenuPath && (MenuPath = `${id}-${index}`)
    const item: any = { key: MenuPath, label: MenuName, title: MenuName, id: id }
    targetItems.push(item)
    if (Array.isArray(Children) && Children.length) {
      item.children = []
      generateMenus(Children, item.children)
    }
  })
}

/**
 * 把所有菜单放入到一维数组中, 成员项只包含MenuPath和 ComponentName
 * @param menus 菜单树
 * @param flatMenus 一维菜单树
 */
export const generateFlatMenus = (menus: any[], flatMenus: any[]) => {
  menus.forEach((menu: any) => {
    const { MenuPath, CmpName, Children = [] } = menu
    flatMenus.push({ MenuPath, Component: CmpName })
    Array.isArray(Children) && Children.length && generateFlatMenus(Children, flatMenus)
  })
}

/**
 * 把所有菜单放入到一维数组中
 * @param menus 菜单树
 * @param targetMenus 一维菜单树
 */
export const generateAllMenus = (menus: any[], targetMenus: any[]) => {
  menus.forEach((menu: any) => {
    const { id, MenuName, MenuPath, CmpName, Status, MenuType, MenuParent, Children = [] } = menu
    targetMenus.push({ id, MenuName, MenuPath, Component: CmpName, Status, MenuType, MenuParent })
    Array.isArray(Children) && Children.length && generateAllMenus(Children, targetMenus)
  })
}

/**
 * 获取当前环境对应的基础请求地址
 * @param prefix 接口的分隔符, 用于接口的版本维护
 * @returns baseURL
 */
export const getBaseUrl = (prefix: string = $consts['CONFIG/API_DEAULT_PREFIX']) => {
  //获取当前运行环境的主机名/地址, 如 localhost, 127.0.0.1
  const { hostname } = window.location
  // PROCESS_ENV中对应当前环境的数组项
  const process_env = $consts['CONFIG/PROCESS_ENV'].find((env: any) => env.value.indexOf(hostname) !== -1) || { name: 'PRODUCTION_ENV' }
  // 根据 PROCESS_ENV 的 name 属性查找 axios 的 baseURL
  const axiosUrl = $consts['CONFIG/AXIOS_BASE_URL'].find((item: any) => item.name === process_env.name).value
  // 获取端口并拼接成完整的baseURL  localhost:3000/api
  const apiPort = $consts['CONFIG/API_PORT'].find((port: any) => port.name === process_env.name).value
  const baseURL = `${axiosUrl}:${apiPort}${prefix}`

  return baseURL
}

/**
 * 获取完整的url路径, localhost:3000/api/user/login
 * @param path 接口的相对路径 /user/login
 */
export const getApiUrl = (path: string) => {
  return `${getBaseUrl()}${path}`
}

/**
 * 根据 params 拼接 get 请求的 url 地址
 * @param path 接口的相对路径 /user/login
 * @param params get请求的 params 参数
 * @returns url 拼接后的url
 */
export const getParamsUrl = (path: string, params: object) => {
  let url = `${getApiUrl(path)}?`
  for (const [key, value] of Object.entries(params)) {
    url += `&${key}=${value}`
  }
  return url
}