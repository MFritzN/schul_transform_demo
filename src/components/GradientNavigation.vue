<template>
  <div>
    <h2>
      <router-link to="/">Go Back</router-link>
    </h2>
    <h2> Gradient Navigation </h2>
    <label> ChartType:
      <select name="chartType" v-model="chartType">
        <option>pie</option>
        <option>rose</option>
      </select>
    </label>
    <label> ShowLabel:
      <select name="ShowLabel" v-model="labelDisplayHtml">
        <option>off</option>
        <option>on</option>
      </select>
    </label>
    <label> GroupToShow:
      <select v-model="groupToShow">
        <option v-for="group in pieRoot.sourceData.groupTags" :key="group">
          {{group}}
        </option>
        <option>total</option>
      </select>
    </label>
    Reset/Zurück: <button @click="rerender"> reset </button>
    <chart
      :options="options"
      ref="pie"
      flex
      @click="onClick"
      @legendselectchanged="legendSelectHandler"
      style="height: 1000px"
      :init-options="initOptions"
    />
    <Boxplot v-if="pieToShow.sourceData.sourceData.length" :pie-to-show="pieToShow"/>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */

import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'echarts'
import Details from "@/components/Details.vue";
import PieLevel from '@/model/PieLevel';

const GREYCODE = "#e0e0e0";

@Component({
  components: {
    Boxplot: Details,
    chart: ECharts
  }
})
export default class GradientNavigation extends Vue {

  public labelDisplayHtml = "on";

  @Watch("labelDisplayHtml")
  public labelDisplayHandler (newValue: String) {
    console.log("...")
    this.options.series[0].label.show = newValue == "on";
    this.options.series[0].labelLine.show = newValue == "on";
  }

  public pieToShow = this.pieRoot;

  public groupToShow = "total";

  public chartType = "pie";

  /**
   * Index of the selected top level. If nothing is selected -1.
   */
  public dataClickedOn = -1;

  @Prop({default: 1000})
  height!: number;

  @Prop({default: 1000})
  width!: number;

  /**
   * Values the Chart uses. Rose increases this by 20% for displaying sublevels.
   * Just consider that the Sublevel Elements use a value of value / pieRoot.children[sublevel].children.length so value should be big enough that it can be devided without losing to much information.
   */
  @Prop({default: 1024})
  value!: number;

  public initOptions = {
    renderer: "canvas",
    height: this.height,
    width: this.width,
  }

  public options = this.getOptions();

