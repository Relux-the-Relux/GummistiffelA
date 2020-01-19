<template>
    <div id="app">

        <section>
            <div id="map">
                <MapComponent :areas="areas" v-on:area-updated="onPolygonUpdated" v-on:contextmenu.prevent="openMapMenu"></MapComponent>
                <ModeSwitch class="toggle-switch"
                            value-left="Übersicht"
                            value-right="Detail"
                            :active-value="activeMode"
                            v-on:on-button-clicked="onToggleClicked"/>
            </div>
            <div id="graphs">
                <div id="overview-graphs" v-show="activeMode === 'left-button'">
                    <TestGraph class="graph" id="intensity" title="Intensität" :data="intensityData" :switchable-values="['Maximum', 'Durchschnitt']" v-on:chart-selected="chartSelected('intensityData')"></TestGraph>
                    <TestGraph class="graph" id="duration" title="Dauer" :data="durationData" :switchable-values="['Maximum', 'Durchschnitt']" v-on:chart-selected="chartSelected('durationData')"></TestGraph>
                    <TestGraph class="graph" id="amount" title="Anzahl" :data="amountData" v-on:chart-selected="chartSelected('amountData')"></TestGraph>
                </div>
                <div id="detail-graphs" v-show="activeMode === 'right-button'">
                    <DetailGraph class="graph" id="range" title="Time" :data="intensityData"></DetailGraph>
                </div>
            </div>
        </section>

    </div>
</template>

<script>

//import ScraperSetup from "@/components/scraper_setup/ScraperSetup";

import TestGraph from "@/components/TestGraph/TestGraph";
import MapComponent from "@/components/MapComponent/MapComponent";

import {requestPolygonData, getGlobalData, rgbToHex, hexToRgb} from "@/utils/utils";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import ModeSwitch from "@/components/ModeSwitch/ModeSwitch";
import DetailGraph from "@/components/DetailGraph/DetailGraph";

library.add(faTimes);

export default {
  name: 'app',
  components: {
      DetailGraph,
      ModeSwitch,
      MapComponent,
      TestGraph,
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
                  name: "Durchschnitt",
                  dataPoints: []
              }
          ],
            "amountData": [
                {
                    type: "column",
                    dataPoints: []
                }
            ],
            "areas": [],
            "activeMode": "left-button"
          }
    },
    mounted() {
        let globalData = getGlobalData();

        this.intensityData[0].dataPoints.push({label: "Gesamt", y: globalData.intensity.average, color: "#0d47a1"});

        this.durationData[0].dataPoints.push({label: "Gesamt", y: globalData.duration.average, color: "#0d47a1"});

        this.amountData[0].dataPoints.push({label: "Gesamt", y: globalData.amount, color: "#0d47a1"})
    },
    methods: {
        onPolygonUpdated: function (area) {
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
                    })
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

            this.resetChartColors();

            let dataPoints = this.$data[dataName][0].dataPoints;

            // Get the maximum value

            let maxValue = 0;
            let maxLabel = "";

            for (let i=0; i<dataPoints.length; i++) {
                let dataPoint = dataPoints[i];

                if ( dataPoint.y > maxValue) {

                    maxValue = dataPoint.y;
                    maxLabel = dataPoint.label

                }
            }

            for (let i=0; i<dataPoints.length; i++) {
                let dataPoint = dataPoints[i];

                let ratio = dataPoint.y / maxValue;

                let color = this.pickRgb(hexToRgb("#000099"), hexToRgb("#33ccff"), ratio);

                color = rgbToHex(color)

                dataPoint.color = color;

                this.setAreaColor(dataPoint.label, color)
            }
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
        setAreaColor: function (label, color) {

            for (let i=0; i<this.areas.length; i++) {

                let area = this.areas[i];

                if (area.name === label) {
                    area.polygon.setStyle({fillColor: color, color: color});
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
        width: 60%;
        height: 100%;
        float: left;
    }
    div#graphs {
        width: 40%;
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
        width: 100px;
        height: 20px;
        z-index: 999999999999999999;
    }

    #overview-graphs {
        width: 100%;
        height: 100%;
    }

</style>
