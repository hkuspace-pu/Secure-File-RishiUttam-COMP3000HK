import { createApp } from 'vue'
import './assets/styles.css'
import PrimeVue from 'primevue/config';
import App from './App.vue'

import 'primevue/resources/themes/lara-light-blue/theme.css'       // theme
const app = createApp(App);
app.use(PrimeVue);
app.mount('#app');
// const app = createApp(App);
// app.use(PrimeVue, {
//     unstyled: true
// });
// app.mount('#app');