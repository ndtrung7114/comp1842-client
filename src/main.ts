import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { authentication } from './plugins/authentication'
import { socketPlugin } from './plugins/socket'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import "bootstrap"
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)

app.use(createPinia())
app.use(socketPlugin)

authentication.install().then(()=>{
  app.use(router)
  app.mount('#app') 
})