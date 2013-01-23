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

            if (!(file instanceof window.File)) {
                file = this._dataURItoBlob(file);
            }

            this.formData.append('File', file);
            
            xhr.open('POST', this.path, true);
            xhr.overrideMimeType('multipart/form-data');

            xhr.send(this.formData);
        },

        // http://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript
        _dataURItoBlob : function (dataURI) {
            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            var byteString = atob(dataURI.split(',')[1]),

            // separate out the mime component
                mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],

            // write the bytes of the string to an ArrayBuffer
                ab = new ArrayBuffer(byteString.length),
                ia = new Uint8Array(ab),
                i, bb;
            for (i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            bb = new window.Blob([ab], {
                type : mimeString
            });
            return bb;
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
                response = this.parseResponse(xhr);
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

        parseResponse : function (xhr) {
            var resp = xhr.responseText,
                contentType = xhr.getResponseHeader('content-type');

            if (contentType === 'application/json') {
                resp = JSON.parse(resp);
            }

            return resp;
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
