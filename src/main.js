import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import Message from 'element-ui/packages/message/src/main'
import echarts from 'echarts' // 引入echarts
Vue.prototype.$echarts = echarts // 引入组件
Vue.config.productionTip = false
Vue.prototype.$message = Message
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://192.168.43.164:8080/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