  /**
   * Gets the options for a rose or pie. Which one to create is decided by inline conditions since the differences are marginal.
   * Notice that this is a normal method, no computed property to avoid rerendering of the chart all the time.
   * {@link https://echarts.apache.org/en/option.html#series-pie.data data} is calculated by {@link PieLevel.getGradientChartData}
   * @returns {@link https://echarts.apache.org/en/option.html ECharts Options}, containing one {@link https://echarts.apache.org/en/option.html#series-pie pie-series}
   */
  public getOptions(): any {
    return {
      legend: {
        orient: "horizontal",
        bottom: "0%",
        selectedMode: "false",
      },
      series: [
        {
          name: "TNavChart",
          type: "pie",
          roseType: this.chartType == "rose" ? "area" : undefined,
          radius: ["0%", "50%"],
          selectedMode: false,
          label: {
            show: true,
          },
          labelLine: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: "#fff"
          },
          data: this.$store.state.selectedPie[0]?.getGradientChartData(this.value, this.width, this.height, GREYCODE, this.groupToShow != "total" ? this.groupToShow : undefined),
        }
      ]
    }
  }

  /**
   * Watcher for the chart type selection. Forces reset if the chart type changes.
   * @see getOptions
   */
  @Watch("chartType")
  public chartTypeChangedHandler() {
    this.rerender();
  }

  @Watch("groupToShow")
  public groupToShowChangedHandler() {
    this.rerender();
  }

  public rerender() {
    this.options = this.getOptions();
    this.dataClickedOn = -1;
  }

  public get pieRoot(): PieLevel {
    return this.$store.state.selectedPie[0];
  }

  public debug() {
    console.log(this.$refs.pie);
  }

  /**
   * Goes deeper into detail.
   * This method covers the reaction for a pie as well as a rose, this is done by two inline conditions.
   * The main difference is the gradient radius as well as the normal date value, which have to be adopted to get the defining radius.
   * @param event {@link https://echarts.apache.org/en/api.html#events.Mouse%20events.click EChats click event}
   */
  public onClick(event: any) {
    console.log(event);
    if (this.dataClickedOn >= 0 && this.detailedIndices.includes(event.dataIndex)) {
      this.subtopicClickHandler(event);
      return;
    } else {
      //console.assert(!!this.pieRoot.children[event.dataIndex].children.length, "The program tries to access children of an Element without children. Check if all level 0 elements have children. Behaviour undefined.")
      if (this.dataClickedOn >= 0) event.dataIndex = this.undoLastSelection(event);
      const clickedPieLevelChildren = this.pieRoot.children[event.dataIndex].children;
      this.options.series[0].data.splice(
        event.dataIndex,
        1,
        ...clickedPieLevelChildren
          .map((child: PieLevel) => {
              return {
                selected: this.chartType != "rose",
                value: this.chartType != "rose" ? this.value / clickedPieLevelChildren.length : this.value * 1.2,
                name: child.name,
                itemStyle: {
                  color: {
                    type: "radial",
                    x: this.width / 2,
                    y: this.height / 2,
                    r: Math.min(this.width, this.height) / 4,
                    colorStops: [{
                      offset: 0, color: child.color
                    }, {
                      offset: child.getAverage(this.groupToShow != "total" ? this.groupToShow : undefined) / 100, color: child.color
                    }, {
                      offset: child.getAverage(this.groupToShow != "total" ? this.groupToShow : undefined) / 100, color: GREYCODE
                    }, {
                      offset: 1, color: GREYCODE
                    }, {
                      offset: 1, color: child.color
                    },],
                    global: true //Use Global Coords, meaning the radial gradient is placed around the global center of the pie, because x and y are the global coordinates
                  }
                }
              }
            }
          )
      );
      this.dataClickedOn = event.dataIndex;
      this.pieToShow = this.pieRoot.children[event.dataIndex];
      if (this.chartType == "rose") this.options.series[0].data.forEach((element: any, index: number) => {
        if (!this.detailedIndices.includes(index)) element.itemStyle.color.r = (Math.min(this.width, this.height) / 4) / 1.2
      });
    }
  }

  /**
   * If the user clicks on a sublevel element, this function is called by {@link onClick}.
   * select of the current element is toggled. All other pie elements (including top Level) are unselected.
   * @param event {@link https://echarts.apache.org/en/api.html#events.Mouse%20events.click EChats click event}
   * @private
   */
  private subtopicClickHandler(event: any) {
    this.options.series[0].data[event.dataIndex].selected = !this.options.series[0].data[event.dataIndex].selected
    this.options.series[0].data.forEach((element: any, index: number) => {
      if (index != event.dataIndex) element.selected = false;
    })
    const index = this.options.series[0].data.find((element: any) => element.selected);
    if (index != undefined) {
      //Something was selected
      this.pieToShow = this.pieRoot.children[this.dataClickedOn].children[event.dataIndex - this.dataClickedOn];
    } else this.pieToShow = this.pieRoot.children[this.dataClickedOn];
  }

  /**
   * Restores the last selected top level to its original form.
   * Does only use global variables.
   */
  public undoLastSelection(event: any): number {
    this.options.series[0].data?.splice(
      this.dataClickedOn,
      this.detailedIndices.length,
      this.pieRoot.getGradientChartData(
        this.value,
        this.width,
        this.height,
        GREYCODE
      )[this.dataClickedOn]
    );
    if (event.dataIndex > this.dataClickedOn) event.dataIndex -= this.detailedIndices.length - 1;
    this.dataClickedOn = -1;
    return event.dataIndex;
  }

  /**
   * @returns All Indices which are part of the currently selected top Level. If none is selected an empty Array is returned. Indices correspond to the {@link PieLevel.children children} indices.
   */
  public get detailedIndices() {
    if (this.dataClickedOn < 0) return [];
    const res = [] as Array<number>
    if (this.pieRoot.children[this.dataClickedOn].children.length) this.pieRoot.children[this.dataClickedOn].children.forEach((_elem, index) => res.push(index + this.dataClickedOn));
    else res.push(this.dataClickedOn)
    return res;
  }

  public legendSelectHandler(event:any) {
    this.options.animation = false;
    const selected = event.name;
    this.options.legend.selected[selected] = true;
    this.options.animation = true;
  }
}
</script>

<style scoped>

</style>
