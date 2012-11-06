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

        onLoad : function (e) {
            var xhr = e.target,
                response;

            if (xhr.readyState === 4) {
                response = this.getResponse(xhr);
                if (xhr.status === 200) {
                    this.trigger('success', response, xhr.statusText, xhr);
                }
                else {
                    this.trigger('error', xhr, xhr.statusText);
                }
            }
            else {
                this.onProgress(e);
            }
        },

        onProgress : function (e) {
            if (e.lengthComputable) {
                this.trigger('progress', e.loaded, e.total);
            }
        },

        getResponse : function (xhr) {
            var mimeType = xhr.getResponseHeader('content-type'),
                response = xhr.responseText;

            if (mimeType === 'application/json') {
                response = JSON.parse(response);
            }
            else if (mimeType === 'text/xml' && xhr.responseXML) {
                response = xhr.responseXML;
            }
            
            return response;
        }
    };

    _.extend(FileUpload.prototype, Backbone.Events);
 
    return FileUpload;
});
