/*global define*/
define([
    'underscore', 'backbone', 'collections/picture-collection'
], function (_, Backbone, PictureCollection) {
    'use strict';

    var SightModel;

    SightModel = Backbone.Model.extend({
        defaults : {
            name : '',
            description : ''
        },

        initialize : function () {
            _.bindAll(this, 'setPictureCollectionURL');
            this.pictures = new PictureCollection({
                sightId : this.id,
                url : this.url()
            });
            
            this.change({'id' : this.setPictureCollectionURL});
        },

        setPictureCollectionURL : function () {
            this.pictures.setURL(this.url());
        },

        addImages : function (files) {
            var that = this;
            _.each(files, function (file) {
                that.pictures.create({
                    file : file
                });
            });
        }
    });

    return SightModel;
});
