/*global define*/
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    'use strict';

    var FileUpload = function (path) {
        this.path = path;
        this.xhr = null;
        this.progress = null;

        this.formData = new FormData();

        this.onProgress = this.onProgress.bind(this);
        this.onLoaded = this.onLoaded.bind(this);
    };

    FileUpload.prototype = {
        upload : function (file) {
            var xhr = this.prepareUpload();

            this.formData.append('File', file);
            
            xhr.open('POST', this.path, true);
            xhr.overrideMimeType('multipart/form-data');

            xhr.send(this.formData);
        },

        prepareUpload : function () {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', this.onProgress);
            xhr.upload.addEventListener('load', this.onLoaded);
            xhr.addEventListener('load', this.onLoaded);
            return xhr;
        },

        onProgress : function (e) {
            if (e.lengthComputable) {
                this.trigger('progress', e.loaded, e.total);
            }
        },

        onLoaded : function (e) {
            this.trigger('loaded', e);
        }
    };

    _.extend(FileUpload.prototype, Backbone.Events);
 
    return FileUpload;
});
