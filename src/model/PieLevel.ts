/* eslint-disable no-unused-vars */

import Data from "./Data";
import Dataset from "@/model/Dataset";
import DataElement from "@/model/DataElement";
import setting from "@/data/chartSettings.json"
import set = Reflect.set;

/**
 * Defines one level in the Navigation Pie.
 * Since the whole structure of the navigation Pie is based on a tree, each PieLevel Object works as a tree node.
 *
 * Developed into to a full Tree Node with methods for all included Nav Charts.
 */
export default class PieLevel {
  /** Used by NavigationChart only */
  public parentMinRadius: number;
  /** Used by NavigationChart only */
  public radiusMin: Array<number>;
  /** Used by NavigationChart only */
  public radiusMax: Array<number>;
  /** Used by Navigation Chart only
   * current Radius of this Level. */
  public radius: Array<string>;
  /** Used by all Charts */
  public name: string;
  /** @see getAverage */
  public value: number;
  /** Used by all Charts. */
  public color: string;
  /** Used by all Charts. */
  public children: Array<PieLevel>;
  /** Used by all Charts. */
  public sourceData?: Dataset

  /**
   * @param name Displayed name. Is also used as ID by some components.
   * @param color
   * @param parentMinRadius Only needed for Navigation Chart. Radius from the center to the outside of the minimized ring of the parent.
   * @param children
   * @param sourceData Give this to most outer levels. Inside levels will compute this by themselves. You can change this behaviour by editing the constructor.
   */
  constructor(name: string, color: string, parentMinRadius: number, children: Array<PieLevel>, sourceData?: Dataset) {
    this.parentMinRadius = parentMinRadius;
    this.name = name;
    this.color = color;
    if (this.parentMinRadius) {
      this.radiusMax = [this.parentMinRadius + setting.NavigationChart.gapToOutsideRingRadius, this.parentMinRadius + setting.NavigationChart.gapToOutsideRingRadius + setting.NavigationChart.outsideRingRadius];
      this.radiusMin = [this.parentMinRadius, this.parentMinRadius + setting.NavigationChart.insideRingRadius];
    } else { //PieLevel is PieRoot
      this.radiusMax = [0, setting.NavigationChart.centerElementRadius.max]
      this.radiusMin = [0, setting.NavigationChart.centerElementRadius.min]
    }
    this.radius = [this.radiusMax[0] + "%", this.radiusMax[1] + "%"];
    this.children = children;
    if (sourceData) this.sourceData = sourceData;
    else this.sourceData = new Dataset(this.getDataElements());
    if (this.sourceData.sourceData.length) this.value = this.getAverage();
    else this.value = 0;
  }

  /**
   * removes all keys from the {@link children} array except value and name. If useValueForAngle in {@link setting charSettings} is false, 100 is taken for all values.
   * @see getSeries
   * @returns an array of data objects built from value and name
   */
  public getData(): Array<Data> {
    if (setting.NavigationChart.useValueForAngle) return this.children.map(child => new Data(child.value, child.name));
    return this.children.map(child => new Data(100, child.name))
  }

  /**
   * removes all keys from the {@link children} array except color
   * @see getSeries
   * @returns an array of color strings corresponding to the children's colors
   */
  public getColor(): Array<string> {
    return this.children.map(child => child.color);
  }

  /**
   * Returns the series needed by an {@link https://echarts.apache.org/en/option.html#series-pie ECharts Pie}.
   * @param lowerSelected if inner ring, the subLevel selected on this level (is needed to take it's color and label). Null if this is the most outer level.
   * @returns the pieSeries of the pieLevel Object it is invoked on.
   */
  public getSeries(lowerSelected: PieLevel | null, group?: string): any {
    if (this.children.length > 0 && lowerSelected instanceof PieLevel) {
      //inner ring
      return {
        name: this.name,
        type: 'pie',
        data: [new Data(lowerSelected.value, lowerSelected.name)],
        color: [lowerSelected.color],
        radius: [this.radiusMin[0] + "%", this.radiusMin[1] + "%"],
        hoverAnimation: false,
        selectedMode: false,
        itemStyle: {
          borderWidth: 1,
          borderColor: "#fff",
        },
        label: {
          position: "inside",
          show: false,
        }
      }
    }
    //outer ring
    return {
      name: this.name,
      hoverAnimation: true,
      itemStyle: {
        borderWidth: 1,
        borderColor: "#fff",
      },
      type: 'pie',
      data: this.getData(),
      color: this.getColor(),
      radius: [this.radiusMax[0] + "%", this.radiusMax[1] + "%"],
      selectedMode: false,
      label: {
        show: true,
        position: "outside",
        formatter: "  {b|{b}}  ",
        backgroundColor: "#eee",
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 4,
        rich: {
          a: {
            color: "#999",
            lineHeight: 22,
            align: "center",
          },
          hr: {
            borderColor: "#aaa",
            width: "100%",
            borderWidth: 0.5,
            height: 0,
          },
          b: {
            fontSize: 16,
            lineHeight: 33,
          },
          per: {
            color: "#eee",
            backgroundColor: "#334455",
            padding: [2, 4],
            borderRadius: 2,
          },
        },
      },
    }
  }

  /**
   * Maps all children of a {@link PieLevel} to a {@link https://echarts.apache.org/en/option.html#series-sunburst.data series-sunburst.data} Object.
   * @param pieLevel The PieLevel whose children are mapped.
   * @param remainingDepth depth of the children to be mapped. Recursion will stop when this param is casted to false. So don't use undefined.
   * @returns A data an Array of Objects of style: {name: string, value: number, children: Array<dataObject>/[]}
   */
  public mapSunburstSeries(pieLevel: PieLevel, remainingDepth: number): Array<any> {
    console.log("Helper Function: " + remainingDepth);
    return pieLevel.children.map(child => {
      return {
        name: child.name,
        value: child.value ? child.value : 20,
        children: remainingDepth ? this.mapSunburstSeries(child, remainingDepth - 1) : [],
      }
    })
  }

