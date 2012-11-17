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

        addImage : function (file, options) {
            var name, pictures, picture; 

            file = file instanceof Backbone.Model ? file.toJSON() : file;

            if (file && (name = file.name)) {
                options || (options = function () {});
                pictures = this.attributes.pictures;
                picture = _.find(pictures, function (p) {
                    return p.name === name; 
                });

                if (picture) {
                    // update this picture
                    picture.url = file.url;
                    picture.title = file.title;
                    picture.description = file.description;
                    picture.takeDate = file.takeDate;
                    picture.editDate = (new Date()).getTime();
                    //picture.ownerId = TODO
                }
                else {
                    picture = {
                        title : file.title,
                        name : file.name,
                        description : file.description,
                        takeDate : file.takeDate,
                        uploadDate : (new Date()).getTime(),
                        editDate : (new Date()).getTime(),
                        origUrl : file.url,
                        url : 'pictures/edited/' + file.name,
                        thumb : 'pictures/thumb/' + file.name,
                        //ownerId : TODO
                    };
                    pictures.push(picture);
                }
                
                this.save(null, options);
            }
        },

        removeImage : function (id, options) {
            var pictures, index;

            if (id) {
                options || (options = function () {});
                pictures = this.attributes.pictures;
                index = -1;
                _.find(pictures, function (p) {
                    index += 1;
                    return p.id === id; 
                });

                if (index >= 0) {
                    pictures.splice(index, 1);
                    this.save(null, options);
                }
            }
        }
    });

    return SightModel;
});
