import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles.css'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'
import ApexCharts from 'apexcharts';
import 'primevue/resources/themes/lara-light-blue/theme.css'    

import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
   // theme
import './workers/sjcl.js'
  
const app = createApp(App);
const pinia = createPinia()
app.use(pinia)
app.component('Toast', Toast);
app.use(PrimeVue);
app.use(ToastService);
app.use(VueApexCharts)
app.mount('#app');
app.config.globalProperties.$apexcharts = ApexCharts;

// const app = createApp(App);
// app.use(PrimeVue, {
//     unstyled: true
// });
// app.mount('#app');