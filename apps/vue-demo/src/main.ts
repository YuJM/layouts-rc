import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useOverlayRegister } from 'overlay-manager-vue'

const app = createApp(App)
const { overlays, overlayOpen, closeAllOverlay } = useOverlayRegister()
app.provide('overlay-manager', { overlays, overlayOpen, closeAllOverlay })
app.use(router)

app.mount('#app')
