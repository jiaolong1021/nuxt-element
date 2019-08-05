const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const router = require('./router')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const Middleware = require('./middleware')
const XXP = require('../utils/config')
const app = new Koa()
const validate = require('koa-validate')
const jwt = require('koa-jwt')
const favicon = require('koa-favicon')
const path = require('path')
const pathToRegexp = require('path-to-regexp')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  validate(app)
  app.use(favicon(path.join(__dirname, '../static/images/favicon.ico'))) // favicon图标
    .use(Middleware.unauthorizationMiddleware) // 401未授权处理
    .use(Middleware.util) // 添加工具函数
    .use(cors({ credentials: true, maxAge: 1800000 }))
    .use(jwt({ secret: XXP.jwt.secret }).unless((ctx) => {
    // 接口鉴权
      if (/^\/api/.test(ctx.path)) {
        return pathToRegexp([
          '/api/login'
        ]).test(ctx.path)
      }
      return true
    }))
    .use(koaBody({ multipart: true,
      formidable: {
        maxFileSize: 20 * 1024 * 1024 // 设置上传文件大小最大限制，默认20M
      }}))
    .use(router.api.routes())
    .use(router.api.allowedMethods())
    .use((ctx) => {
      ctx.status = 200
      ctx.respond = false // Bypass Koa's built-in response handling
      ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
      nuxt.render(ctx.req, ctx.res)
    })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
