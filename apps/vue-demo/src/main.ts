import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { overlayManagerPlugin } from 'overlay-manager-vue'

const app = createApp(App)
app.use(overlayManagerPlugin())
app.use(router)

app.mount('#app')
