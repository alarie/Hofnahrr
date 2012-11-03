/*global define*/
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    'use strict';

    var PictureCollection;

    PictureCollection = Backbone.Collection.extend({
        initialize : function () {
            _.bindAll(this, 'setURL');
        },

        setURL : function (url) {
            this.url = url;
        },

    });

    return PictureCollection;
});
