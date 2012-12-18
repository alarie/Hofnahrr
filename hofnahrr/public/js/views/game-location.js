/*global define, L */
define([
    'views/game',
    'text!tmpl/game-location.tmpl',
    'libs/leaflet-src',
    'settings',
    'picker-controls',
    'templater'
], function (
    GameView,
    tmplLocationGame,
    leaflet,
    settings,
    PickerControls,
    Templater
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
                    numQuestions = 3,
                    sight, rnd,
                    data = [],
                    json,
                    i = 1,
                    pictureRnd;


                while (numQuestions) {
                    rnd = parseInt(Math.random() * sightsMax, 10);
                    sight = collection.at(rnd);

                    if (!sight) {
                        console.log('undefined sight  rndnr', rnd);
                    }

                    if (sight.attributes.speakingId !== '-sight_unknown') {
                        json = sight.toJSON();
                        pictureRnd = parseInt(Math.random() * json.pictures.length - 1, 10);
                        
                        data.push({
                            name : json.name,
                            location : json.location,
                            icon : json.icon,
                            replied : false,
                            joker : false,
                            index : i++,
                            picture : json.pictures[pictureRnd]
                        });

                        numQuestions -= 1;
                    }
                }

                //Add Joker question
                sight = collection.get('unknown');
                json = sight.toJSON();

                //choose RndPicture
                pictureRnd = parseInt(Math.random() * json.pictures.length - 1, 10);
                console.log('sven', rnd);

                //todo refactor / copied code from line 45
                data.push({
                    name : json.name,
                    icon : json.icon,
                    replied : false,
                    correct : false,
                    joker : true,
                    index : i++,
                    picture : json.pictures[pictureRnd]
                });
                
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
                    pos = new L.LatLng(settings.CITY_LAT, settings.CITY_LNG),
                    i;

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
                
                if (!this.model.attributes.joker) {
                    this.addMarker(this.model, false);

                    //TODO add random markers
                    for (i = 0; i < 5; i++) {
                        this.addMarker(this.model, true);
                    }
                } else {
                    console.log('SHOW JOKER UI ELEMENTS');
                    this.preparePicker(this.model);
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
                            correct = true;
                        } else {
                            correct = false;
                        }
                        //show result
                        that.model.set({replied : true, correct : correct});
                        that.trigger('game-progress');
                    });

                if (!randomLocation) {
                    this.resultId = marker._leaflet_id;
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
        },

        preparePicker : function (model) {
            var that = this,
                pickerCtrls = new PickerControls(),
                pickMarker = L.marker(new L.LatLng(
                    settings.CITY_LAT, 
                    settings.CITY_LNG
                ), {
                    icon : that.createIcon(model),
                    draggable : 'true'
                })
                .addTo(this.map)
                .bindPopup(Templater.i18n('game_location_unknown_desc'), {
                    offset: new L.Point(0, -33),
                    closeButton: false
                })
                .openPopup();

            this.map.addControl(pickerCtrls);

            pickerCtrls.on('ok', function () {
                var loc = that.pickMarker.getLatLng();
                that.trigger('game-progress', {location: loc, pic: that.model.attributes.picture});
                that.model.set({replied : true});
            });

            pickerCtrls.on('cancel', function (location) {
                console.log('woas ich nich + end game');
                that.trigger('game-progress');
            });

            pickerCtrls.on('pick', function (location) {
                pickMarker.setLatLng(new L.LatLng(
                    location.lat, 
                    location.lng
                ));
            });

            pickMarker.on('dragend', function (event) {
                var e = {};
                e.latlng = event.target.getLatLng();
                that.map.fireEvent('click', e);
            });

            that.pickMarker = pickMarker;
            that.pickerCtrls = pickerCtrls;

            return this;
        },

        destroyPicker : function () {
            this.map.removeControl(this.pickerCtrls);
        }
    });

    return LocationGameView;
});
