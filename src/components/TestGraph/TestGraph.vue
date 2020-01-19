<template>
    <div class="TestGraph" v-on:contextmenu.prevent="showContextMenu">
        <div v-bind:id="id" style="height: 100%; width: 100%;"></div>
        <context-menu :ref="menuRef" >
            <li class="ctx-header">{{title}}</li>
            <li class="ctx-item" v-on:click="onChartSelected">Auswählen</li>
        </context-menu>
    </div>
</template>

<script>
    import Vue from 'vue'
    import * as CanvasJS from 'canvasjs'
    import contextMenu from 'vue-context-menu'

    export default {
        props: {
            "id": String,
            "title": String,
            "data": Array,
            "switchableValues": Array
        },
        components: {
            contextMenu
        },
        data: () => {
            return {
                "chart": null,
                "valueToggleMap": {}
            }
        },
        mounted() {

            if (this.switchableValues !== undefined) {
                for (let i=0; i < this.switchableValues.length; i++) {
                    Vue.set(this.valueToggleMap, this.switchableValues[i], true);
                }
            }

            this.chart = new CanvasJS.Chart(this.id, {
                title:{
                    text: this.title
                },
                data: this.data
            });
            this.chart.render();
        },
        methods: {
            showContextMenu: function(event) {
                this.$refs[this.menuRef].open(event);
            },
            getOptionText(name, value) {
                if (value) {
                    return name + " ausblenden"
                } else {
                    return name + " anzeigen"
                }
            },
            toggleValue(name) {
                this.valueToggleMap[name] = !this.valueToggleMap[name];

                this.updateChart();
            },
            updateChart() {

                let resultData = [];

                for (let i=0; i < this.data.length; i++) {

                    let item = this.data[i];

                    // Use !== false to also enable values that were set as not switchable
                    if (this.valueToggleMap[item.name] !== false) {
                        resultData.push(item)
                    }
                }

                this.chart = new CanvasJS.Chart(this.id, {
                    title:{
                        text: this.title
                    },
                    data: resultData
                });
                this.chart.render();

            },
            onChartSelected() {
                this.$emit('chart-selected')
            }
        },
        watch: {
            data: {
                handler() {
                    window.console.log('data changed');
                    this.updateChart();
                },
                deep: true
            }
        },
        computed: {
            menuRef: function() {
                return "contextMenu-" + this.id;
            },
        }
    };
</script>
