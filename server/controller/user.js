const Fetch = require('../api/request')
const jwt = require('jsonwebtoken')
const XXP = require('../../utils/config')

module.exports = class UserController {
  /**
   * 用户登录
   * @param ctx
   * @returns {Promise<void>}
   */
  static async login(ctx) {
    // const password = ctx.checkQuery('password').value
    // const username = ctx.checkQuery('username').value
    const resultRet = {
      code: 0
    }
    // TODO 账号暂时写死
    resultRet.token = jwt.sign({ username: 'admin' }, XXP.jwt.secret, { expiresIn: '30m' })
    // 处理返回参数为空
    // if (!resultRet.code) {
    //   ctx.body = ctx.util.ok('', 500, '登录返回参数为空!')
    //   return
    // }
    ctx.body = resultRet
  }

  /**
   * 用户退出
   * @param ctx
   */
  static async logout(ctx) {
    let ret = {}

    await Fetch.post({
      url: '/auth/logout',
      urlPrefix: 'auth',
      ctx
    }).then((res) => {
      ret = res.data
    }).catch((err) => {
      ctx.errorHandle(ctx, err)
    })

    ctx.body = ret
  }

  static async permissions(ctx) {
    let ret = {}
    await Fetch.get({
      url: '/auth/permissions',
      urlPrefix: 'auth',
      ctx
    }).then((res) => {
      if (res && res.code === '0') {
        ret = res.data
      }
    }).catch((err) => {
      ctx.errorHandle(ctx, err)
    })
    ctx.body = ret
  }
}
