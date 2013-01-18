/*global define*/
define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    'use strict';

    var SightCollection;

    SightCollection = Backbone.Collection.extend({
        parse : function (resp) {
            var index = -1, 
                unknown = null;
            
            // check for unknown-model in collection;
            _.each(resp, function (model, i) {
                if (model.unknown) {
                    index = i;
                }
            });

            if (index >= 0) {
                unknown = resp.splice(index, 1)[0];
            }
            
            this.createUnknownModel(unknown);

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

        add : function (models, options) {
            var index = this.length + 1,
                that = this;

            _.each(models, function (model) {
                // exists, so don't create index
                if (!that.get(model.id)) {
                    model.index = index;
                    index += 1;
                }
            });

            Backbone.Collection.prototype.add.call(this, models, options);

            return this;
        }
    });

    return SightCollection;
});

