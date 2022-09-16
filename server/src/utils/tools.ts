import LRU from 'lru-cache'

/* 内存缓存 */
class Cache {
  static instance: any

  /* 生成LRU的单例 */
  static getInstance () {
    if (!Cache.instance) {
      Cache.instance = new LRU({
        max: 5000,  // 最大数量
        ttl: 1000 * 60 * 24, // 保持时间
      })
    }
    return Cache.instance
  }
}
export const cache = Cache.getInstance()

/* 判断字符串包含中文或是否以数字开头 */
export const checkString = (str: string) => {
  if (new RegExp("[\u4E00-\u9FA5]+").test(str) || new RegExp("^[0-9]").test(str)) {
    return false
  }
  return true
}

/* 字符串首字母大写 */
export const firstToUpperCase = (str: string) => {
  return str.trim().toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}