<template>
    <div class="StandardGraph" v-on:contextmenu.prevent="showContextMenu">
        <Plotly :data="graphData" :displayModeBar="false" :layout="layout" :style="style" v-on:contextmenu.prevent="showContextMenu"> </Plotly>
        <context-menu :ref="menuRef" >
            <li class="ctx-header">{{title}}</li>
            <li class="ctx-item" v-on:click="onChartSelected">Auswählen</li>
        </context-menu>
    </div>
</template>

<script>

    import { Plotly } from 'vue-plotly'
    import contextMenu from 'vue-context-menu'

    export default {
        props: {
            data: Object,
            title: String,
            yaxisTitle: String
        },
        components: {
            Plotly,
            contextMenu
        },
        methods: {
            showContextMenu: function(event) {
                this.$refs[this.menuRef].open(event);
                event.stopPropagation(event)
            },
            onChartSelected() {
                this.$emit('chart-selected')
            }
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
                    }
                }
            }
        },
        computed: {
            menuRef: function() {
                return "contextMenu-" + this.id;
            },
            graphData: function() {

                let result = {
                    x: [],
                    y: [],
                    marker: {
                        color: []
                    },
                    type: "bar"
                }

                for (let i=0; i<this.data.dataPoints.length; i++) {

                    let dataPoint = this.data.dataPoints[i];

                    result.x.push(dataPoint.label);
                    result.y.push(dataPoint.y);

                    result.marker.color.push(dataPoint.color);

                }

                return [result];

            },
            style: function () {
                return "height: " + Math.floor(window.innerHeight * 0.33) + "px; width: 100%;"
            }
        },
        watch: {
            data: {
                handler() {
                    this.$forceUpdate();
                },
                deep: true
            }
        }
    };
</script>
