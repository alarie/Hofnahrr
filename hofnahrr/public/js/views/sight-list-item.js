/*global define*/

/**
 * @file sight-list-item.js
 * TODO merge with ListItemView
 */

define([
    'underscore', 'views/list-item'
], function (_, ListItemView) {
    'use strict';

    var SightListItemView;

    SightListItemView = ListItemView.extend({
        initialize : function () {
            ListItemView.prototype.initialize.apply(this, arguments);
        },

        render : function (additionalData) {
            this.beforeRender();
            var data = this.model ? this.model.toJSON() : {};

            if (additionalData) {
                _.extend(data, additionalData);
            }

            this.$el.empty().append(this._compiledTemplate(data));

            this.afterRender();
            return this;
        }
    });

    return SightListItemView;
});

