/** 存储全局的 WebSocket 实例以及对应的消息 */
class StorageSocket {
  socket?: WebSocket
  onopen: any[]
  onclose: any[]
  onerror: any[]
  onmessage: any[]
  reconnectTimer: any

  constructor () {
    this.socket = undefined
    this.onopen = []
    this.onclose = []
    this.onerror = []
    this.onmessage = []
    this.reconnectTimer = -1
  }
}
const storageSocket = new StorageSocket()

/** 全局 WebSocket */
type GlobalSocketProps = {
  url: string,
  autoReconnect?: boolean,
  reconnectInterval?: number
}
class GlobalSocket {
  // 全局 socket
  socket?: WebSocket
  socketUrl: string
  // 自动重连
  autoReconnect: boolean
  reconnectInterval?: number
  reconnectCount: number

  /**
   * 全局 socket 实例构造函数
   * @param props 
   * @param props.url socket url
   * @param props.autoReconnect socket 是否自动重连
   * @param props.reconnectInterval socket 重连时间间隔
   */
  constructor (props: GlobalSocketProps) {
    const { url, autoReconnect = true, reconnectInterval } = props
    this.socketUrl = url
    // 重连配置
    this.autoReconnect = autoReconnect
    this.reconnectInterval = reconnectInterval
    this.reconnectCount = 1
    // 构建 socket 实例
    clearTimeout(storageSocket.reconnectTimer)
    this.buildSocket()
  }

  buildSocket () {
    this.socket = storageSocket.socket = new window.WebSocket(this.socketUrl)
    this.socket.onopen = () => this.evalFuncs('onopen')
    this.socket.onmessage = (evt: any) => this.evalFuncs('onmessage', evt.data)
    this.socket.onerror = (error: any) => {
      console.error('socket onerror', error, new Date().toLocaleString())
      this.evalFuncs('onerror', error)
    }
    this.socket.close = (evt: any) => {
      console.error('socket close', evt.code, evt.reason, new Date().toLocaleString())
      this.evalFuncs('onclose', evt.code, evt.reason)
      this.autoReconnect && this.reconnect()
    }
  }

  /**
   * 执行 socket 监听的所有事件
   * @param type 事件类型 'onmessage' | 'onopen' | 'onerror' | 'onclose'
   * @param resetProps 其他参数
   */
  evalFuncs (type: 'onopen' | 'onclose' | 'onmessage' | 'onerror', ...resetProps: any) {
    const funcs = storageSocket[type].filter((item: any) => !!item)
    Array.isArray(funcs) && funcs.forEach((func: any) => func instanceof Function && func(...resetProps))
  }

  /**
   * 生成重连时间间隔, 重连次数越多, 间隔越长 1000 3000 7000
   * @param count 重连次数
   * @returns 重连时间间隔
   */
  generatorInterval (count: number) {
    return this.reconnectInterval || Math.min(30, Math.pow(2, count) - 1) * 1000
  }

  /** 重连 */
  reconnect () {
    storageSocket.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.buildSocket()
    }, this.generatorInterval(this.reconnectCount))
  }
}

type SocketProps = {

}

export default {}