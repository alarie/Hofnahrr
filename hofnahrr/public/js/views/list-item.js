/*global define*/

/**
 * @file list-item.js
 * @description Simple view for rendering list items in a list. May be handed a
 * template to use to render the item.
 */

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
            _.bindAll(this, '_onItemSelected', 'remove');
            this.model.on('destroy', this.remove);
        },

        _onItemSelected : function () {
            this.trigger('item-selected', this.$el, this.model);
        }
    });

    return ListItemView;
});

