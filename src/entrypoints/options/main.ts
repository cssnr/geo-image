import { createApp } from 'vue'
import { bootstrapDirective } from '@/utils/bootstrapDirective.ts'
import App from './App.vue'
import '@/main.ts'
import './style.css'

const app = createApp(App)
app.directive('bs', bootstrapDirective)
app.mount('#app')
