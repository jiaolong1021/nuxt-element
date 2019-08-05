const codeMap = {
  '-1': 'fail',
  '0': 'success',
  '401': 'token expired',
  '500': 'server error',
  '10001': 'params error'
}

const utilFn = {
  // 传入 code 或 message， 则认为是失败
  ok(data, code, message) {
    if (code || message) {
      return {
        code: code || -1,
        success: false,
        message: message || codeMap[code],
        data: data || null
      }
    } else {
      return {
        code: 0,
        success: true,
        message: codeMap['0'],
        data: data || null
      }
    }
  }
}

const errorHandle = (ctx, error) => {
  if (error.message.indexOf('500') !== -1) {
    ctx.throw(500, error.message)
  } else if (error.message.indexOf('404') !== -1) {
    ctx.throw(404, error.message)
  } else if (error.message.indexOf('401') !== -1) {
    ctx.throw(401, error.message)
  } else if (error.message.indexOf('timeout') !== -1) {
    ctx.throw(404, '请求超时！')
  } else if (error.code === 'ENOTFOUND') {
    ctx.throw(404, error.message)
  } else if (error.message === 'visit address not exit') {
    ctx.throw(404, '服务器内部错误，请联系管理员!')
  } else if (error.message === 'form-data') {
    ctx.throw(404, '所传参数必须为form-data形式')
  } else if (error.message.indexOf('code 503') !== -1) {
    ctx.throw(404, '503错误，找不到后台服务地址！')
  }
}

const urlHandle = function() {
  return this.request.url.replace(/^\/api/gi, '')
}

module.exports = class Util {
  /**
   * 添加401错误处理
   * @param ctx
   * @param next
   * @returns {Promise<T | never>}
   */
  static unauthorizationMiddleware(ctx, next) {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.status = 401
        // ctx.redirect('/login')
      } else {
        throw err
      }
    })
  }

  /**
   * 用于controller返回数据处理
   * @param ctx
   * @param next
   * @returns {*}
   */
  static util(ctx, next) {
    ctx.util = utilFn
    ctx.session = {
      token: ''
    }
    ctx.errorHandle = errorHandle
    ctx.urlHandle = urlHandle
    return next()
  }
}
