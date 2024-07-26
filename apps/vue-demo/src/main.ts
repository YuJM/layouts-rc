import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useOverlayRegister } from 'overlay-manager-vue'

const app = createApp(App)
const overlayManager = useOverlayRegister()
app.provide('overlay-manager', overlayManager)
app.use(router)

app.mount('#app')
