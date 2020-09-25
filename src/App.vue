<template>
  <div id="app">
    <h1> Schultransform Demo </h1>
    <router-view style="width: 1000px"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import GradientNavigation from "@/components/GradientNavigation.vue";
import NavigationChart from "@/components/NavigationChart.vue";

@Component({
  components: {
    NavigationChart,
    GradientNavigation,
  }
})
export default class App extends Vue{
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
