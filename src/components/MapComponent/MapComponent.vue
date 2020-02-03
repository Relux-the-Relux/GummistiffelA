<template>
    <div class="MapComponent">
        <div id="map"></div>
        <context-menu ref="mapMenuRef" >
            <li class="ctx-header">{{contextMenuTitle}}</li>
            <li v-if="showSelect" class="ctx-item" v-on:click="onCompareClicked">Zu Detailsicht hinzufügen</li>
            <li v-if="!showSelect" class="ctx-item" v-on:click="onRemoveFromCompareClicked">Von Detailsicht entfernen</li>
            <li class="ctx-item" v-on:click="onEditClicked">Bearbeiten</li>
            <li class="ctx-item" v-on:click="onUndoPoint">Punkt zurück</li>
            <li class="ctx-item" v-on:click="onDeletePolygon">Löschen</li>
        </context-menu>
    </div>
</template>

<script>

    import contextMenu from 'vue-context-menu'

    require("leaflet/dist/leaflet.css");
    require("leaflet/dist/images/marker-icon.png");
    require("leaflet/dist/images/marker-icon-2x.png");
    require("leaflet/dist/images/marker-shadow.png");
    require("leaflet/dist/images/layers-2x.png");
    require("leaflet/dist/images/layers.png");

    import * as L from 'leaflet'

    var next_area_number = 1;

    export default {
        props: {
            areas: Array,
            detailAreaOne: Object,
            detailAreaTwo: Object
        },
        components: {
            contextMenu
        },
        data: () => {
          return {
              "mapView": null,
              "activeArea": null,
              "selectedArea": null,
          }
        },
        mounted() {
            this.mapView = L.map('map').setView([52.520008, 13.404954], 5);

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }).addTo(this.mapView);

            this.mapView.doubleClickZoom.disable();

            // Add click handlers
            this.mapView.on('click', this.onMapClick)
        },
        methods: {
            onMapClick: function (event) {

                if (this.activeArea === null) {

                    this.activeArea = {
                        "name": "Gebiet " + next_area_number.toString(),
                        "polygon": L.polygon([event.latlng]).addTo(this.mapView)
                    };

                    next_area_number += 1;

                    this.activeArea.polygon.setStyle({fillColor: '#ff9100', color: '#ff9100'});

                    this.activeArea.polygon.on('click', this.onPolygonClick);
                    this.activeArea.polygon.on('contextmenu', this.onPolygonContextMenu);
                    this.areas.push(this.activeArea)
                }
                else {
                    this.activeArea.polygon.addLatLng(event.latlng);

                    this.$emit("area-updated", this.activeArea)
                }

                if(this.activeArea.polygon.getTooltip() !== undefined) {
                    this.activeArea.polygon.getTooltip().remove();
                }

                this.activeArea.polygon.bindTooltip(this.activeArea.name,
                    {className: 'polygon-label',
                    permanent: true,
                    direction:"center"})
                    .openTooltip();

            },
            onPolygonClick: function (event) {

                if (this.activeArea !== null && event.target === this.activeArea.polygon) {
                    this.activeArea.polygon.setStyle({fillColor: '#2979ff', color: '#2979ff'});
                    this.activeArea = null;
                    L.DomEvent.stopPropagation(event)
                    this.$emit("polygon-finished")
                }
            },
            onPolygonContextMenu: function (event) {
                this.selectedArea = this.areas.find((element) => element.polygon === event.target);

                this.$refs.mapMenuRef.open(event.originalEvent);

                L.DomEvent.stopPropagation(event)
            },
            onEditClicked() {
                this.activeArea = this.selectedArea;
                this.activeArea.polygon.setStyle({fillColor: '#ff9100', color: '#ff9100'});
            },
            onUndoPoint() {

                let latLngs = this.selectedArea.polygon.getLatLngs()[0];
                latLngs.pop();

                this.selectedArea.polygon.setLatLngs(latLngs);

                this.activeArea.polygon.setStyle({fillColor: '#2979ff', color: '#2979ff'});

                this.activeArea = this.selectedArea;
                this.activeArea.polygon.setStyle({fillColor: '#ff9100', color: '#ff9100'});
            },
            onDeletePolygon() {

                let label = this.selectedArea.name;

                if (this.activeArea != null) {

                    this.activeArea.polygon.setStyle({fillColor: '#2979ff', color: '#2979ff'});

                }
                this.areas.splice(this.areas.indexOf(this.selectedArea), 1);
                this.selectedArea.polygon.remove();
                this.selectedArea = null;
                this.activeArea = null;

                this.$emit("area-removed", label)
            },
            onCompareClicked() {
                this.$emit("compare-area", this.selectedArea)
            },
            onRemoveFromCompareClicked() {
                this.$emit("remove-compare-area", this.selectedArea)
            }
        },
        computed: {
            contextMenuTitle() {
                if (this.selectedArea !== null) {
                    return this.selectedArea.name;
                }
                return ""
            },
            showSelect: function() {
                if (this.detailAreaOne != null && this.detailAreaOne.name === this.selectedArea.name) {

                    return false

                } else if (this.detailAreaTwo != null && this.detailAreaTwo.name === this.selectedArea.name) {

                    return false

                } else {

                    return true
                }
            }
        }
    };
</script>

<style>
    .polygon-label {
        background: transparent;
        border: 2px solid transparent;
        box-shadow: 0 1px 3px transparent;
        color: white;
    }
    .leaflet-tooltip-left.polygon-label::before {
      border-left-color: transparent;
    }
    .leaflet-tooltip-right.polygon-label::before {
      border-right-color: transparent;
    }
</style>
