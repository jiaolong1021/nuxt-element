import Vue from 'vue'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import '@/icons' // icon
import '@/assets/styles/index.scss' // global css
const VueCookie = require('vue-cookie')
Vue.use(Element, { locale })
Vue.use(VueCookie)
// vue总线
Vue.prototype.$bus = new Vue()