  /**
   * Goes recursively through the children of all PieLevels, starting at selectedPie[0] and reading name, value and children.
   * @returns a {@link https://echarts.apache.org/en/option.html#series-sunburst SunBurst Series}
   */
  public getSunburstSeries(currentLevel: number, additionalDepth: number): any {
    return {
      type: "sunburst",
      data: this.mapSunburstSeries(this, additionalDepth + currentLevel),
      radius: ["0%", "100%"],
    }
  }

  /**
   * Computes the data for rose and pie (same return). Gradient computation happens here.
   * @param standardPieAngleValue Same as {@link GradientNavigation.vue.value}
   * @param width width of the whole chart container, used to compute the gradient
   * @param height height of the whole chart container, used to compute the gradient
   * @param greyCode outside color
   * @param group Only use data from one group.
   * @returns {@link https://echarts.apache.org/en/option.html#series-pie.data ECharts series-pie.data}
   */
  public getGradientChartData(standardPieAngleValue: number, width: number, height: number, greyCode: string, group?: string): Array<any> {
    return this.children.map(child => {
      return {
        value: standardPieAngleValue,
        name: child.name,
        itemStyle: {
          color: {
            type: "radial",
            x: width / 2,
            y: height / 2,
            r: Math.min(width, height) / 4, //min of width and height / 4 is the radius of the pie chart, because radius (~diameter) [0% - 50%] in options
            colorStops: [{
              offset: 0, color: child.color
            }, {
              offset: child.getAverage(group) / 100, color: child.color
            }, {
              offset: child.getAverage(group) / 100, color: greyCode
            }, {
              offset: 1, color: greyCode
            }, {
              offset: 1, color: child.color
            },],
            global: true,
          }
        }
      }
    })
  }

  /**
   * Gets all Data Elements from all children recursively.
   * If sourceData is already available in a PieLevel, the method will use it and avoid computing it from scratch.
   * @private
   */
  private getDataElements(): Array<DataElement> {
    if (this.sourceData) return this.sourceData.sourceData;
    const res = [] as Array<DataElement>;
    return res.concat(...this.children.map(child => child.getDataElements()));
  }

  /**
   * This is just a shortcut, since the normal function calls would be pretty long.
   * @see Dataset
   */
  public getAverage(group?: string): number {
    return Dataset.computeAverage(this.sourceData!.getAnswers(undefined, group));
  }


  /**
   * Returns options for the {@link @/components/Details.vue Details} Component.
   * If this has no children, a similar function in {@link @/src/model/Dataset Dataset} is called which returns Data sorted to single Question Tags instead of PieLevel.children names.
   * @see getAllOptions
   */
  public getAllDetails(): any {
    if (!this.children.length) {
      return this.sourceData?.getAllOptions();
    }
    const res = {
      title: {
        text: "Radar and Boxplot",
      },
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: ["Durchschnitt"].concat(this.sourceData!.groupTags),
      },
      grid: {
        left: "5%",
        right: "5%",
        top: "50%",
        bottom: "20%"
      },
      xAxis: [
        {
          type: "category",
          data: this.children.map(child => child.name),
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: true,
          },
          axisLabel: {
            formatter: "{value}",
          },
          splitLine: {
            show: false,
          },
          gridIndex: 0,
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "value",
          splitArea: {
            show: false,
          },
          min: 0,
          max: 100,
          gridIndex: 0,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 20
        },
        {
          show: true,
          height: 20,
          type: 'slider',
          top: '90%',
          xAxisIndex: [0],
          start: 0,
          end: 20
        }
      ],
      radar: {
        name: {
          show: true,
          position: "outside",
          formatter: "  {b|{value}}  ",
          backgroundColor: "#eee",
          borderColor: "#aaa",
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            a: {
              color: "#999",
              lineHeight: 22,
              align: "center",
            },
            hr: {
              borderColor: "#aaa",
              width: "100%",
              borderWidth: 0.5,
              height: 0,
            },
            b: {
              fontSize: 16,
              lineHeight: 33,
            },
            per: {
              color: "#eee",
              backgroundColor: "#334455",
              padding: [2, 4],
              borderRadius: 2,
            },
          },
        },
        indicator: this.children.map(child => {
          return {name: child.name, max: 100, color: child.color}
        }),
        center: ["50%", "25%"],
        radius: "30%",
      },
      series: [
        {
          name: "Radar",
          type: "radar",
          data: [
            {
              name: "Durchschnitt",
              value: this.children.map(child => Dataset.computeAverage(child.sourceData!.getAnswers())),
            }
          ],
        },
        {
          name: "Durchschnitt",
          type: "boxplot",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: this.children.map(child => child.sourceData!.boxplotValues(child.sourceData!.getAnswers())),
          tooltip: {formatter: this.sourceData!.boxplotFormatter},
        }
      ] as Array<any>,
    }
    const self = this;
    this.sourceData!.groupTags.forEach(group => {
      res.series[0].data.push({
        name: group,
        value: self.children.map(child => Dataset.computeAverage(child.sourceData!.getAnswers(undefined, group))),
      });
      res.series.push({
        name: group,
        type: "boxplot",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: self.children.map(child => self.sourceData!.boxplotValues(child.sourceData!.getAnswers(undefined, group))),
        tooltip: {formatter: self.sourceData!.boxplotFormatter},
      })
    });
    res.series.push(res.series.shift());
    return res;
  }
}
