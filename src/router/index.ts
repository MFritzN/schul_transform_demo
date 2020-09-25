import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import GradientNavigation from "@/components/GradientNavigation.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/gradientnavigation',
    name: 'GradientNavigation',
    component: GradientNavigation
  },
  {
    path: '/navigationchart',
    name: 'NavigationChart',
    component: () => import('@/components/NavigationChart.vue')
  },
  {
    path: '/',
    name: 'home',
    component: () => import ('@/components/HelloWorld.vue')
  },
  {
    path: '/sunburstNavigation',
    name: 'SunburstNavigation',
    component: () => import ('@/components/NavigationSunburst.vue')
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
