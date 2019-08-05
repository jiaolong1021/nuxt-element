/* 后台路由 */
const Router = require('koa-router') // koa 路由

const {
  user,
  cash
} = require('../controller')
const apiRouter = new Router({ prefix: '/api' })
exports.api = apiRouter.get('/login', user.login)
  .post('/cash/member', cash.member)
