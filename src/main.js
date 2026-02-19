import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Timeline from './views/Timeline.vue'
import News from './views/News.vue'
import Analyses from './views/Analyses.vue'
import Trades from './views/Trades.vue'
import Positions from './views/Positions.vue'
import Portfolio from './views/Portfolio.vue'
import './style.css'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/timeline', component: Timeline, name: 'Timeline' },
  { path: '/news', component: News, name: 'News' },
  { path: '/analyses', component: Analyses, name: 'Analyses' },
  { path: '/trades', component: Trades, name: 'Trades' },
  { path: '/positions', component: Positions, name: 'Positions' },
  { path: '/portfolio', component: Portfolio, name: 'Portfolio' }
]

const router = createRouter({
  history: createWebHashHistory('/PanoptiCo-Dashboard.github.io/'),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
