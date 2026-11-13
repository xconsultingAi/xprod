import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/expense', name: 'expense', component: () => import('@/views/ExpenseView.vue') },
  { path: '/income', name: 'income', component: () => import('@/views/IncomeView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

// Frappe serves the app at /xprod (see website_route_rules in hooks.py)
export default createRouter({
  history: createWebHistory('/xprod'),
  routes
})
