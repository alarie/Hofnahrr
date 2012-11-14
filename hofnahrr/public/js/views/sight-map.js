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
            var hull = new L.LatLng(50.325, 11.940);

            map = new L.Map(this.$('#map')[0]);
            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            var cmUrl = 'http://{s}.tile.cloudmade.com/77aace98a9ec425f8f2cb228c484f71f/997/256/{z}/{x}/{y}.png';
            var osmAttrib='Map data © openstreetmap contributors';
            var osm = new L.TileLayer(cmUrl,{minZoom:8,maxZoom:18,attribution:osmAttrib});

            map.setView(hull,18);
            map.addLayer(osm);

            L.marker([50.325, 11.940]).addTo(map);
        }

        // TODO map implementation
    });

    return SightMapView;
});
