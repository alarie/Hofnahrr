/*global define*/
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var SightCollection;

    SightCollection = Backbone.Collection.extend({
        add : function (models) {
            var index = this.length + 1,
                that = this;

            Backbone.Collection.prototype.add.apply(this, arguments);

            _.each(models, function (model) {
                // TODO handle new items
                if (model.id) {
                    that.get(model.id).set({
                        index : index
                    });
                    index += 1;
                }
            });

            return this;
        }  
    });

    return SightCollection;
});

