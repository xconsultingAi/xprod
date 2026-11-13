import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from './api/client'
import { useSessionStore } from './stores/session'
import { showError } from './utils/notify'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/palettes/dark.system.css'
import './theme.css'

setSessionExpiredHandler(() => {
  window.location.href = `/login?redirect-to=${encodeURIComponent(window.location.pathname)}`
})

const pinia = createPinia()
const app = createApp(App).use(IonicVue, { mode: 'md' }).use(pinia).use(router)

useSessionStore(pinia)
  .load()
  .catch(showError)
  .finally(() => router.isReady().then(() => app.mount('#app')))

// caches the app's JS/CSS so it opens fast; Chrome offers "Install app" from the manifest
if (import.meta.env.PROD) registerSW({ immediate: true })
