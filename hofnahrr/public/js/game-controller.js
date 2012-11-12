/*global define*/
define([
    'underscore', 'backbone', 
    'templater',
], function (
    _, Backbone, Templater
) {
    'use strict';

    var GameController;

    GameController = {
        init : function () {
            this._gameControllerInstalled = true;
        },
    };


    return {
        installTo : function (target) {
            _.extend(target, GameController);
            GameController.init.apply(target);
        }
    };
});

