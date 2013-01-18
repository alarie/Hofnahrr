/*global define*/

/**
 * @file sight-form.js
 * @description Contains the logic for editing a sight.
 */

define([
    'jam/bootstrap-sass/js/bootstrap-popover',
    'underscore',
    'data-retriever',
    'templater',
    'views/templated-bridge',
    'settings',
    'text!tmpl/sight-form.tmpl'
], function (
    $,
    _,
    DataRetriever,
    Templater,
    TemplatedBridgeView, 
    settings,
    tmplSightForm
) {
    'use strict';

    var SightFormView;

    SightFormView = TemplatedBridgeView.extend({
        tagName : 'div',
        template : tmplSightForm,
        events : function () {
            return {
                'submit' : 'onSubmit',
                'click #pick-on-map' : 'onSightPickOnMap',
                'click .sight-delete' : 'onDelete',
                'input #sight-name' : 'onSightNameChanged'
            };
        },

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onSubmit', 'onSightPickOnMap');
            this.state = {};
        },

        onSightPickOnMap : function (e) {
            var that = this,
                orig = this.model ? this.model.get('location') : {};

            this.model.set(this._getFormData());

            e.preventDefault();
            e.stopPropagation();
            this.trigger('pick-on-map', function (location) {
                that.$('#sight-location-lat').val(location.lat);
                that.$('#sight-location-lng').val(location.lng);
                that.model.set({location : {
                    latitude : location.lat,
                    longitude : location.lng
                }});
            }, function () {
                that.$('#sight-location-lat').val(orig.lat);
                that.$('#sight-location-lng').val(orig.lng);
                that.model.set({location : orig});
            });
        },

        onSightNameChanged : function (e) {
            //var val = e.target.value,
                //url = 'http://local.yahooapis.com/MapsService/V1/geocode',
                //latInput = this.$('#sight-location-lat'),
                //lngInput = this.$('#sight-location-lng'),
                //help = lngInput.siblings('.help-inline');

            //if (val.length > 3) {
                //$.ajax({
                    //url : url,
                    //data : {
                        //appid : settings.YAHOO_API_KEY,
                        //location : val + ',' + settings.CITY,
                        //output : 'json'
                    //},
                    //crossDomain : true,
                    //dataType : 'json',
                    //success : function (data) {
                        //console.log(data);
                        //if (data && data.results && data.results.length) {
                            //data = data.results[0];
                            //if (data.locations.length) {
                                //var location = data.locations[0];
                                //latInput.val(location.latLng.lat);
                                //lngInput.val(location.lngLng.lng);
                            //}
                            ////help.text(data.formatted_address);
                        //}
                    //}
                //});
            //}
        },

        onSubmit : function (e) {
            e.preventDefault();
            this._saveForm();
        },

        _getFormData : function () {
            var data = (new DataRetriever({
                useBool : true,
                el : this.$('form')
            })).getData();

            data.location = {
                latitude : data.lat,
                longitude : data.lng
            };
            data.tags = data.tags.split(',');
            data.links = data.links.split(',');

            delete data.lat;
            delete data.lng;

            return data;
        },

        _saveForm : function () {
            var form = this.$('form')[0],
                origData,
                data;

            if (form.checkValidity()) {
                data = this._getFormData();

                origData = this.model ? this.model.toJSON() : {};

                _.extend(origData, data);

                this.setStatus('submit', 'loading');

                this.trigger('create-sight', origData);
            }

        },

        setStatus : function (target, status) {
            this.state[target] = status;
            target = this.$('[type="' + target + '"]');
            if (status === 'success') {
                target.addClass('success').next('i').text(Templater.i18n('sight_success'));
            }
        },

        onDelete : function (e) {
            e.preventDefault();
            this.trigger('delete-sight', this.model ? this.model.id : -1);
        },

        afterRender : function () {
            this.$('#sight-tags').tagsInput({
                height : '50px;',
                defaultText : Templater.i18n('sight_add_tag')
            });
            this.$('#sight-links').tagsInput({
                height : '50px;',
                defaultText : Templater.i18n('sight_add_link')
            });
            this.$('.sight-pick-help').popover({
                title : Templater.i18n('sight_pick_on_map'),
                content : Templater.i18n('sight_pick_on_map_help'),
                placement : 'right',
                trigger : 'hover'
            });

            if (!this.model || this.model.get('unknown')) {
                this.disableForm();
            }
            else {
                this.enableForm();
            }

            var that = this;
            _.each(this.state, function (state, target) {
                that.setStatus(target, state);
            });
        },

        disableForm : function () {
            this.$('input, textarea, button').attr('disabled', 'disabled');
        },

        enableForm : function () {
            this.$('input, textarea, button').removeAttr('disabled');
        },
    });


    return SightFormView;
});

