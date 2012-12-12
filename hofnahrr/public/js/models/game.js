/*global define*/
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    'use strict';

    var GameModel;

    GameModel = Backbone.Model.extend({
        defaults : {
            playername : 'Unbekannt'
        },
    });

    return GameModel;
});
