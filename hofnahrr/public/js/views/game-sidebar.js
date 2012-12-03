/*global define*/
define([
    'underscore',
    'backbone',
    'views/template'
], function (_, Backbone, TemplateView) {
    'use strict';

    var GameSidebarView;

    GameSidebarView = TemplateView.extend({
        initialize : function (options) {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onAdd', 'onAddAll', 'setGameProgress');

            this.itemViewConstructor = options.itemViewConstructor || 
                Backbone.View;
            this.itemViewData = options.itemViewData || {};
        },

        setGameProgress : function (progressStep) {
             
        },

        onAdd : function (itm) {
            var view = new (this.itemViewConstructor)(_.extend(this.itemViewData, {
                model : itm
            }));
            this.$('#game-progress').append(view.render().el);
        },

        onAddAll : function (collection) {
            this.$('#game-progress').empty();
            collection.each(this.onAdd);
        }
    });

    return GameSidebarView;
});

