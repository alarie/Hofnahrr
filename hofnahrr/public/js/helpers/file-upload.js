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

        _.bindAll(this);
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

            //xhr.upload.addEventListener('progress', this.onProgress);
            //xhr.upload.addEventListener('load', onLoad);
            xhr.addEventListener('readystatechange', this.onLoad);
            return xhr;
        },

        onProgress : function (e) {
            if (e.lengthComputable) {
                this.trigger('progress', e.loaded, e.total);
            }
        },

        onLoad : function (e) {
            var xhr = e.target;
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.trigger('loaded', JSON.parse(xhr.responseText));
                }
            }
            else {
                this.onProgress(e);
            }

        }
    };

    _.extend(FileUpload.prototype, Backbone.Events);
 
    return FileUpload;
});
