/*global define*/
define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    'use strict';

    var SightCollection;

    SightCollection = Backbone.Collection.extend({
        parse : function (resp) {
            var index;
            // check for unknown-model in collection;
            _.each(resp, function (model, i) {
                if (model.unknown) {
                    index = i;
                }
            });

            this.createUnknownModel(index ? resp.splice(index, 1)[0] : null);

            return resp;
        },

        get : function (id) {
            if (id === 'unknown' || id === this.unknownModel.id) {
                return this.unknownModel;
            }
            else {
                return Backbone.Collection.prototype.get.apply(this, arguments);
            }
        },

        createUnknownModel : function (model) {
            var that = this;
            if (model) {
                this.unknownModel = new this.model(model);
                this.unknownModel.url = this.url + model.id;
            }
            else {
                this.unknownModel = new this.model({
                    unknown : true,
                    name : 'unknown'
                });
                this.unknownModel.url = this.url;
                this.unknownModel.save(null, {
                    success : function (model) {
                        that.unknownModel.url = that.url + model.id;
                    }
                });
            }
        },

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

