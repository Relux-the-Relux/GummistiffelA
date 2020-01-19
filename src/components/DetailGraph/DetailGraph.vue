<template>
    <div class="DetailGraph">
        <div v-bind:id="id" style="height: 100%; width: 100%;"></div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import * as CanvasJS from 'canvasjs'

    export default {
        props: {
            id: String,
            title: String,
            firstArea: Array,
            secondArea: Array,
        },
        data: function () {
            return {
                chart: null
            }
        },
        mounted() {

            this.chart = new CanvasJS.Chart(this.id, {
                title: {
                    text: this.title
                },
                data: this.data
            });
            this.chart.render();
        }
    };
</script>
