/*global define*/
define([
    'underscore',
    'data-retriever',
    'templater',
    'views/templated-bridge',
    'text!tmpl/sight-form.tmpl',
], function (
    _,
    DataRetriever,
    Templater,
    TemplatedBridgeView, 
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
                'click .sight-delete' : 'onDelete'
            };
        },

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onSubmit');
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

