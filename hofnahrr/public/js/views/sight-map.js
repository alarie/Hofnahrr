/*global define, L*/
define([
    'underscore', 'backbone',
    'views/templated-bridge',
    'libs/leaflet-src',

    'text!tmpl/sight-map.tmpl',
    'text!tmpl/sight-map-bubble.tmpl'
], function (
    _, Backbone, TemplatedBridgeView,
    leaflet,
    tmplSightMap,
    tmplSightMapBubble
) {
    'use strict';

    var SightMapView, SightMapBubbleView;

    SightMapBubbleView = TemplatedBridgeView.extend({
        tagname : 'div',
        template : tmplSightMapBubble
    });


    SightMapView = TemplatedBridgeView.extend({
        tagname : 'div',
        template : tmplSightMap,

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            this.bubble = new SightMapBubbleView();
        },

        setModel : function (model) {
            this.model = model;
            var data = this.model.toJSON(),
                pos = new L.LatLng(data.location.latitude, 
                                   data.location.longitude);

            if (!this.$el.children(0).length) {
                this.render();
            }

            this.bubble.setModel(model);
            //this.renderBubbleAtLocation(pos);
            this.panMapTo(pos);
        },

        panMapTo : function (pos) {
            var that = this,
                PAN_ZOOM_LEVEL = 14,
                DETAIL_ZOOM_LEVEL = 17,
                ANIMATION_DELAY = 300;

            this.map.on('zoomend', function zoomend() {
                that.map.off('zoomend', zoomend);

                // wait a short moment for the map ro refresh, then pan the map
                window.setTimeout(function () {
                    that.map.panTo(pos);
                }, ANIMATION_DELAY);

                // once the map was panned, zoom in
                that.map.on('moveend', function panend() {
                    that.map.off('moveend', panend);

                    // again wait for the map to have been rerendered
                    window.setTimeout(function () {
                        that.map.setZoom(DETAIL_ZOOM_LEVEL);
                    }, ANIMATION_DELAY);
                });
            });

            // zoom out to the pan zoom level or if we are there already, just
            // trigger starting of the panning
            if (this.map.getZoom() <= PAN_ZOOM_LEVEL) {
                this.map.fire('zoomend'); 
            }
            else {
                this.map.setZoom(PAN_ZOOM_LEVEL);
            }
        },

        afterRender : function () {
            this.map = null;

            var data = this.model ? this.model.toJSON() : {},
                pos = new L.LatLng(data.location.latitude, data.location.longitude),
                osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                cmUrl = 'http://{s}.tile.cloudmade.com/77aace98a9ec425f8f2cb228c484f71f/997/256/{z}/{x}/{y}.png',
                osmAttrib = 'Map data © openstreetmap contributors',
                osm = new L.TileLayer(cmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});

            this.map = new L.Map(this.$('#map')[0], {
                center: pos,
                zoom: 14,
                layers: [osm]
            });

            this.marker = L.marker(pos);
            this.marker.addTo(this.map);

            // console.log(this.bubble.render().el);


            // this.marker.bindPopup(this.bubble.render().el);
            this.marker.openPopup();
                //.bindPopup('<p>' + data.description + '</p>').openPopup();
                // .bindPopup(this.bubble.render()).openPopup();



            //fix for bug at first load of map / popup or marker is still on wrong position
            //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
            L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container);


        },
    });

    return SightMapView;
});
