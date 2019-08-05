import axios from 'axios'
import qs from 'qs'
import requestUrl from './requestUrl'
import Vue from 'vue'
const XXP = require('../utils/config')
// 创建axios实例，默认已json对象形式接收数据(application/json)
const request = axios.create({
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// request拦截器相关处理
request.interceptors.request.use(config => {
  config.headers[XXP.jwt.headerName] = XXP.jwt.headerNamePrefix + Vue.prototype.$cookie.get('token')
  return config
}, error => {
  return Promise.reject(error)
})

// response拦截器相关处理
request.interceptors.response.use(response => {
  // 未授权，删除cookie，跳转到登录页
  if (response.data.code === '401') {
    Vue.prototype.$cookie.delete('token')
    location.href = '/login'
  }
  return response
}, error => {
  // 未授权，删除cookie，跳转到登录页
  if (error && error.response && error.response.status === 401) {
    Vue.prototype.$cookie.delete('token')
    location.href = '/login'
  }
  if (error && error.response && error.response.data) {
    return Promise.reject(new Error(error.response.data))
  }
  if (error.message && error.message.indexOf('timeout') !== -1) {
    return Promise.reject(new Error('请求超时!'))
  }
  if (error.message && error.message.indexOf('ENOTFOUND') !== -1) {
    return Promise.reject(new Error('请求地址未找到!'))
  }
  return Promise.reject(error)
})

/**
 * 通用then处理
 * @param {*} params
 * @param {*} promise
 */
function commonThen(params, promise) {
  return promise.then(({ data }) => {
    let message = ''
    if (data.code === 0) {
      if (params.done && typeof params.done === 'function') {
        params.done()
      }
      return data
    } else {
      message = data.message ? data.message : '服务器内部错误'
      return Promise.reject(message)
    }
  })
}

/**
 * 通用catch处理
 * @param {*} params
 * @param {*} promise
 */
function commonCatch(params, promise) {
  return promise.catch((err) => {
    if (params.done && typeof params.done === 'function') {
      params.done()
    }
    if (typeof err === 'string') {
      Vue.prototype.$message.error(err)
    } else {
      Vue.prototype.$message.error(err.message)
    }
    // 返回reject目的是不执行接下来的then，但抛出的错误promise没法处理（虽然不用处理，主要是不友好），未来有好的方法可以处理
    return Promise.reject(err)
  })
}

/**
 * 参数： url(必填) string,
 * @param params
 * @param promise
 * @name commonFetch
 */
function commonFetch(params, promise) {
  if (params.self === 'then') {
    return commonCatch(params, promise)
  } else if (params.self === 'catch') {
    return commonThen(params, promise)
  } else if (params.self === 'all') {
    return promise
  } else {
    return commonCatch(params, commonThen(params, promise))
  }
}

/**
 * data参数说明：
 * self: 返回自行处理内容，包括then, catch, all
 * type: 只有post有，指定post请求格式, 默认json, 可选值query, form, json,
 * params: 传递参数,json格式。get可为string,
 * done: 执行完后执行的方法，then，catch都需要执行的方法
 */
export default {
  request, // 直接提供axios
  post(data) {
    if (data.type === 'query') { // x-www-form-urlencoded请求形式
      return commonFetch(data, request({
        url: requestUrl(data.url, qs.stringify(data.params)),
        method: 'post'
      }))
    } else if (data.type === 'form') { // form-data请求形式
      const fd = new FormData()
      if (Object.prototype.toString.call(data.params).indexOf('Object') !== -1) {
        for (const key in data.params) {
          fd.set(key, data.params[key])
        }
      }
      return commonFetch(data, request({
        url: requestUrl(data.url),
        method: 'post',
        data: fd,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }))
    } else { // json格式请求
      return commonFetch(data, request.post(requestUrl(data.url), data.params))
    }
  },
  patch(data) {
    if (!data) {
      return
    }
    return commonFetch(data, request.patch(requestUrl(data.url), data.params))
  },
  put(data) {
    if (!data) {
      return
    }
    return commonFetch(data, request.put(requestUrl(data.url), data.params))
  },
  delete(data) {
    if (!data) {
      return
    }
    if (typeof (data.params) === 'object') {
      return commonFetch(data, request.delete(`${requestUrl(data.url, qs.stringify(data.params))}`))
    } else {
      return commonFetch(data, request.delete(requestUrl(data.url)))
    }
  },
  get(data) {
    if (!data) {
      return
    }
    if (typeof (data.params) === 'object') {
      return commonFetch(data, request.get(`${requestUrl(data.url, qs.stringify(data.params))}`))
    } else {
      return commonFetch(data, request.get(requestUrl(data.url)))
    }
  }
}
