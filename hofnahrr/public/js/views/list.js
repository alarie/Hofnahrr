/*global define*/

/**
 * @file list.js
 * @description Defines a ListView. This view can be used to render
 * Backbone.Collection instances.
 */

define([
    'underscore',
    'views/template',
    'views/list-item'
], function (_, TemplateView, ListItemView) {
    'use strict';


    var ListView;

    /**
     * @class ListView
     */
    ListView = TemplateView.extend({
        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onAdd', 'onAddAll', '_onItemModelSelected');

            this.itemViewConstructor = this.options.itemViewConstructor || 
                ListItemView;

            this.reset();
        },

        reset : function () {
            this.views = [];
            (this.options.listElemSelector ? 
                this.$(this.options.listElemSelector) :
                this.$el).empty();
        },

        onAdd : function (item) {
            var view = this.createItemView(item); 
            this.appendView(view);
            this.views.push(view);
        },

        onAddAll : function (collection) {
            this.reset();
            collection.each(this.onAdd);
        },

        _onItemModelSelected : function ($el, model) {
            this.$('.active').removeClass('active');
            $el.addClass('active');
            this.trigger('item-selected', model);
        },

        /**
         * Creates the view for an item in the collection. Overwrite for custom
         * behaviour.
         * @param {Object} item The Item for which a view shall be created.
         */
        createItemView : function (item) {
            var view = new this.itemViewConstructor(_.extend({
                tagName : 'li',
                template : this.options.listItemTemplate,
                model : item
            },
            this.options.listItemOptions  || {}));

            view.on('item-selected', this._onItemModelSelected);

            return view;
        },

        /**
         * Adds an item's view to this view. Can be overwritten for a custom
         * behaviour.
         * @param {Backbone.View} view The view of a new item that should be
         * added to this view.
         */
        appendView : function (view) {
            (this.options.listElemSelector ? 
                this.$(this.options.listElemSelector) :
                this.$el)
                    .append(view.render().el);
        }
    });

    return ListView;
});
