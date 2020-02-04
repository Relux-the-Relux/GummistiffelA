<template>
    <div id="app">

        <section>
            <div id="map">
                <MapComponent
                    :areas="areas"
                    :detail-area-one="firstSelection"
                    :detail-area-two="secondSelection"
                    v-on:area-updated="onPolygonUpdated"
                    v-on:contextmenu.prevent="openMapMenu"
                    v-on:area-removed="onAreaRemoved"
                    v-on:compare-area="onCompareArea"
                    v-on:remove-compare-area="onRemoveCompareArea"
                    v-on:polygon-finished="onPolygonFinished"></MapComponent>
                <ModeSwitch class="toggle-switch"
                            value-left="Übersicht"
                            value-right="Detail"
                            :active-value="activeMode"
                            v-on:on-button-clicked="onToggleClicked"/>
                <canvas class="color-scale" id="colorScaleCanvas"/>
                <div class="max-color-scale-label">{{selectedMetricMax}}</div>
                <div class="min-color-scale-label">{{selectedMetricMin}}</div>
            </div>
            <div id="graphs">
                <div id="overview-graphs" v-if="activeMode === 'left-button'">
                    <StandardGraph class="graph" id="intensity" title="Durchschnittliche Intensität" yaxis-title="SI" :data="intensityData[0]" v-on:chart-selected="chartSelected('intensityData')"></StandardGraph>
                    <StandardGraph class="graph" id="duration" title="Durchschnittliche Dauer" yaxis-title="Stunden" :data="durationData[0]" v-on:chart-selected="chartSelected('durationData')"></StandardGraph>
                    <StandardGraph class="graph" id="amount" title="Anzahl" yaxis-title="Ereignisse" :data="amountData[0]" v-on:chart-selected="chartSelected('amountData')"></StandardGraph>
                </div>
                <div id="detail-graphs" v-if="activeMode === 'right-button'">
                    <DetailGraph
                        class="graph"
                        title="Intensität"
                        data-name="intensity"
                        yaxis-title="SI"
                        :first-selection="firstSelection"
                        :second-selection="secondSelection"
                        :first-color="firstSelectionColor"
                        :second-color="secondSelectionColor"></DetailGraph>
                    <DetailGraph
                        class="graph"
                        title="Dauer"
                        yaxis-title="Stunden"
                        data-name="duration"
                        :first-selection="firstSelection"
                        :second-selection="secondSelection"
                        :first-color="firstSelectionColor"
                        :second-color="secondSelectionColor"></DetailGraph>
                    <DetailBarGraph
                        class="graph"
                        title="Anzahl"
                        yaxis-title="Ereignisse"
                        :first-selection="firstSelection"
                        :second-selection="secondSelection"
                        :first-color="firstSelectionColor"
                        :second-color="secondSelectionColor"></DetailBarGraph>
                </div>
                <div class="color-picker" v-on:click="showContextMenu">
                    <font-awesome-icon icon="palette" />
                </div>
            </div>
        </section>
        <context-menu ref="colorMenuRef" >
            <li class="ctx-header">Farbschema</li>
            <li class="ctx-item" v-on:click="onColorSelected('blue')">Blau</li>
            <li class="ctx-item" v-on:click="onColorSelected('red')">Rot</li>
            <li class="ctx-item" v-on:click="onColorSelected('green')">Grün</li>
        </context-menu>
    </div>
</template>

<script>

//import ScraperSetup from "@/components/scraper_setup/ScraperSetup";

import MapComponent from "@/components/MapComponent/MapComponent";

import {requestPolygonData, getGlobalData, rgbToHex, hexToRgb, isInt} from "@/utils/utils";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPalette } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import contextMenu from 'vue-context-menu'
import ModeSwitch from "@/components/ModeSwitch/ModeSwitch";
import DetailGraph from "@/components/DetailGraph/DetailGraph";
import DetailBarGraph from "@/components/DetailBarGraph/DetailBarGraph";
import StandardGraph from "@/components/StandardGraph/StandardGraph";

library.add(faPalette);

