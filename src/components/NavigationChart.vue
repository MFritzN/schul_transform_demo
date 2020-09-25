<template>
  <div>
    <h2><router-link to="/">Go Back</router-link></h2>
    <h2>Multi Level Pie as Nav Chart</h2>
    <chart
        flex
        :init-options="$store.state.initOptions"
        :options="options"
        ref="pie"
        @click="onClick"
        @pieSelectChanged="pieSelectChanged"
        style="float: left"
        class="all"
    />
    <Boxplot :pie-to-show="pieToShow" style="float: left" class="all"/>
  </div>
</template>

<style>
.all {
  width: 1000px;
  height: 1000px;
}
</style>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable no-unused-vars */

import {Component, Vue} from "vue-property-decorator";
import PieLevel from "@/model/PieLevel";
import ECharts from "vue-echarts/components/ECharts.vue";
import "echarts";
import Details from "@/components/Details.vue";

@Component({
  components: {
    Boxplot: Details,
    chart: ECharts,
  },
})
export default class NavigationChart extends Vue {

  public get pieRoot(): PieLevel {
    return this.$store.state.selectedPie[0];
  }

  public pieToShow = this.pieRoot

  public currentLevel = 0;

  public selectedPieLevels = [this.pieRoot, null, null, null, null, null]

  private options = {
    series: [
      this.selectedPieLevels[0]!.getSeries(
          this.selectedPieLevels[1]
      ),
    ],
  };

  /**
   * Event handler for a pie click, Decides if the User wants to go one level down/up or is selecting one of the outside rings.
   * If the click is located at the most outer level, all elements except the clicked one are unselected and the clicked select is toggled.
   * @event pieSelectChanged is fired by echarts when the select state changes. This invokes  {@link pieSelectChanged}.
   * @param event {@link https://echarts.apache.org/en/api.html#events.Mouse%20events.click EChats click event}
   */
  public onClick(event: any): void {
    const oldLevel = this.currentLevel;
    if (event.seriesIndex >= this.currentLevel) {
      // checks if the User wants to go deeper into the navigation
      if (
          this.selectedPieLevels[event.seriesIndex]!.children[
              event.dataIndex
              ].children.length == 0
      ) {
        // checks if the most outer level has been reached
        this.options.series[event.seriesIndex].data.forEach(
            (element: any, index: number) => {
              if (index != event.dataIndex)
                  // @ts-ignore
                this.$refs.pie.dispatchAction({
                  type: "pieUnSelect",
                  seriesIndex: event.seriesIndex,
                  dataIndex: index,
                });
            }
        );
        // @ts-ignore
        this.$refs.pie.dispatchAction({
          type: "pieToggleSelect",
          seriesIndex: event.seriesIndex,
          dataIndex: event.dataIndex,
        });
        console.log("ignoring event");
        return;
      }
      this.navToHigherLevel(oldLevel, ++this.currentLevel, event);
    } else {
      this.navToSubLevel(oldLevel, --this.currentLevel);
    }
    this.pieToShow = this.selectedPieLevels[
        this.currentLevel
        ]!;
    this.changeRouterPath();
  }

  /**
   * Navigates the pie to a higher level, does not check if the most outer ring has been reached. Has to be done before.
   * The selected pie array is refilled from 0 to newLevel
   * @see onClick
   * @param oldLevel old currentLevel, = newLevel - 1
   * @param newLevel should already be the same as currentLevel
   * @param event {@link https://echarts.apache.org/en/api.html#events.Mouse%20events.click EChats click event}
   */
  public navToHigherLevel(oldLevel: number, newLevel: number, event: any) {
    this.selectedPieLevels[newLevel] = this.selectedPieLevels[
        oldLevel
        ]!.children[event.dataIndex];
    for (let i = 0; i < this.currentLevel; i++) {
      this.options.series[i] = this.selectedPieLevels[i]!.getSeries(
          this.selectedPieLevels[i + 1]
      );
    }
    if (this.currentLevel < this.options.series.length) {
      this.options.series.splice(newLevel);
    }
    this.options.series.push(
        this.selectedPieLevels[this.currentLevel]!.getSeries(
            this.selectedPieLevels[this.currentLevel + 1]
        )
    );
  }

  /**
   * Navigates the pie one sub level down, does not check if the most outer ring has been reached. Has to be done before.
   * Refitting this method to cover more than a one level jump is possible.
   * The selected pie array is refilled from 0 to newLevel.
   * @param oldLevel
   * @param newLevel
   */
  public navToSubLevel(oldLevel: number, newLevel: number) {
    this.selectedPieLevels = this.selectedPieLevels.map(
        (element: PieLevel | null, index: number) =>
            index > newLevel ? null : element
    );
    this.options.series[oldLevel].data = [];
    this.options.series[newLevel] = this.selectedPieLevels[
        newLevel
        ]!.getSeries(this.selectedPieLevels[newLevel + 1]);
    this.options.series.splice(oldLevel + 1);
    console.log(this.options.series);
  }

  /**
   * Updates the router path, taking selectedPie[0 to currentLevel] as reference. disabled.
   * @param selected is added at the end. Use it if something is missing in selectedPie
   */
  public changeRouterPath(selected?: string): void {
    let path = "/sub/";
    this.selectedPieLevels.forEach(
        (element: PieLevel | null, index: number) => {
          if (element != null && index <= this.currentLevel)
            path += "," + element.name;
        }
    );
    if (selected) path += "," + selected;
    //Just visual. The Pie can't load from a path!: this.$router.push(path);
  }

  /**
   * Checks which part of the pie has been selected, by filtering the event.
   * If a new element is selected it is added to selectedPie at selectedPie[currentLevel + 1].
   * If a element is unselected and no new selected, selectedPie[currentLevel + 1] is set to null.
   * Calls {@link changeRouterPath} and adds the selected element
   * @param event {@link https://echarts.apache.org/en/api.html#events.pieselectchanged ECarts Event}
   */
  public pieSelectChanged(event: any): void {
    const selectedName: string = Object.keys(event.selected).filter(
        (key) => event.selected[key]
    )[0];
    this.changeRouterPath(selectedName);
    if (selectedName) {
      this.selectedPieLevels[
      this.currentLevel + 1
          ] = this.selectedPieLevels[
          this.currentLevel
          ]!.children.filter((element: PieLevel) => element.name == selectedName)[0];
      this.pieToShow = this.selectedPieLevels[
      this.currentLevel + 1
          ]!;
    } else {
      this.selectedPieLevels[this.currentLevel + 1] = null;
      this.pieToShow = this.selectedPieLevels[
          this.currentLevel
          ]!;
    }
  }

  public stringify(): void {
    console.log(JSON.stringify(this.$store.state.selectedPie[0]))
  }
}
</script>
