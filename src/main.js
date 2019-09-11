import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import Vuelidate from 'vuelidate'

import router from './router'
import store from './store'

Vue.use(Vuelidate);

axios.defaults.baseURL = 'https://vue-axios-f419b.firebaseio.com';
//axios.defaults.headers.common['Authorization'] = 'test';
axios.defaults.headers.get['Accepts'] = 'application/json';

axios.interceptors.request.use(config => {
  console.log('Request interceptor', config);
  return config;
});
axios.interceptors.response.use(res => {
  console.log('Response interceptor', res);
  return res;
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