export default {
  name: 'app',
  components: {
      StandardGraph,
      DetailBarGraph,
      DetailGraph,
      ModeSwitch,
      MapComponent,
      FontAwesomeIcon,
      contextMenu
  },
    data: () => {
        return {
            "intensityData": [
              {
                  type: "column",
                  name: "Durchschnitt",
                  dataPoints: []
              }
          ],
            "durationData": [
              {
                  type: "column",
                  dataPoints: []
              }
            ],
            "amountData": [
                {
                    type: "column",
                    dataPoints: []
                }
            ],
            "firstSelection": null,
            "firstSelectionColor": "#4caf50",
            "secondSelectionColor": "#f44336",
            "standardColor": "#2979ff",
            "activeColor": "#ff9100",
            "maxColor": "#c3fdff",
            "minColor": "#0d47a1",
            "secondSelection": null,
            "areas": [],
            "activeAreaName": null,
            "activeMode": "left-button",
            "selectedMetric": null,
            "selectedMetricMax": null,
            "selectedMetricMin": null,
          }
    },
    mounted() {
        let globalData = getGlobalData();

        this.intensityData[0].dataPoints.push({label: "Gesamt", y: globalData.intensity.average, color: "#0d47a1"});

        this.durationData[0].dataPoints.push({label: "Gesamt", y: globalData.duration.average, color: "#0d47a1"});

        //this.amountData[0].dataPoints.push({label: "Gesamt", y: globalData.amount, color: "#0d47a1"})
    },
    methods: {
        onPolygonUpdated: function (area) {

            this.activeAreaName = area.name

            if (area.polygon.getLatLngs()[0].length > 2) {
                requestPolygonData(area.polygon)
                    .then((result) => {

                        // Add or update the new intensity data

                        let averageIntensityDataPoint = this.intensityData[0].dataPoints.find(element => element.label === area.name);

                        if (averageIntensityDataPoint !== undefined) {

                            averageIntensityDataPoint.y = result.intensity.average;

                        } else {

                            this.intensityData[0].dataPoints.push({label: area.name, y: result.intensity.average, color: "#0d47a1"});

                        }

                        // Add or update the new duration data

                        let averageDurationDataPoint = this.durationData[0].dataPoints.find(element => element.label === area.name);

                        if (averageDurationDataPoint !== undefined) {

                            averageDurationDataPoint.y = result.duration.average;

                        } else {

                            this.durationData[0].dataPoints.push({label: area.name, y: result.duration.average, color: "#0d47a1"});

                        }

                        let amountDataPoint = this.amountData[0].dataPoints.find(element => element.label === area.name);

                        if (amountDataPoint !== undefined) {

                            amountDataPoint.y = result.amount;

                        } else {
                            this.amountData[0].dataPoints.push({label: area.name, y: result.amount, color: "#0d47a1"})
                        }

                        window.console.log(result);
                        window.console.log(area.name);

                        area.dataPoints = result.dataPoints;

                        if (this.selectedMetric != null) {
                            this.chartSelected(this.selectedMetric)
                        }
                    })
            }
        },
        onPolygonFinished: function () {

            this.activeAreaName = null;

            if (this.selectedMetric != null) {
                this.chartSelected(this.selectedMetric)
            }

        },
        openMapMenu: function (event) {
            this.$refs.mapMenu.open(event)
        },
        openGraphMenu: function (event) {
            this.$refs.graphMenu.open(event)
        },
        onToggleClicked: function (event) {

            this.activeMode = event;
        },
        chartSelected: function(dataName) {

            this.selectedMetric = dataName;

            this.resetChartColors();

            let dataPoints = this.$data[dataName][0].dataPoints;

            // Get the maximum value

            let maxValue = 0;
            let minValue = 99999999999999999999999;

            for (let i=0; i<dataPoints.length; i++) {
                let dataPoint = dataPoints[i];

                if ( dataPoint.y > maxValue) {

                    maxValue = dataPoint.y;

                }
                if (dataPoint.y < minValue) {

                    minValue = dataPoint.y;

                }
            }

            for (let i=0; i<dataPoints.length; i++) {
                let dataPoint = dataPoints[i];

                let ratio = (dataPoint.y - minValue) / (maxValue - minValue);

                let color = this.pickRgb(hexToRgb(this.minColor), hexToRgb(this.maxColor), ratio);

                color = rgbToHex(color)

                dataPoint.color = color;

                if (this.activeAreaName !== dataPoint.label) {
                    this.setAreaColor(dataPoint.label, color)
                }

                // Reset selected colors if on detail view
                if (this.activeMode === 'right-button') {
                    if (this.firstSelection != null) {
                        this.setAreaColor(this.firstSelection.name, this.firstSelectionColor);
                    }

                    if (this.secondSelection != null) {
                        this.setAreaColor(this.secondSelection.name, this.secondSelectionColor);
                    }
                }
            }

            let c = document.getElementById("colorScaleCanvas");
            let ctx = c.getContext("2d");
            let grd = ctx.createLinearGradient(0, 0, 0, 200);
            grd.addColorStop(0, this.maxColor);
            grd.addColorStop(1, this.minColor);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 60, 200);

            this.selectedMetricMax = isInt(maxValue) ? maxValue : maxValue.toFixed(2);
            this.selectedMetricMin = isInt(minValue) ? minValue : minValue.toFixed(2);
        },
        pickRgb: function(color1, color2, weight) {
            let w1 = 1 - weight;
            let w2 = weight;
            let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
                Math.round(color1[1] * w1 + color2[1] * w2),
                Math.round(color1[2] * w1 + color2[2] * w2)];
            return rgb;
        },
        resetChartColors: function() {
            for (let i=0; i<this.intensityData[0].dataPoints.length; i++) {
                let dataPoint = this.intensityData[0].dataPoints[i]

                dataPoint.color = "#0d47a1"
            }

            for (let i=0; i<this.durationData[0].dataPoints.length; i++) {
                let dataPoint = this.durationData[0].dataPoints[i]

                dataPoint.color = "#0d47a1"
            }

            for (let i=0; i<this.amountData[0].dataPoints.length; i++) {
                let dataPoint = this.amountData[0].dataPoints[i]

                dataPoint.color = "#0d47a1"
            }
        },
        resetAreaColors: function() {
            for (let i=0; i<this.areas.length; i++) {

                let area = this.areas[i];

                area.polygon.setStyle({fillColor: "#2979ff", color: "#2979ff"});

            }
        },
        setAreaColor: function (label, color) {

            for (let i=0; i<this.areas.length; i++) {

                let area = this.areas[i];

                if (area.name === label) {

                    area.polygon.setStyle({fillColor: color, color: color});

                }

            }

        },
        onAreaRemoved: function (label) {
            for (let i=0; i<this.intensityData[0].dataPoints.length; i++) {
                let dataPoint = this.intensityData[0].dataPoints[i]

                if (dataPoint.label === label) {
                    this.intensityData[0].dataPoints.splice(this.intensityData[0].dataPoints.indexOf(dataPoint), 1);
                    break;
                }
            }

            for (let i=0; i<this.durationData[0].dataPoints.length; i++) {
                let dataPoint = this.durationData[0].dataPoints[i]

                if (dataPoint.label === label) {
                    this.durationData[0].dataPoints.splice(this.durationData[0].dataPoints.indexOf(dataPoint), 1);
                    break;
                }
            }

            for (let i=0; i<this.amountData[0].dataPoints.length; i++) {
                let dataPoint = this.amountData[0].dataPoints[i]

                if (dataPoint.label === label) {
                    this.amountData[0].dataPoints.splice(this.amountData[0].dataPoints.indexOf(dataPoint), 1);
                    break;
                }
            }
        },
        onCompareArea: function (area) {

            this.activeMode = 'right-button';

            if (this.firstSelection == null) {
                this.firstSelection = area;
                this.setAreaColor(this.firstSelection.name, this.firstSelectionColor);

            } else if (this.secondSelection == null) {
                this.secondSelection = area;
                this.setAreaColor(this.secondSelection.name, this.secondSelectionColor);
            }
        },
        onRemoveCompareArea: function (area) {
            if (this.firstSelection != null && this.firstSelection.name === area.name) {
                this.firstSelection = null;
            } else if (this.secondSelection != null && this.secondSelection.name === area.name) {
                this.secondSelection = null;
            }

            if (this.firstSelection == null && this.secondSelection == null) {
                this.activeMode = 'left-button'
            }

            // Reset colors
            this.resetAreaColors()

            if (this.selectedMetric != null) {
                this.chartSelected(this.selectedMetric)
            }

            if (this.firstSelection != null) {
                this.setAreaColor(this.firstSelection.name, this.firstSelectionColor);
            }

            if(this.secondSelection != null) {
                this.setAreaColor(this.secondSelection.name, this.secondSelectionColor);
            }
        },
        showContextMenu: function(event) {
            this.$refs["colorMenuRef"].open(event);
            event.stopPropagation(event)
        },
        onColorSelected(color) {
            switch (color) {
                case 'blue':

                    this.minColor = "#0d47a1"
                    this.maxColor = "#c3fdff"

                    this.firstSelectionColor = "#4caf50"
                    this.secondSelectionColor = "#f44336"

                    if (this.selectedMetric != null) {
                        this.chartSelected(this.selectedMetric)
                    }

                    break;
                case 'red':
                    this.minColor = "#b71c1c"
                    this.maxColor = "#ffcccb"

                    this.firstSelectionColor = "#4caf50"
                    this.secondSelectionColor = "#2196f3"

                    if (this.selectedMetric) {
                        this.chartSelected(this.selectedMetric)
                    }
                    break;

                case 'green':

                    this.minColor = "#1b5e20"
                    this.maxColor = "#d7ffd9"

                    this.firstSelectionColor = "#2196f3"
                    this.secondSelectionColor = "#f44336"

                    if (this.selectedMetric) {
                        this.chartSelected(this.selectedMetric)
                    }
                    break;

            }
        }

    },
    watch: {
      activeMode: function (value) {

          if (value === 'right-button') {

              if (this.firstSelection != null) {
                  this.setAreaColor(this.firstSelection.name, this.firstSelectionColor);
              }

              if (this.secondSelection != null) {
                  this.setAreaColor(this.secondSelection.name, this.secondSelectionColor);
              }

          } else if (value === 'left-button') {

              this.resetAreaColors()

              if (this.selectedMetric != null) {
                  this.chartSelected(this.selectedMetric)
              }

          }

      }
    }
}
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        width: 100%;
        height: 100%;
    }
    section {
        width: 100%;
        height: 100%;
    }
    div#map {
        width: 50%;
        height: 100%;
        float: left;
    }
    div#graphs {
        width: 50%;
        height: 100%;
        float: right;
    }
    .graph {
        width: 100%;
        height: 33%
    }
    div#config-button {
        z-index : 1;
        margin-right: 20px;
        margin-top: 20px;
        float: right;
    }
    html, body {
      height: 100%;
    }
    #outer{
    min-height: 100%;
    }

    body, p {
      margin:0;
      padding:0
    }

    .toggle-switch {
        position: absolute;
        right: 0;
        top: 0;
        margin: 10px;
        width: 120px;
        height: 20px;
        z-index: 999999999999999999;
    }

    #overview-graphs {
        width: 100%;
        height: 100%;
    }

    .color-scale {
        position: absolute;
        left: 0;
        top: 0;
        margin-top: 100px;
        margin-left: 20px;
        z-index: 999999999999999999;
        height: 200px;
        width: 20px;
    }

    .max-color-scale-label {
        position: absolute;
        left: 0;
        top: 0;
        margin-top: 95px;
        margin-left: 30px;
        z-index: 999999999999999999;
        height: fit-content;
        width: fit-content;
        color: white;
    }
    .min-color-scale-label {
        position: absolute;
        left: 0;
        top: 0;
        margin-top: 290px;
        margin-left: 30px;
        z-index: 999999999999999999;
        height: fit-content;
        width: fit-content;
        color: white;
    }

    .color-picker {
        position: absolute;
        right: 0;
        top: 0;
        margin: 10px;
        z-index: 999999999999999999;
        height: fit-content;
        width: fit-content;
    }
    .color-picker:hover {
        cursor: pointer;
    }


</style>
