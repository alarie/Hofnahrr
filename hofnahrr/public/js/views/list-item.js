/*global define*/
define([
    'underscore', 'views/template'
], function (_, TemplateView) {
    'use strict';

    var ListItemView;

    ListItemView = TemplateView.extend({
        events : function () {
            return {
                'click' : '_onItemSelected'
            };
        },

        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, '_onItemSelected');
        },

        _onItemSelected : function () {
            this.trigger('item-selected', this.$el, this.model);
        }
    });

    return ListItemView;
});

