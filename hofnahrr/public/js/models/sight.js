/*global define*/
define([
    'underscore', 'backbone', 'collections/picture-collection'
], function (_, Backbone, PictureCollection) {
    'use strict';

    var SightModel;

    SightModel = Backbone.Model.extend({
        defaults : {
            name : '',
            description : '',
            location : {},
            tags : [],
            links : [],
            pictures : []
        },

        addImage : function (file) {
            console.log(file);
            var pictures = this.attributes.pictures,
                picture = _.find(pictures, function (p) {
                    return p.name === file.name; 
                });

            if (picture) {
                // update this picture
                console.log('updating: ' + picture.name);
                picture.url = file.url;
            }
            else {
                picture = {
                    title : file.title,
                    name : file.name,
                    url : file.url
                };
                pictures.push(picture);
            }

            this.trigger('change:pictures');
            this.trigger('change');
        }
    });

    return SightModel;
});
