import Koa from "koa";
import { $consts } from "src/plugins";

const app = new Koa();



app.listen($consts['CONFIG/PORT'], () => {
  console.log('koa服务已启动, 端口:', $consts['CONFIG/PORT'])
});