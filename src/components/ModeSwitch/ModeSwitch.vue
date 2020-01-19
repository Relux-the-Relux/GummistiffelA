<template>
    <div class="ModeSwitch">
        <div class="left-button" v-on:click="onButtonClicked" :style="{ 'background-color': leftColor }">{{valueLeft}}</div>
        <div class="right-button" v-on:click="onButtonClicked" :style="{ 'background-color': rightColor }">{{valueRight}}</div>
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
                    return "green"
                } else {
                    return "red"
                }
            },
            rightColor: function () {
                if (this.activeValue === 'right-button') {
                    return "green"
                } else {
                    return "red"
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
    }
    .right-button {
        float: right;
        width: 50%;
        height: 100%;
        color: white;
        cursor: pointer;
    }
</style>

