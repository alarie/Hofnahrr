/*global define*/
define([
    'underscore', 'backbone', 'collections/picture-collection'
], function (_, Backbone, PictureCollection) {
    'use strict';

    var SightModel;

    SightModel = Backbone.Model.extend({
        defaults : {
            name : 'No Name',
            description : '',
            location : {},
            tags : [],
            links : [],
            pictures : [],
            mosaic : []
        },

        addImage : function (file, options) {
            var name, pictures, picture;

            file = file instanceof Backbone.Model ? file.toJSON() : file;

            if (file && (name = file.name)) {
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
                        id : file.id,
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
                this.savePictures(options);
            }
        },

        removeImage : function (id, options) {
            var pictures, index, that = this;

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
                    this.savePictures(options);
                }
            }
        },

        editImages : function (imageIds, data, options) {
            var pictures = this.attributes.pictures, picture, index;
            _.each(imageIds, function (id) {
                index = -1;
                picture = _.find(pictures, function (p) {
                    index += 1;
                    return p.id === id;
                });
                _.extend(pictures[index], data);
            });
            this.savePictures(options);
        },

        savePictures : function (options) {
            var that = this;
            options || (options = {});
            this.save(null, {
                success : function (model, data) {
                    that.trigger('change:pictures', model.attributes.pictures);
                    if (options.success) {
                        options.success.apply(null, arguments);
                    }
                },
                error : function () {
                    if (options.error) {
                        options.error.apply(null, arguments);
                    }
                }
            });
        },

        getLocation : function () {
            var location = this.attributes.location; 
            return location && location.latitude && location.longitude ?
                location : 
                null;
        }
    });

    return SightModel;
});
