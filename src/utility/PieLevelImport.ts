// eslint-disable-next-line no-unused-vars
import DataElement from "@/model/DataElement";
import PieLevel from "@/model/PieLevel";
import json from "@/data/root.json"
import Dataset from "@/model/Dataset";
import settings from "@/data/chartSettings.json"

interface ChartSettingsJSON {
  NavigationChart: {
    centerElementRadius: { max: number, min: number },
    gapToOutsideRingRadius: number,
    outsideRingRadius: number,
    insideRingRadius: number,
    useValueForAngle: boolean
  };
}

interface PieLevelJSON {
  name: string;
  color?: string;
  children: Array<PieLevelJSON>;
  sourceData?: Array<DataElement>;
}

export default class PieLevelImport {
  /**
   * @param input Object from the JSON File
   * @param parentMinRadius
   * @param color
   * @private
   */
  private static buildPie(input: PieLevelJSON, parentMinRadius: number, color: string): PieLevel {
    if (input.color) color = input.color;
    if (input.sourceData) return new PieLevel(input.name, color, parentMinRadius, input.children.map(childJSON => PieLevelImport.buildPie(childJSON, parentMinRadius + settings.NavigationChart.insideRingRadius, color)), new Dataset(input.sourceData));
    return new PieLevel(input.name, color, parentMinRadius, input.children.map(childJSON => PieLevelImport.buildPie(childJSON, parentMinRadius + settings.NavigationChart.insideRingRadius, color)));
  }

  /**
   * Creates the Pie Level tree Structure.
   * @returns rootPie
   */
  public static getRootPie(): PieLevel {
    return new PieLevel(json.name, json.color, 0, json.children.map(childJSON => PieLevelImport.buildPie(childJSON, settings.NavigationChart.centerElementRadius.min, "red")));
  }
}
