define([
    'underscore', 'backbone',
    'libs/leaflet-src',
    'settings'
], function (
    _, Backbone,
    leaflet,
    settings
) {
    'use strict';

    var PickerControls;

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

    return PickerControls;

});
