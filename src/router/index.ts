import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import NavigationChart from "@/components/NavigationChart.vue";
import GradientNavigation from "@/components/GradientNavigation.vue";
import HelloWorld from "@/components/HelloWorld.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'HelloWorld',
    component: HelloWorld
  },
  {
    path: '/navigationchart',
    name: 'NavigationChart',
    component: () => import('@/components/NavigationChart.vue')
  },
  {
    path: '/gradientnavigation',
    name: 'GradientNavigation',
    component: () => import ('@/components/GradientNavigation.vue')
  },
  {
    path: '/sunburstNavigation',
    name: 'SunburstNavigation',
    component: () => import ('@/components/NavigationSunburst.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
