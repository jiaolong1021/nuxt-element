/**
 * @name urlHandle 对URL进行处理
 * @param {string} url
 * @param {string} params
 */
export default function urlHandle(url, params) {
  if (url.indexOf('?') !== -1 && params) {
    return url + '&' + params
  } else if (url.indexOf('?') === -1 && params) {
    return url + '?' + params
  } else {
    return url
  }
}
