/* eslint-disable no-unused-vars */
import DataElement from './DataElement';

/* eslint-disable @typescript-eslint/no-explicit-any */


/**
 * Dataset contains all the Data for one PieLevel Element.
 */
export default class Dataset {
  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  public sourceData: Array<DataElement>;
  public questionTags: Array<string>;
  public groupTags: Array<string>;

  /**
   * sets {@link questionTags} and {@link groupTags} by searching in sourceData for different tags. This might not be that effective but makes the programs data input very flexible.
   * @param sourceData Array of DataElements. questionTags and groupTags aren't defined at a separate place.
   */
  public constructor(sourceData: Array<DataElement>) {
    this.sourceData = sourceData;
    const myQuestionSet: Set<string> = new Set();
    const myGroupSet: Set<string> = new Set();
    this.sourceData.forEach(element => {
      myQuestionSet.add(element.questionTag);
      myGroupSet.add(element.group);
    });
    this.questionTags = Array.from(myQuestionSet);
    this.groupTags = Array.from(myGroupSet);
  }


  /**
   * filters {@link sourceData} for one group and removes the group key from the object
   * @param group
   */
  public getGroupData(group: string) {
    return this.sourceData
      .filter(element => element.group == group)
      .map(element => {
        return {questionTag: element.questionTag, answer: element.answer}
      });
  }

  /**
   * filters {@link sourceData} for one question and removes the question key from the object
   * @param question
   */
  public getQuestionData(question: string) {
    return this.sourceData
      .filter(element => element.questionTag == question)
      .map(element => {
        return {group: element.group, answer: element.answer}
      });
  }

  /**
   * Computes average from a number array
   * @param array
   */
  public static computeAverage(array: Array<number>) {
    if (array.length == 0) return 0;
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

  /**
   * Gets you the answers you need. By filtering and removing keys.
   * @param questionTag optional filter
   * @param group optional filter
   * @returns an array which only contains answers
   */
  public getAnswers(questionTag?: string, group?: string) {
    let res = this.sourceData;
    if (questionTag) res = res.filter(element => element.questionTag == questionTag);
    if (group) res = res.filter(element => element.group == group);
    if (res.length < 1) console.log("Couldn't find question tag in sourceData");
    return res.map(element => element.answer);
  }

  /**
   * @param data must be sorted
   * @returns the median value of the array
   * @private method is used by boxplotValues()
   * @see boxplotValues
   */
  private getMedian(data: Array<number>): number {
    const length = data.length;
    return length % 2 ? data[(length - 1) / 2] : (data[length / 2 - 1] + data[length / 2]) / 2;
  }

  /**
   * Creates the data value for boxplot-series
   * @param data just numbers.
   * @returns Array of length 5 and layout: [min, q1, median, q2, max]
   * @see https://echarts.apache.org/en/option.html#series-boxplot.data ECharts Documentation
   */
  public boxplotValues(data: Array<number>): Array<number> {
    data = data.sort((a, b) => a - b);
    const length = data.length;
    const median = this.getMedian(data);
    const elementsToSlice = length % 2 ? (length - 1) / 2 : length / 2;
    const q1 = this.getMedian(data.slice(0, elementsToSlice));
    const q2 = this.getMedian(data.slice(-elementsToSlice));
    return [data[0], q1, median, q2, data[length - 1]];
  }

  /**
   * @see https://echarts.apache.org/en/option.html#series-boxplot.tooltip.formatter ECharts Docs
   * @param param
   */
  public boxplotFormatter(param: any): any {
    return [
      "Max " + param.name + ": ",
      "Max: " + param.data[5],
      "Q2: " + param.data[4],
      "median: " + param.data[3],
      "Q1: " + param.data[2],
      "Min: " + param.data[1],
    ].join("<br/>");
  }

  /**
   * @returns ECharts Options for a Boxplot mapped by Dataset
   */
  public getBoxplotOptions() {
    const res = {
      title: {
        text: "Details.vue",
      },
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: [
        {
          type: "category",
          data: this.questionTags,
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
      legend: {
        top: "10%",
        data: ["total"].concat(this.groupTags),
      },
      series: [{
        name: "total",
        type: "boxplot",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: this.questionTags.map(question => this.boxplotValues(this.getAnswers(question))),
        tooltip: {formatter: this.boxplotFormatter},
      }]
    }
    this.groupTags.forEach(group => {
      res.series.push({
        name: group,
        type: "boxplot",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: this.questionTags.map(question => this.boxplotValues(this.getAnswers(question, group))),
        tooltip: {formatter: this.boxplotFormatter},
      })
    });
    return res;
  }

  /**
   * @returns ECharts Options for a Radar mapped by Dataset
   */
  public getRadarOptions() {
    const res = {
      title: {
        text: "Radar",
      },
      tooltip: {},
      legend: {
        data: ["total"].concat(this.groupTags),
      },
      radar: {
        name: {
          textStyle: {
            color: "#fff",
            backgroundColor: "#999",
            borderRadius: 3,
            padding: [3, 5],
          },
        },
        indicator: this.questionTags.map(question => {
          return {name: question, max: 100}
        }),
      },
      series: [
        {
          name: "Principals vs Teachers",
          type: "radar",
          data: [{
            name: "total",
            value: this.questionTags.map(question => Dataset.computeAverage(this.getAnswers(question))),
          }]
        },
      ],
    };
    this.groupTags.forEach(group => res.series[0].data.push({
      name: group,
      value: this.questionTags.map(question => Dataset.computeAverage(this.getAnswers(question, group))),
    }))
    return res;
  }

  /**
   * Get combined options for a Radar and a Boxplot.
   * Layout is done by grid and radar.center. This is not reactive. Use a query for that.
   * @returns options including two series'. Legend is taken from boxplot and shared with radar series.
   */
  public getAllOptions() {
    const radarOptions = this.getRadarOptions();
    const boxplotOptions = this.getBoxplotOptions();
    const series = boxplotOptions.series; //@ts-ignore
    radarOptions.radar.center = ["70%", "50%"]; //@ts-ignore
    radarOptions.radar.radius = "40%"; // @ts-ignore
    series.push(radarOptions.series[0]);
    return {
      title: {
        text: "Radar and Boxplot",
      },
      tooltip: boxplotOptions.tooltip,
      xAxis: boxplotOptions.xAxis,
      yAxis: boxplotOptions.yAxis,
      legend: boxplotOptions.legend,
      dataZoom: boxplotOptions.dataZoom,
      radar: radarOptions.radar,
      series: series,
      grid: {
        left: "5%",
        right: "60%",
        top: "60%",
        bottom: "60%"
      },
    }
  }
}
