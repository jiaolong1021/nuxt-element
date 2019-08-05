
import XXP from '../utils/config'
import axios from 'axios'
import VueCookie from 'vue-cookie'
export const state = () => ({
  token: null,
  app: {
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    device: 'desktop'
  },
  settings: {
    showSettings: false,
    fixedHeader: false,
    sidebarLogo: true
  },
  user: {
    token: '',
    name: 'admin',
    avatar: ''
  }
})

export const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  baseURL: state => {
    return 'https://common.xxpie.com/'
  }
}

export const mutations = {
  SET_TOKEN(state, data) {
    if (typeof data === 'string') {
      state.token = data
    } else {
      state.token = data.token
    }
  },
  CLEAR_TOKEN(state) {
    state.token = null
  },
  TOGGLE_SIDEBAR: state => {
    state.app.sidebar.opened = !state.app.sidebar.opened
    state.app.sidebar.withoutAnimation = false
    if (state.app.sidebar.opened) {
      VueCookie.set('sidebarStatus', 1)
    } else {
      VueCookie.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    VueCookie.set('sidebarStatus', 0)
    state.app.sidebar.opened = false
    state.app.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  }
}

export const actions = {
  // nuxt服务端初始化方法，优先级比路由中间件还高。ssr前端向node端发送的请求都会经过该方法
  async nuxtServerInit({ dispatch, commit, state }, { req, res }) {
    // 刷新页面 cookie丢失重新获取
    let token = ''
    if (req.headers.cookie) {
      let cookie = req.headers.cookie
      const cookieObj = {}
      let cookieArr = []
      let key = ''
      let value = ''
      cookie = cookie.split(';')
      for (let i = 0; i < cookie.length; i++) {
        cookieArr = cookie[i].trim().split('=')
        key = cookieArr[0]
        value = cookieArr[1]
        cookieObj[key] = value
      }
      // 防止F5刷新，store中 session丢失
      if (cookieObj['token'] && req.url !== '/login') {
        commit('SET_TOKEN', cookieObj['token'])
        token = cookieObj['token']
      }
    }
    // 重新获取permissions
    axios.defaults.headers[XXP.jwt.headerName] = XXP.jwt.headerNamePrefix + token
  },
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  }
}
