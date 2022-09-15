import storage from 'localforage'
import { makeAutoObservable, observable, computed, runInAction, reaction, toJS } from 'mobx'
import { $api, $consts } from 'src/plugins'
import { generateMenus, generateFlatMenus } from 'src/utils/tools'

type Headers = {
  Authorization: string,
  UserId?: string,
  RoleId?: string
}

type UserInfo = {
  UserId: string,
  RoleId: string,
  Account: string,
  [propsName: string]: any
}

const initHeaders = {
  Authorization: '',
  UserId: '',
  RoleId: '',
}

const initUserInfo = {
  UserId: '',
  RoleId: '',
  Account: '',
}

class CommonStore {
  headers: Headers
  userInfo: UserInfo
  collapsed: boolean
  menus: Array<any>
  initCacheDone: boolean

  constructor () {
    this.headers = initHeaders // 请求头
    this.userInfo = initUserInfo // 用户信息
    this.collapsed = false // 折叠菜单
    this.menus = [] // 功能菜单
    this.initCacheDone = false // 是否完成cache初始化

    makeAutoObservable(this, {
      headers: observable,
      userInfo: observable,
      collapsed: observable,
      menus: observable,
      initCacheDone: observable,
      isLogin: computed
    })
    // this.initCache()
  }

  // 登陆的最终态
  get isLogin () {
    return !!this.headers.Authorization
  }

  // 当前的登陆状态
  getloginStatus () {
    return storage.getItem($consts['CACHE/CACHE_HEADERS']).then((headers: any) => !!headers?.Authorization)
  }

  setCollapsed () {
    this.collapsed = !this.collapsed
  }

  // 每次刷新/重新运行项目之后都初始化一次cache
  initCache () {
    return Promise.all([
      storage.getItem($consts['CACHE/CACHE_HEADERS']),
      storage.getItem($consts['CACHE/CACHE_USERINFO'])
    ]).then((datas: any[]) => {
      const [headers, userInfo] = datas
      runInAction(() => {
        this.headers = headers || initHeaders
        this.userInfo = userInfo || initUserInfo
      })
      this.initCacheDone = true
      return { headers: this.headers }
    })
  }

  // 重置 storage 和 
  resetCache () {
    storage.clear().finally(() => {
      runInAction(() => {
        this.headers = initHeaders
        this.userInfo = initUserInfo
        this.menus = []
      })
      this.initCacheDone = false
    })
  }

  // 登出
  logout () {
    this.resetCache()
  }

  // 写入 storage
  storeCache () {
    return Promise.all([
      // 存储到storage时, 需要将store转换成普通对象,否则无法存储
      storage.setItem($consts['CACHE/CACHE_HEADERS'], toJS(this.headers)),
      storage.setItem($consts['CACHE/CACHE_USERINFO'], toJS(this.userInfo))
    ])
  }

  // 设置 headers
  setHeaders (headers: Headers) {
    runInAction(() => {
      Object.assign(this.headers, headers)
    })
    this.storeCache()
  }

  // 设置用户信息
  setUserInfo (userInfo: UserInfo) {
    runInAction(() => {
      Object.assign(this.userInfo, userInfo)
    })
    this.storeCache()
  }

  // 设置菜单
  setMenu (menus: any[]) {
    runInAction(() => {
      this.menus = menus
    })
  }

  // 获取 storage 中的 headers
  getCahceHeaders () {
    return new Promise(resolve => {
      if (this.initCacheDone) {
        resolve({
          headers: this.headers
        })
      } else {
        this.initCache().then(res => {
          resolve({
            headers: res.headers
          })
        })
      }
    })
  }

  // Antd Menu items 适用的菜单树
  get menuItems () {
    const menuItems: any[] = []
    generateMenus(this.menus, menuItems)
    return menuItems
  }

  // 一维菜单 { MenuPath: ComponentName }
  get flatMenus () {
    const flatMenus: any[] = []
    generateFlatMenus(this.menus, flatMenus)
    return flatMenus
  }
}


const commonStore = new CommonStore()
// 登陆后, 获取菜单数据
reaction(
  () => commonStore.isLogin,
  (isLogin: boolean) => {
    if (isLogin) {
      // 使用catch避免其中一些请求失败导致整个请求无法进行
      Promise.all([
        $api['role/getMenus']({ RoleId: commonStore.headers.RoleId }).catch(() => false)
      ]).then((datas: any[]) => {
        const [menus] = datas
        Array.isArray(menus) && menus.length && commonStore.setMenu(menus)
      })
    }
  }
)

export default commonStore