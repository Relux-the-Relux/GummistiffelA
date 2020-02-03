<template>
    <div class="ModeSwitch">
        <div class="left-button" v-on:click="onButtonClicked" :style="{ 'background-color': leftColor, 'color': leftTextColor }">{{valueLeft}}</div>
        <div class="right-button" v-on:click="onButtonClicked" :style="{ 'background-color': rightColor, 'color': rightTextColor }">{{valueRight}}</div>
    </div>
</template>

<script>
    export default {
        props: {
            valueLeft: String,
            valueRight: String,
            activeValue: String
        },
        methods: {
            onButtonClicked: function (event) {

                event.stopPropagation();
                this.$emit("on-button-clicked", event.target.className)

            }
        },
        computed: {
            leftColor: function () {
                if (this.activeValue === 'left-button') {
                    return "#000099"
                } else {
                    return "white"
                }
            },
            rightColor: function () {
                if (this.activeValue === 'right-button') {
                    return "#000099"
                } else {
                    return "white"
                }
            },
            leftTextColor: function () {

                if (this.activeValue === 'left-button') {
                    return "white"
                } else {
                    return "#000099"
                }

            },
            rightTextColor: function () {

                if (this.activeValue === 'right-button') {
                    return "white"
                } else {
                    return "#000099"
                }

            }

        }
    };
</script>

<style>
    .left-button {
        float: left;
        width: 50%;
        height: 100%;
        color: white;
        cursor: pointer;
        text-align: center;
    }
    .right-button {
        float: right;
        width: 50%;
        height: 100%;
        color: white;
        cursor: pointer;
        text-align: center;
    }
</style>

