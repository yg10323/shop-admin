import path from 'path'
import Koa from 'koa'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import mapRoutes from './router'
import { $consts } from 'src/plugins'

const app = new Koa()

mapRoutes(app)
app.use(cors({ origin: '*' }))
app.use(koaBody())
app.use(koaStatic(path.join(__dirname, 'static')))

app.listen($consts['CONFIG/PORT'], () => {
  console.log('koa服务已启动, 端口:', $consts['CONFIG/PORT'])
})