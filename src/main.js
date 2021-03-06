import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false;
Vue.prototype.$window = window;

window.app = new Vue({
  render: h => h(App),
}).$mount('#app')
