import log4js from 'log4js'

class MakeLog {
  logs: any

  constructor () {
    this.logs = {}
    this._build()
  }

  _build () {
    log4js.configure({
      appenders: {
        console: { type: 'console' },
        errorFile: {
          type: 'file'
        }
      },
      categories: {
        console: { appenders: ['console'], level: 'debug' },
        error: { appenders: ['errorFile'], level: 'error' }
      }
    })
  }


}


const $log = new MakeLog()
export default $log['logs']