const axios = require('axios')
const qs = require('qs')
const requestUrl = require('./requestUrl')
const jwt = require('jsonwebtoken')
const XXP = require('../../utils/config')

// 创建axios实例，默认已json对象形式接收数据(application/json)
const request = axios.create({
  timeout: 60000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// request拦截器相关处理
request.interceptors.request.use(config => {
  console.log(config.method + ' --> ' + config.url)
  // console.log(config.headers)

  // token用于登录验证
  if (request.ctx && request.ctx.request.headers[XXP.jwt.headerName]) {
    config.headers.token = jwt.verify(request.ctx.request.headers[XXP.jwt.headerName].replace(XXP.jwt.headerNamePrefix, ''), XXP.jwt.secret).token
    // 避免上次ctx遗留，修复再次登录时会报错
    request.ctx = null
  }
  if (request.ctx && request.ctx.request.headers['x-request-id']) {
    config.headers['x-request-id'] = request.ctx.request.headers['x-request-id']
  }
  if (request.ctx && request.ctx.request.headers['x-b3-traceid']) {
    config.headers['x-b3-traceid'] = request.ctx.request.headers['x-b3-traceid']
  }
  if (request.ctx && request.ctx.request.headers['x-b3-spanid']) {
    config.headers['x-b3-spanid'] = request.ctx.request.headers['x-b3-spanid']
  }
  if (request.ctx && request.ctx.request.headers['x-b3-parentspanid']) {
    config.headers['x-b3-parentspanid'] = request.ctx.request.headers['x-b3-parentspanid']
  }
  if (request.ctx && request.ctx.request.headers['x-b3-sampled']) {
    config.headers['x-b3-sampled'] = request.ctx.request.headers['x-b3-sampled']
  }
  if (request.ctx && request.ctx.request.headers['x-b3-flags']) {
    config.headers['x-b3-flags'] = request.ctx.request.headers['x-b3-flags']
  }
  if (request.ctx && request.ctx.request.headers['x-ot-span-context']) {
    config.headers['x-ot-span-context'] = request.ctx.request.headers['x-ot-span-context']
  }
  return config
}, error => {
  return Promise.reject(error)
})

// response拦截器相关处理
request.interceptors.response.use(response => {
  // console.log({status: response.status, statusText: response.statusText, headers: response.headers, data: response.data})
  if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
    console.log({ status: response.status, statusText: response.statusText, data: response.data })
  }
  // 访问地址不存在
  if (typeof response.data === 'string' && response.data.indexOf('http://search.114so.cn') !== -1) {
    throw new Error('visit address not exit')
  }
  return response
}, error => {
  console.log({ type: 'error', code: error.code, message: error.message })
  return Promise.reject(error)
})

/**
 * 参数： url(必填) string,
 * @param params
 * @param promise
 * @name commonFetch
 */
function commonFetch(params, promise) {
  return promise.then(({ data }) => {
    // 暂时直接返回data，根据业务可二次封装
    return data
  })
}

module.exports = {
  request, // 直接提供axios
  post(data) {
    if (data.ctx) request.ctx = data.ctx
    const headers = data.headers || {}
    const type = data.type || 'json'
    if (type === 'query') { // x-www-form-urlencoded请求形式
      return commonFetch(data, request.post(requestUrl({ url: data.url, params: qs.stringify(data.params), urlPrefix: data.urlPrefix }), {
        headers
      }))
    } else if (type === 'form') { // form-data请求形式, params必须是form-data对象
      if (typeof data.params === 'object' && typeof data.params.getHeaders === 'function') {
        return commonFetch(data, request.post(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), data.params, {
          headers: {
            ...data.params.getHeaders(),
            ...headers
          }
        }))
      } else {
        return Promise.reject(new Error('form-data'))
      }
    } else { // json格式请求
      return commonFetch(data, request.post(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), data.params, headers))
    }
  },
  patch(data) {
    if (!data) {
      return
    }
    if (data.ctx) request.ctx = data.ctx
    const headers = data.headers || {}
    return commonFetch(data, request.patch(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), data.params, { headers }))
  },
  put(data) {
    if (!data) {
      return
    }
    if (data.ctx) request.ctx = data.ctx
    const headers = data.headers || {}
    return commonFetch(data, request.put(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), data.params, { headers }))
  },
  delete(data) {
    if (!data) {
      return
    }
    if (data.ctx) request.ctx = data.ctx
    const headers = data.headers || {}
    return commonFetch(data, request.delete(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), { headers }))
  },
  get(data) {
    /**
     * data.params json 或者 string
     */
    if (!data) {
      return
    }
    if (data.ctx) request.ctx = data.ctx
    const headers = data.headers || {}
    if (typeof (data.params) === 'object') {
      return commonFetch(data, request.get(`${requestUrl({ url: data.url, params: qs.stringify(data.params), urlPrefix: data.urlPrefix })}`, { headers }))
    } else {
      return commonFetch(data, request.get(requestUrl({ url: data.url, urlPrefix: data.urlPrefix }), { headers }))
    }
  },
  // 用于通过方法来确定调用哪种请求
  req(method, data) {
    if (method === 'GET') {
      return this.get(data)
    } else if (method === 'POST') {
      return this.post(data)
    } else if (method === 'PUT') {
      return this.put(data)
    } else if (method === 'PATCH') {
      return this.patch(data)
    } else if (method === 'DELETE') {
      return this.delete(data)
    }
  }
}
