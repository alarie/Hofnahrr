/*global define*/
define([
    'underscore',
    'backbone',
    'helpers/file-upload',   
], function (
    _, Backbone, FileUpload
) {
    'use strict';

    var FileModel;

    FileModel = Backbone.Model.extend({

        defaults : {
            doUpload : true,
            uploaded : false
        },
        
        // Overwrite default save, so the image is JUST uploaded once the
        // the upload function is called.
        // This is necessary because Collection.create implicitly calls
        // save and would thus trigger the upload. 
        save : function (attributes, options) {},

        upload : function (attributes, options) {
            var that = this,
                uploader = new FileUpload(this.url);

            if (attributes) {
                this.set(attributes);
            }
            
            uploader.on('success', function (data) {
                that.onUploaded(data, options);
            });

            this.trigger('upload-started');

            uploader.upload(this.attributes.file);
        },

        onUploaded : function (result, options) {
            var attrs;

            options || (options = {});

            this.set(_.extend(result, {
                uploaded : true,
                doUpload : false,
                origFileName : this.attributes.name,
                url : result.name
            }));

            delete this.attributes.file;

            attrs = _.clone(this.attributes);
            attrs.id = result.name;

            this.trigger('uploaded', attrs);

            this.trigger('upload-succeeded', attrs);

            if (options.success) {
                console.log("TODO: set success args");
                options.success();
            }

            delete this.attributes.id;
            delete this.id;
            this.destroy();
        }
    
    });

    return FileModel;
});
