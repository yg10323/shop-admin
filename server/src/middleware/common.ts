import type { Context, Next } from 'src/types'
import jwt from 'jsonwebtoken'
import { $consts, $log } from 'src/plugins'
import { emitError } from 'src/utils/error'

type Payload = {
  RoleId: string,
  UserId: string,
  [propsName: string]: any
}

class CommonMiddleware {
  /* 校验token */
  async _verifyToken (ctx: Context, next: Next) {
    try {
      const authorization = ctx.headers.authorization
      if (!authorization) return emitError(ctx, $consts['ERROR/UNAUTHORIZATION'])
      const token = authorization.replace('Bearer ', '')
      const result = jwt.verify(token, $consts['KEYS/PUBLIC_KEY'], {
        algorithms: [$consts['KEYS/ALGORITHM']]
      })
      ctx.AuthInfo = result
      await next()
    } catch (error: any) {
      $log['log'].error('CommonMiddleware__verifyToken', error)
      $log['error'].error('CommonMiddleware__verifyToken', error)
    }
  }

  /* 生成token */
  _createToken (payload: Payload) {
    return jwt.sign({ ...payload }, $consts['KEYS/PRIVATE_KEY'], {
      expiresIn: 60 * 60 * 24, // token有效期 ss
      algorithm: $consts['KEYS/ALGORITHM']
    })
  }
}

const commonMiddleware = new CommonMiddleware()
export default commonMiddleware