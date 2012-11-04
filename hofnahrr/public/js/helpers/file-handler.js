/*global define*/
define([
    
], function () {
    'use strict';

    var FileHandler;

    FileHandler = function () {
        this.reader = new FileReader();
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

        getDataURL : function (file, callback) {
            var that = this;
            this.reader.onload = function (e) {
                callback(that.getFileDataURL(e.target, file));
            };
            this.reader.readAsDataURL(file);
        },

        getFileDataURL : function (data, file) {
            var result = {
                url : data.result,
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
