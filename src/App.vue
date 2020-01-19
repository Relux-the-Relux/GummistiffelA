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
                    <TestGraph class="graph" id="intensity" title="Intensität" :data="intensityData" :switchable-values="['Maximum', 'Durchschnitt']"></TestGraph>
                    <TestGraph class="graph" id="duration" title="Dauer" :data="durationData" :switchable-values="['Maximum', 'Durchschnitt']"></TestGraph>
                    <TestGraph class="graph" id="amount" title="Anzahl" :data="amountData"></TestGraph>
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

import {requestPolygonData, getGlobalData} from "@/utils/utils";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
                  color: "#0d47a1",
                  showInLegend: true,
                  dataPoints: []
              },
              {
                  type: "column",
                  name: "Maximum",
                  color: "#b71c1c",
                  showInLegend: true,
                  dataPoints: []
              }
          ],
            "durationData": [
              {
                  type: "column",
                  name: "Durchschnitt",
                  color: "#0d47a1",
                  showInLegend: true,
                  dataPoints: []
              },
              {
                  type: "column",
                  name: "Maximum",
                  color: "#b71c1c",
                  showInLegend: true,
                  dataPoints: []
              }
          ],
            "amountData": [
                {
                    type: "column",
                    color: "#0d47a1",
                    dataPoints: []
                }
            ],
            "areas": [],
            "activeMode": "left-button"
          }
    },
    mounted() {
        let globalData = getGlobalData();

        this.intensityData[0].dataPoints.push({label: "Gesamt", y: globalData.intensity.average});
        this.intensityData[1].dataPoints.push({label: "Gesamt", y: globalData.intensity.max});

        this.durationData[0].dataPoints.push({label: "Gesamt", y: globalData.duration.average});
        this.durationData[1].dataPoints.push({label: "Gesamt", y: globalData.duration.max});

        this.amountData[0].dataPoints.push({label: "Gesamt", y: globalData.amount})
    },
    methods: {
        onPolygonUpdated: function (area) {
            if (area.polygon.getLatLngs()[0].length > 2) {
                requestPolygonData(area.polygon)
                    .then((result) => {

                        // Add or update the new intensity data

                        let averageIntensityDataPoint = this.intensityData[0].dataPoints.find(element => element.label === area.name);
                        let maximumIntensityDataPoint = this.intensityData[1].dataPoints.find(element => element.label === area.name);

                        if (averageIntensityDataPoint !== undefined && maximumIntensityDataPoint !== undefined) {

                            averageIntensityDataPoint.y = result.intensity.average;
                            maximumIntensityDataPoint.y = result.intensity.max;

                        } else {

                            this.intensityData[0].dataPoints.push({label: area.name, y: result.intensity.average});
                            this.intensityData[1].dataPoints.push({label: area.name, y: result.intensity.max});

                        }

                        // Add or update the new duration data

                        let averageDurationDataPoint = this.durationData[0].dataPoints.find(element => element.label === area.name);
                        let maximumDurationDataPoint = this.durationData[1].dataPoints.find(element => element.label === area.name);

                        if (averageDurationDataPoint !== undefined && maximumDurationDataPoint !== undefined) {

                            averageDurationDataPoint.y = result.duration.average;
                            maximumDurationDataPoint.y = result.duration.max;

                        } else {

                            this.durationData[0].dataPoints.push({label: area.name, y: result.duration.average});
                            this.durationData[1].dataPoints.push({label: area.name, y: result.duration.max});

                        }

                        let amountDataPoint = this.amountData[0].dataPoints.find(element => element.label === area.name);

                        if (amountDataPoint !== undefined) {

                            amountDataPoint.y = result.amount;

                        } else {
                            this.amountData[0].dataPoints.push({label: area.name, y: result.amount})
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
