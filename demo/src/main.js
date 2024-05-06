import { createApp } from 'vue'
import './assets/styles.css'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'
import ApexCharts from 'apexcharts';
import 'primevue/resources/themes/lara-light-blue/theme.css'    
   // theme
const app = createApp(App);
app.use(PrimeVue);
app.use(VueApexCharts)
app.mount('#app');
app.config.globalProperties.$apexcharts = ApexCharts;

// const app = createApp(App);
// app.use(PrimeVue, {
//     unstyled: true
// });
// app.mount('#app');