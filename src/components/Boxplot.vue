<template>
  <div>
    <h2>Details</h2>
    <chart
        flex
        :options="allOptions"
        :init-options="$store.state.initOptions"
        ref="boxplot"
    />
<!--    <button @click="highlight">highlight</button>-->
<!--    <li v-for="item in rawArray" :key="item">{{ item }}</li>-->
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */

import ECharts from "vue-echarts/components/ECharts.vue";
import { Component, Vue, Prop } from "vue-property-decorator";
import "echarts";
import PieLevel from "@/model/PieLevel";

@Component({
  components: {
    chart: ECharts,
  },
})
export default class Boxplot extends Vue {
  public sourceData = this.$store.state.displayedDetails.sourceData;
  get allOptions() {
    return this.$store.state.displayedDetails!.sourceData.getAllOptions();
  }
  get pieToShow(): PieLevel {
    return this.$store.state.selectedPie[this.$store.state.currentLevel + 1];
  }

  @Prop() readonly rawArray!: Array<string>;

  public highlight(): void { // @ts-ignore
    this.$refs.radar.dispatchAction({ type: "highlight", dataIndex: 1 });
  }
}
</script>
<style scoped>
.boxplot {
  float: right;
}
.radar {
  float: left;
}
</style>
