/*global define*/
define([
    'underscore',
    'data-retriever',
    'templater',
    'views/templated-bridge',
    'settings',
    'text!tmpl/sight-form.tmpl'
], function (
    _,
    DataRetriever,
    Templater,
    TemplatedBridgeView, 
    Settings,
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
                'click .sight-delete' : 'onDelete',
                'input #sight-name' : 'onSightNameChanged'
            };
        },

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onSubmit');
        },

        onSightNameChanged : function (e) {
            var val = e.target.name,
                url = 'http://maps.googleapis.com/maps/api/geocode/json?address=St.%20Marien,' + Settings.CITY + '&sensor=false',
                latInput = this.$('#sight-location-lat'),
                lngInput = this.$('#sight-location-lng'),
                help = lngInput.siblings('.help-inline');

            if (val.length > 3) {
                $.ajax({
                    url : url,
                    success : function (data) {
                        if (data && data.results && data.results.length) {
                            data = data.results[0];
                            var location = data.geometry.location;
                            latInput.val(location.lat);
                            lngInput.val(location.lng);
                            help.text(data.formatted_address);
                        }
                    }
                });
            }
        },

        onSubmit : function (e) {
            e.preventDefault();

            if (e.target.checkValidity()) {
                var origData,
                    data = (new DataRetriever({
                        el : $(e.target)
                    })).getData();

                data.location = {
                    latitude : data.lat,
                    longitude : data.lng
                };
                data.tags = data.tags.split(',');
                data.links = data.links.split(',');

                delete data.lat;
                delete data.lng;

                origData = this.model ? this.model.toJSON() : {};

                _.extend(origData, data);

                this.trigger('create-sight', origData);
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
        }
    });


    return SightFormView;
});

