/*global define*/
define([
    'underscore',
    'views/template' 
], function (_, TemplateView) {
    'use strict';

    var ListView;

    ListView = TemplateView.extend({
        initialize : function (options) {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onAdd', 'onAddAll');
        },
        onAdd : function (item) {
            var view = new TemplateView({
                    el : $('<li/>'),
                    template : this.options.listItemTemplate,
                    model : item
                });
            this.$el.find('ul #sight-list-header').after(view.render().el);
        },
        onAddAll : function (collection) {
            collection.each(this.onAdd);
        }
    });

    return ListView;
});
