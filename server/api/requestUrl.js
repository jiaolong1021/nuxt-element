const sysConfig = require('config')
let baseUrl = {}
// 生产环境特殊处理，目前登录没有配置dns，访问不了
if (process.env.NODE_ENV === 'production') {
  baseUrl = sysConfig.get('url')
} else {
  baseUrl = sysConfig.get('localUrl')
}
/**
 * @name urlHandle 对URL进行处理
 * @param {object} params
 */
module.exports = function(params) {
  const urlPrefix = params.urlPrefix ? baseUrl[params.urlPrefix] : baseUrl.basic
  if (params.url.indexOf('?') !== -1 && params.params) {
    return urlPrefix + params.url + '&' + params.params
  } else if (params.url.indexOf('?') === -1 && params.params) {
    return urlPrefix + params.url + '?' + params.params
  } else {
    return urlPrefix + params.url
  }
}
