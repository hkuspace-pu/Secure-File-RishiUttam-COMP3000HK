import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles.css'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'
import ApexCharts from 'apexcharts';
import 'primevue/resources/themes/lara-light-blue/theme.css'    
// import Tooltip from 'primevue/tooltip';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
   // theme
// import './sjcl.js'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia)
// app.directive('tooltip', Tooltip);
app.component('Toast', Toast);
app.use(PrimeVue);
app.use(ToastService);
app.use(VueApexCharts)
app.mount('#app');
app.config.globalProperties.$apexcharts = ApexCharts;


