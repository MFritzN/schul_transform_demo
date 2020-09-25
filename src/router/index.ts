import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import NavigationChart from "@/components/NavigationChart.vue";
import GradientNavigation from "@/components/GradientNavigation.vue";
import HelloWorld from "@/components/HelloWorld.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'GradientNavigation',
    component: GradientNavigation
  },
  {
    path: '/navigationchart',
    name: 'NavigationChart',
    component: () => import('@/components/NavigationChart.vue')
  },
  {
    path: '/home',
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
