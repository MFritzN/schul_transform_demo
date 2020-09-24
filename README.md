# 2nd-schul-transform-demo

## Project setup
```shell script
npm install
```

## Konzept
Ein Baum fungiert als Zentrale Datenstruktur. Die Knoten sind Objekte der Klasse [`PieLevel`](./src/model/PieLevel.ts). Jedem dieser Knoten ist ein [`Dataset`](./src/model/Dataset.ts) angehängt. Struktur und Aufbau des Baumes werden aus einer [`root.json`](./src/data/root.json) ausgelesen.

Jede Navigationsebende wird durch ein [`PieLevel`](./src/model/PieLevel.ts) repräsentiert. Sollten zu diesem Daten dargestellt werden, müssen diese in [`Dataset`](./src/model/Dataset.ts) sein. In der aktuellen Implementation wird Dataset automatisch mit den Werten aller Kindknoten gefüllt. Durch kleine Änderung im Konstruktor von [`PieLevel`](./src/model/PieLevel.ts), wäre hier eine Änderung zu einzelnen Datensetzen möglich.

Wenn eine Farbe in der `root.json` angegeben ist, wird diese durch [`PieLevelImport`](./src/utility/PieLevelImport.ts) in [`PieLevel`](./src/model/PieLevel.ts) übernommen, wenn nicht erbt das neue [`PieLevel`](./src/model/PieLevel.ts) die Farbe vom übergestellen [`PieLevel`](./src/model/PieLevel.ts). Möchte man also, dass sich nur Level 1 durch Farben unterscheidet und dass dann alle Unterthemen die Farbe dieses Level 1 Themas haben, gibt man nur den Level 1 PieLeveln eine Farbe.

Die Detail Charts bekommen das PieLevel, das sie darstellen sollen zur Verfügung gestellt und erstellen daraus eine Chart. [`Dataset`](./src/model/Dataset.ts) bietet hier einige Hilfsfunktionen zur Datenverarbeitung (z.B. `boxplotValues(Array<number>`).

### NavigationChart
Die Idee des NavigationChart ist, ein NaviagtionsElement aus ECharts zu bauen, welches möglichst klein ist. Jeder Ring entspricht einem [`PieLevel`](./src/model/PieLevel.ts). In `selectedPieLevels` wird die bisherige Navigation gespeichert. Wurde noch nichts ausgewählt, ist der Wert `null`. Mit `currentLevel` kann man im Array auf das aktuelle [`PieLevel`](./src/model/PieLevel.ts) zugreifen.

Mit [`PieLevel`](./src/model/PieLevel.ts)`.getSeries` kann nun die das von ECharts benötigte Objekt rekursiv aufgebaut werden. Hier werden auch die Unterschiede zwischen einem innen liegenden Ring und einem außenstehenden Ring aktualisiert. Definiert können diese zum Teil auch in der [`charSettings.json`](./src/data/chartSettings.json) werden.
### Sunburst Navigation
##### deprecated
Ähnliches Konzept wie Navigation Chart. Leider rendert der ganze Sunburst beim Hinzufügen oder entfernen von Daten neu und ist damit ungeeignet.
### Gradient Navigation
Eine Navigation ist lediglich auf zwei Level (Top- und Sublevel) möglich. Das Element ist sowohl als pie als auch als [rose](https://echarts.apache.org/en/option.html#series-pie.roseType) implementiert. Die Unterschiede sind minimal, deshalb sind sie in den getSeries Methoden [`getGradientChartData`](./src/model/PieLevel.ts) and [`onClick`](./src/components/GradientNavigation.vue) als inline Conditions implementiert.
ECharts bietet nativ keine Möglichkeit, einem Anteil eines Kuchenstücks eine Farbe zu geben. Dies geschieht durch einen harten [Farbverlauf](https://echarts.apache.org/en/option.html#series-pie.data.itemStyle.color). Hierbei ist zu beachten:
* Die Grenzen des Gradients werden über die globale width und height berechnet. Es ist deshalb hilfreich, den Pie im Zentrum des Canvas zu belassen. Radius sollte immer dem Radius des jeweiligen Kuchenstücks entsprechen.
* Bei einer Rose ändert sich der Radius einzelner Elemente, bei diesen muss der Radius des Farbverlaufs angepasst werden.

Bei einer Rose ist zusätzlich das Auswählen einzelner SubLevel möglich, dies ermöglicht das Ansprechen eines dritten Levels.

Bei einem normalen Pie sind alle Elemente vorausgewählt.
