/* 路由授权中间件 */

export default function({ store, redirect, route }) {
  // 前端路由鉴权
  if (!store.state.token && route.path !== '/login') {
    return redirect('/login')
  } else if (store.state.token && route.path === '/login') {
    // 授过权后，登录页直接跳转到首页
    return redirect('/home')
  }
}
