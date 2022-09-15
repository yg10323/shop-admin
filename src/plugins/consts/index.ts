import CONSTS_DEFAULT_CONFIG from './config'

type Config = {
  [propsName: string]: any
}

type Options = {
  sep: string
}

class MakeConst {
  consts: any
  options: Options

  constructor () {
    this.consts = {}
    this.options = CONSTS_DEFAULT_CONFIG
    this.register()
  }

  register () {
    const CONSTS_CONFIG: any = {}
    // require.context匹配结果出现绝对路径, 使用正则过滤
    const modlues = require.context('./service', false, /\.\/.*\.ts/)
    modlues.keys().forEach((key: string) => {
      // 匹配文件名
      const constName: any = key.match(/(?<=\.\/).*?(?=\.ts)/)?.[0]
      if (constName === 'index') return
      CONSTS_CONFIG[constName] = modlues(key).default
    })
    Object.keys(CONSTS_CONFIG).forEach((namespace: string) => {
      this._build(namespace, CONSTS_CONFIG[namespace])
    })
  }

  _build (namespace: string, config: any[]) {
    const { sep } = this.options
    config.forEach((consts: Config) => {
      const { name, value } = consts
      const constName = `${namespace.toUpperCase()}${sep}${name}`
      Object.defineProperty(this.consts, constName, { value })
    })
  }
}

const $consts = new MakeConst()
export default $consts['consts']