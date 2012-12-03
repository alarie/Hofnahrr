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

    var SightMapView, SightMapBubbleView, PickerControls;

    PickerControls = L.Control.extend({
        options : {
            position: 'topright'
        },

        initialize : function () {
            
            this.el = $('<div />', {
                'class' : 'picker-controls form-inline'
            });

            this.okBtn = $('<button />', {
                'class' : 'btn btn-primary', 
                text : 'OK'
            });

            this.cancelBtn = $('<button />', {
                'class' : 'btn btn-danger', 
                text : 'Cancel'
            });

            this.latInput = $('<input />', {
                'class' : 'input-small', 
                type : 'text', 
                placeholder : 'Latitude'
            });

            this.lngInput = $('<input />', {
                'class' : 'input-small', 
                type : 'text', 
                placeholder : 'Longitude'
            });

            _.bindAll(this, 'onPick');

            this.render();
        },

        render : function () {
            var that = this;

            this.okBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                that.trigger('ok');
            });

            this.cancelBtn.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                that.trigger('cancel');
            });


            this.el.append(this.latInput, '\n', this.lngInput, '\n', this.okBtn, '\n', this.cancelBtn);

            return this;
        },

        setLocation : function (location) {
            this.latInput.val(location.lat);
            this.lngInput.val(location.lng);
        },

        onAdd : function (map) {
            map.on('click', this.onPick);
            return this.el[0];
        },

        onRemove : function (map) {
            map.off('click', this.onPick);
        },

        onPick : function (e) {
            this.setLocation(e.latlng);
            this.trigger('pick', {
                lat : e.latlng.lat,
                lng : e.latlng.lng
            });
        }
    });

    _.extend(PickerControls.prototype, Backbone.Events);

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
            var pos,
                popup;

            this.model = model;

            pos = this._getPosition(model);
            
            if (!this.$el.children(0).length) {
                this.render();
            }

            if (pos) {
                this.panMapTo(pos);
                //close old popup new popup is opened in panMapTo function
                this.map.closePopup();
            } else {
                //suggestion: show error msg when sight has no location
                pos = new L.LatLng(settings.CITY_LAT, settings.CITY_LNG);
                this.panMapTo(pos);
                popup = L.popup()
                .setLatLng(pos)
                .setContent('<p>Fehlermeldung!<br />Keine Ortsinformation hinterlegt.</p>')
                .openOn(this.map);
            }
           
        },

        _getPosition : function (model) {
            var location,
                // pos = new L.LatLng(settings.CITY_LAT, settings.CITY_LNG);
                pos = null;

            if (model && (location = model.getLocation())) {
                pos = new L.LatLng(location.latitude, 
                                location.longitude);
            }
            return pos;
        },

        // Following three methods were copied from the leaflet library. At
        // leaflet they were makred as private (starting with an underscore). 
        // To be sure that with updates of leaflet those methods won't change,
        // they were copied here. Thus this code remains independent of code
        // changes in the leaflet library
        /**
         * @private
         */
        _getCenterLayerPoint: function () {
            return this.map.containerPointToLayerPoint(this.map.getSize().divideBy(2));
        },

        /**
         * @private
         */
        _getCenterOffset: function (center) {
            return this.map.latLngToLayerPoint(center).subtract(this._getCenterLayerPoint());
        },

        /**
         * @private
         */
        _offsetIsWithinView: function (offset, multiplyFactor) {
            var m = multiplyFactor || 1,
                size = this.map.getSize();

            return (Math.abs(offset.x) <= size.x * m) &&
                    (Math.abs(offset.y) <= size.y * m);
        },
        //

        panMapTo : function (pos) {


            var that = this,
                PAN_ZOOM_LEVEL = 14,
                DETAIL_ZOOM_LEVEL = 17,
                ANIMATION_DELAY = 300,
                offset = this._getCenterOffset(pos);


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
                        if (that.model && that.markers[that.model.id]) {
                            that.markers[that.model.id].openPopup();
                        }
                    }, ANIMATION_DELAY);
                });
            });

            // zoom out to the pan zoom level or if we are there already, just
            // trigger starting of the panning
            if (this.map.getZoom() <= PAN_ZOOM_LEVEL || 
                this._offsetIsWithinView(offset)) {
                this.map.fire('zoomend'); 
            }
            else {
                this.map.setZoom(PAN_ZOOM_LEVEL);
            }
        },

        createIcon : function (item) {
            var icon = L.divIcon({
                className : 'map-pin ' + (item.get('verified') ? '' : 'unverified'),
                html : item.get('index') || '',
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
                zoomControl: true
            });

            //fix for bug at first load of map / popup or marker is still on wrong position
            //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
            L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container);
            this.resetMarkers();

            this.trigger('map-ready');
        },

        resetMarkers : function () {
            // add marker to map for each sight
            this.markers = [];

            if (this.collection) {
                this.collection.forEach(this.addMarker, this);
            }
        },

        addMarker : function (item) {
            var marker,
                sightMapBubbleView = new SightMapBubbleView({model : item}),
                location = item.getLocation();

            if (location) {
                marker = L.marker(new L.LatLng(
                        location.latitude, 
                        location.longitude
                    ), {
                        icon : this.createIcon(item)
                    })
                    .addTo(this.map)
                    .bindPopup(sightMapBubbleView.render().el[0], {
                        offset: new L.Point(0, -33),
                        closeButton: false
                    })
                    .on('click', function () {
                        //link to the associated sight page
                        window.location.hash = '#sight/' + item.get('speakingId') + '/map/';
                    });

                item.on('change:location', function () {
                    var location = item.getLocation();
                    marker.setLatLng(new L.LatLng(
                        location.latitude, 
                        location.longitude
                    ));
                });

                this.markers[item.id] = marker;
            }
        },

        preparePicker : function (callback) {
            var that = this,
                pickerCtrls = new PickerControls();

            this.map.addControl(pickerCtrls);

            pickerCtrls.on('ok', function () {
                that.trigger('picked');
            });

            pickerCtrls.on('cancel', function (location) {
                that.trigger('cancel', location);
            });

            pickerCtrls.on('pick', function (location) {
                that.trigger('pick', location);
            });

            this.pickerCtrls = pickerCtrls;

            return this;
        },

        destroyPicker : function () {
            this.map.removeControl(this.pickerCtrls);
        }


    });

    return SightMapView;
});
