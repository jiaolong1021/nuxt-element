const Fetch = require('../api/request')
const jwt = require('jsonwebtoken')

module.exports = class CashController {
  static async member(ctx) {
    const params = ctx.request.body
    let ret = {}
    params.token = jwt.sign({ username: params.username }, 'yijiarenonline', { expiresIn: 15 * 24 * 60 * 60 })
    // 添加来源标记
    params.reason = '[ops]' + params.reason
    if (params.is_payment === 0) {
      params.payment_amount = ''
    }

    await Fetch.post({
      url: '/operationAndMaintenance/rechargeMember',
      params: params
    }).then((res) => {
      ret = res
    }).catch((err) => {
      console.log(err.message)
    })

    ctx.body = ret
  }
}
