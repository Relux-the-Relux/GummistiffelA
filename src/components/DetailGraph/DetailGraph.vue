<template>
    <div class="DetailGraph">
        <!--div v-bind:id="id" style="height: 100%; width: 100%;"></--div-->
        <Plotly :data="data" :displayModeBar="false" :layout="layout" :style="style"></Plotly>
    </div>
</template>

<script>
    import Vue from 'vue'
    import { Plotly } from 'vue-plotly'

    export default {
        props: {
            id: String,
            title: String,
            yaxisTitle: String,
            dataName: String,
            firstSelection: Object,
            secondSelection: Object,
            firstColor: String,
            secondColor: String,
        },
        data: function () {
            return {
                layout: {
                    title: {
                        text: this.title
                    },
                    margin: {
                        l: 45,
                        t: 30,
                        b: 30,
                        r: 30
                    },
                    yaxis: {
                        title: this.yaxisTitle
                    },
                    boxmode: 'group'
                }
            }
        },
        components: {
            Plotly
        },
        mounted() {

        },
        computed: {
            "data": function () {

                let graphData = []

                if (this.firstSelection != null) {

                    let firstSelectionData = {
                        y: [],
                        x: [],
                        name: this.firstSelection.name,
                        marker: {color: this.firstColor},
                        type: "box"
                    }

                    for (let i=0; i<this.firstSelection.dataPoints.length; i++) {

                        let dataPoint = this.firstSelection.dataPoints[i];

                        firstSelectionData.y.push(dataPoint[this.dataName]);
                        firstSelectionData.x.push(dataPoint.date);

                    }

                    graphData.push(firstSelectionData)

                }

                if (this.secondSelection != null) {

                    let secondSelectionData = {
                        y: [],
                        x: [],
                        name: this.secondSelection.name,
                        marker: {color: this.secondColor},
                        type: "box"
                    }

                    for (let i=0; i<this.secondSelection.dataPoints.length; i++) {

                        let dataPoint = this.secondSelection.dataPoints[i];

                        secondSelectionData.y.push(dataPoint[this.dataName]);
                        secondSelectionData.x.push(dataPoint.date);

                    }

                    graphData.push(secondSelectionData)

                }

                return graphData
            },
            style: function () {
                return "height: " + Math.floor(window.innerHeight * 0.33) + "px; width: 100%;"
            }
        }
    };
</script>
