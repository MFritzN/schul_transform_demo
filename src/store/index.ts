import Vue from 'vue'
import Vuex from 'vuex'
import PieLevelImport from "@/utility/PieLevelImport";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    displayedDetails: null,
    currentLevel: 0,
    visibleLevel: 100 as number,
    initOptions: {
      renderer: "canvas",
      width: "1000",
      height: "1000"
    },
    selectedPie: [PieLevelImport.getRootPie(), null, null, null, null, null, null],
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
