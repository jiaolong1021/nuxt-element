export default [{
  path: '/home',
  meta: { title: '首页', icon: 'dashboard' }
}, {
  path: '/cash',
  name: 'Cash',
  meta: { title: '充值', icon: 'dashboard' },
  children: [{
    path: 'member',
    name: 'CashIndex',
    meta: { title: '充值会员', icon: 'dashboard' }
  }, {
    path: 'xxx',
    name: 'CashNow',
    meta: { title: '充值', icon: 'dashboard' }
  }]
}]
