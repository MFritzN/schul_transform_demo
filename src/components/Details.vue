<template>
  <div>
    <h2>Details / {{pieToShow.name}}</h2>
    <chart
        flex
        :options="options"
        :init-options="$store.state.initOptions"
        ref="boxplot"
        class="boxplot"
    />
<!--    <button @click="highlight">highlight</button>-->
<!--    <li v-for="item in rawArray" :key="item">{{ item }}</li>-->
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable no-unused-vars */

import ECharts from "vue-echarts/components/ECharts.vue";
import {Component, Vue, Prop, Watch} from "vue-property-decorator";
import "echarts";
import PieLevel from "@/model/PieLevel";

@Component({
  components: {
    chart: ECharts,
  },
})
export default class Details extends Vue {

  @Prop() pieToShow!: PieLevel;

  public options = this.pieToShow.getAllDetails();

  get sourceData () {
    return this.pieToShow.sourceData;
  }

  public highlight(): void { // @ts-ignore
    this.$refs.radar.dispatchAction({ type: "highlight", dataIndex: 1 });
  }

  @Watch("pieToShow")
  pieToShowAdjust (newPieToShow: PieLevel) { //@ts-ignore
    this.options = newPieToShow.getAllDetails();
  }
}
</script>
<style scoped>
.boxplot {
  float: left;
}
.radar {
  float: left;
}
</style>
