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
            file = file instanceof Backbone.Model ? file.toJSON() : file;
            
            var pictures = this.attributes.pictures,
                picture = _.find(pictures, function (p) {
                    return p.name === file.name; 
                });

            if (picture) {
                // update this picture
                console.log('updating: ', picture);
                picture.url = file.url;
            }
            else {
                picture = {
                    title : file.title,
                    name : file.name,
                    origUrl : file.url,
                    url : 'pictures/edited/' + file.name,
                    thumb : 'pictures/thumb/' + file.name
                };
                pictures.push(picture);
            }
            
            this.save();
        }
    });

    return SightModel;
});
