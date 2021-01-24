import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import axios from 'axios'
import router from '../router/index'
import Swal from 'sweetalert2'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    password: '',
    user: {},
    id: null || localStorage.getItem('id'),
    token: null || localStorage.getItem('token'),
    userLogin: [],
    transactionHistory: [],
    userFriends: [],
    searchName: []
  },
  plugins: [createPersistedState()],
  mutations: {
    togglePassword (state) {
      state.password = document.getElementById('password')
      if (state.password.type === 'password') {
        state.password.type = 'text'
      } else {
        state.password.type = 'password'
      }
    },
    set_user (state, payload) {
      state.user = payload
      state.id = payload.id
      state.token = payload.token
    },
    set_user_login (state, payload) {
      state.userLogin = payload
    },
    set_transaction_history (state, payload) {
      state.transactionHistory = payload
    },
    set_user_friends (state, payload) {
      state.userFriends = payload
    },
    set_search_name (state, payload) {
      state.searchName = payload
    }
  },
  actions: {
    login (context, payload) {
      return new Promise((resolve, reject) => {
        axios.post(`${process.env.VUE_APP_URL_API}/users/login`, payload)
          .then(res => {
            const result = res.data.result
            localStorage.setItem('id', result.id)
            localStorage.setItem('token', result.token)
            context.commit('set_user', result)
            resolve(result)
          })
      })
    },
    register (context, payload) {
      return new Promise((resolve, reject) => {
        axios.post(`${process.env.VUE_APP_URL_API}/users/register`, payload)
          .then(res => {
            const result = res.data.result.message
            context.commit('set_user', result)
            resolve(result)
          })
      })
    },
    userProfile (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_URL_API}/users/${localStorage.getItem('id')}`, payload)
          .then(res => {
            const result = res.data.result[0]
            context.commit('set_user_login', result)
            resolve(result)
            console.log('user login', result)
          })
      })
    },
    getTransactionHistory (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_URL_API}/transfer/transaction-history/${localStorage.getItem('id')}`)
          .then(res => {
            const result = res.data.result
            context.commit('set_transaction_history', result)
            resolve(result)
            console.log('transaction history', result)
          })
      })
    },
    userFriends (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_URL_API}/users/${localStorage.getItem('id')}/friends`, payload)
          .then(res => {
            const result = res.data.result
            context.commit('set_user_friends', result)
            resolve(result)
            console.log('user friends', result)
          })
      })
    },
    searchName (context, payload) {
      return new Promise((resolve, reject) => {
        axios.get(`${process.env.VUE_APP_URL_API}/users?name=${payload}`)
          .then(res => {
            const result = res.data.result
            context.commit('set_search_name', result)
            resolve(result)
            console.log('search name', result)
          })
      })
    },
    interceptorRequest (context) {
      axios.interceptors.request.use(function (config) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return config
      }, function (error) {
        return Promise.reject(error)
      })
    },
    interceptorResponse (context) {
      axios.interceptors.response.use(function (response) {
        if (response.data.statusCode === 200) {
          if (response.data.result.message === 'Please check your email for activation account') {
            Swal.fire({
              icon: 'success',
              title: 'Success register, check your email to confirmation',
              showConfirmButton: false,
              timer: 2000
            })
            router.push('/auth/login')
          }
        }
        return response
      }, function (error) {
        if (error.response.data.statusCode === 400) {
          if (error.response.data.err.error === 'Email already exists') {
            Swal.fire({
              icon: 'error',
              title: 'email already exists',
              showConfirmButton: false,
              timer: 2000
            })
          }
        } else if (error.response.data.statusCode === 401) {
          if (error.response.data.err.error === 'Please confirm your email to login!') {
            Swal.fire({
              icon: 'error',
              title: 'Please confirm your email to login!',
              showConfirmButton: false,
              timer: 2000
            })
          }
        }
        return Promise.reject(error)
      })
    }
  },
  getters: {
    isLogin (state) {
      return state.token !== null
    },
    profile (state) {
      return state.userLogin
    },
    transactionHistory (state) {
      return state.transactionHistory
    },
    friends (state) {
      return state.userFriends
    }
  },
  modules: {
  }
})