/*global define*/
define([
    'views/game',
    'text!tmpl/game-location.tmpl',
    'libs/leaflet-src',
    'settings'
], function (
    GameView,
    tmplLocationGame,
    leaflet,
    settings
) {

    'use strict';

    var LocationGameView;

    LocationGameView = GameView.extend({
        template : tmplLocationGame,
        className : 'mapcontainer',

        initialize : function () {
            GameView.prototype.initialize.apply(this, arguments);
        },

        recalculateGame : function () {
            var level = this.level;

            this.trigger('game-reset', function (collection) {
                var sightsMax = collection.length - 1,
                    numQuestions = parseInt((Math.log(level) + 1) * 3, 10),
                    sight, rnd,
                    data = [],
                    json,
                    i = 1;


                while (numQuestions) {
                    rnd = parseInt(Math.random() * sightsMax, 10);
                    sight = collection.at(rnd);
                    json = sight.toJSON();
                    
                    data.push({
                        name : json.name,
                        location : json.location,
                        icon : json.icon,
                        replied : false,
                        correct : false,
                        index : i++
                    });

                    numQuestions -= 1;
                }
                
                return data;
            });
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

        afterRender : function () {
            
            // console.log(this.model ? this.model.attributes.location : 'model not set');

            if (this.model) {
            
                this.map = null;

                var osmAttrib = 'Map data © openstreetmap contributors',
                    cmUrl = 'http://{s}.tile.cloudmade.com/77aace98a9ec425f8f2cb228c484f71f/997/256/{z}/{x}/{y}.png',
                    osm = new L.TileLayer(cmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib}),
                    pos = new L.LatLng(settings.CITY_LAT, settings.CITY_LNG);

                this.map = new L.Map(this.$('#gamemap')[0], {
                    center: pos,
                    zoom: 13,
                    dragging: true,
                    layers: [osm],
                    zoomControl: true
                });

                // this.map.fitBounds([
                //     [settings.CITY_SW_LAT, settings.CITY_SW_LNG],
                //     [settings.CITY_NE_LAT, settings.CITY_NE_LNG]
                // ]);

                this.addMarker(this.model, false);

                //TODO add random markers
                for (var i = 0; i < 5; i++) {
                    this.addMarker(this.model, true);
                }



                // //fix for bug at first load of map / popup or marker is still on wrong position
                // //http://stackoverflow.com/questions/10762984/leaflet-map-not-displayed-properly-inside-tabbed-panel
                L.Util.requestAnimFrame(this.map.invalidateSize, this.map, false, this.map._container);
            }
        },

        addMarker : function (item, randomLocation) {
            var marker,
            //creating a copy of item.attribute.location not a reference, gues there is a better way to do it, see _getLocation method sight map
                location = {latitude : item.attributes.location.latitude, longitude : item.attributes.location.longitude},
                that = this,
                correct;

            if (location) {

                if (randomLocation) { 
                    location.latitude = settings.CITY_SW_LAT + (settings.CITY_NE_LAT - settings.CITY_SW_LAT) * Math.random();
                    location.longitude = settings.CITY_SW_LNG + (settings.CITY_NE_LNG - settings.CITY_SW_LNG) * Math.random();
                }

                marker = L.marker(new L.LatLng(
                        location.latitude, 
                        location.longitude
                    ), {
                        icon : this.createIcon(item)
                    })
                    .addTo(this.map)
                    .on('click', function (e) {
                        if (e.target._leaflet_id === that.resultId) {
                            console.log("RICHTIG!!!");
                            correct = true;
                        } else {
                            console.log("FALSCH!");
                            correct = false;
                        }
                        //show result
                        that.model.set({replied : true, correct : correct});
                        that.trigger('game-progress');
                    });

                if (!randomLocation) {
                    this.resultId = marker._leaflet_id;
                    console.log(item.attributes.name, item.attributes.location);

                    console.log('new render solution: ' + this.resultId);
                }
            }
        },
        createIcon : function (item) {
            var icon = L.divIcon({
                className : 'map-pin ',
                html : item.get('index') || '?',
                iconSize : new L.Point(20, 41),
                iconAnchor : new L.Point(10, 41)
            });
            return icon;
        }
    });

    return LocationGameView;
});
