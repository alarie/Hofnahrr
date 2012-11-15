/*global define*/
define([
    'underscore', 'backbone',
    'views/templated-bridge',
    'libs/leaflet-src',

    'text!tmpl/sight-map.tmpl',
], function (
    _, Backbone, TemplatedBridgeView,
    leaflet,
    tmplSightMap
) {
    'use strict';

    var SightMapView;

    SightMapView = TemplatedBridgeView.extend({
        tagname : 'div',
        template : tmplSightMap,

        afterRender : function(){
            var map = null;
            var data = this.model ? this.model.toJSON() : {};

            var pos = new L.LatLng(data.location.latitude, data.location.longitude);

            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            var cmUrl = 'http://{s}.tile.cloudmade.com/77aace98a9ec425f8f2cb228c484f71f/997/256/{z}/{x}/{y}.png';
            var osmAttrib='Map data © openstreetmap contributors';
            var osm = new L.TileLayer(cmUrl,{minZoom:8,maxZoom:18,attribution:osmAttrib});
            
            map = new L.Map(this.$('#map')[0], {
                center: pos,
                zoom: 14,
                layers: [osm]
            });

            L.marker(pos)
                .addTo(map)
                .bindPopup('<p>' + data.description + '</p>').openPopup();

            //fix for bug at first load of map / popup or marke is still on wrong position
            //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
            L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);


        },
    });

    return SightMapView;
});
