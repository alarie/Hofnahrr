/*global define, L*/
define([
    'underscore', 'backbone',
    'views/templated-bridge',
    'libs/leaflet-src',

    'settings',

    'text!tmpl/sight-map.tmpl',
    'text!tmpl/sight-map-bubble.tmpl'
], function (
    _, Backbone, TemplatedBridgeView,
    leaflet,
    settings,
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
        className : 'mapcontainer',
        template : tmplSightMap,

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            this.bubble = new SightMapBubbleView();

            _.bindAll(this, 'addMarker');
        },

        setCollection : function (collection) {
            this.collection = collection;
        },

        setModel : function (model) {
            var pos;

            this.model = model;

            pos = this._getPosition(model);

            if (!this.$el.children(0).length) {
                this.render();
            }

            if (pos) {
                this.panMapTo(pos);
            }

            //open popup of selected sight / right way or solve it with a extra view?
            // called in panMapTo
            // this.markers[model.id].openPopup();
            // this.markers[this.model.id].openPopup();
            this.map.closePopup();
        },

        _getPosition : function (model) {
            var location,
                pos = new L.LatLng(settings.CITY_LAT, settings.CITY_LNG);

            if (model && (location = model.getLocation())) {
                pos = new L.LatLng(location.latitude, 
                                location.longitude);
            }
            return pos;
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
                        if (that.markers[that.model.id]) {
                            that.markers[that.model.id].openPopup();
                        }
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

        createIcon : function (content) {
            var icon = L.divIcon({
                className : 'map-pin',
                html : content || '',
                iconSize : new L.Point(20, 41),
                iconAnchor : new L.Point(10, 41)
            });
            return icon;
        },


        afterRender : function () {
            this.map = null;

            var osmAttrib = 'Map data © openstreetmap contributors',
                cmUrl = 'http://{s}.tile.cloudmade.com/77aace98a9ec425f8f2cb228c484f71f/997/256/{z}/{x}/{y}.png',
                osm = new L.TileLayer(cmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib}),
                pos = this._getPosition(this.model);



            this.map = new L.Map(this.$('#map')[0], {
                center: pos,
                zoom: 14,
                layers: [osm],
                zoomControl: false
            });

            //fix for bug at first load of map / popup or marker is still on wrong position
            //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
            L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container);
            this.resetMarkers();
        },

        resetMarkers : function () {
            // add marker to map for each sight
            this.markers = [];

            if (this.collection) {
                this.collection.forEach(this.addMarker, this);
            }
        },

        addMarker : function (item) {
            var sightMapBubbleView = new SightMapBubbleView({model : item}),
                location = item.getLocation();

            if (location) {
                this.markers[item.id] = L.marker(new L.LatLng(
                        location.latitude, 
                        location.longitude
                    ), {
                        icon : this.createIcon(item.get('index'))
                    })
                    .addTo(this.map)
                    .bindPopup(sightMapBubbleView.render().el[0], {
                        offset: new L.Point(0, -33)
                    })
                    .on('click', function () {
                        //link to the associated sight page
                        window.location.hash = '#sight/' + item.get('speakingId') + '/map/';
                    });
            }
        }

    });

    return SightMapView;
});
