/*global define*/
define([
    
], function () {
    'use strict';

    var FileHandler;

    FileHandler = function () {
    };

    FileHandler.prototype = {
        filter : function (filter) {
            this._filter = filter;
            return this;
        },

        fileMatchesFilter : function (file) {
            console.log(file);
            return true;
        },

        getBeautifiedFileName : function (file) {
            var name = file.name;
            name = name.replace(/\.(jpg|jpeg|png|gif|tiff)/, '');
            name = name.replace(/(^|_+)(\S)/g, function (match, group1, group2) {
                return ' ' + group2.toUpperCase();
            });
            name = name.replace(/by\s[\s\S]*$/i, '');
            return name;
        },

        sliceFile : function (file, len, offset) {
            offset || (offset = 0);
            if (file.slice) {
                filePart = file.slice(offset, len);
            } else if (file.webkitSlice) {
                filePart = file.webkitSlice(offset, len);
            } else if (file.mozSlice) {
                filePart = file.mozSlice(offset, len);
            } else {
                filePart = file;
            }
            return filePart;
        },

        getDataURL : function (file, callback) {
            var that = this, worker/*,
                fileSlice = this.sliceFile(file, 131072)*/;

            if (window.Worker) {
                worker = new Worker('js/workers/filereader.js');
                worker.onmessage = function (e) {
                    callback(that.getFileDataURL(e.data, file));
                };
                worker.postMessage(file);
            }
            else {
                this.reader = new FileReader();
                this.reader.onload = function (e) {
                    callback(that.getFileDataURL(e.target.result, file));
                };
                this.reader.readAsDataURL(file);
            }
        },

        getFileDataURL : function (data, file) {
            var result = {
                url : data,
                name : file.name,
                type : file.type,
                title : this.getBeautifiedFileName(file),
                file : file
            };
            return result;
        },
    };

    return {
        create : function () {
            return new FileHandler();
        },
        // Expose to be to be oetendable.
        FileHandler : FileHandler
    };
});
