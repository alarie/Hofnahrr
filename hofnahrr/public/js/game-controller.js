/*global define*/
define([
    'underscore', 'backbone', 
    'views/template',

    'text!layout/game.html'
], function (
    _, 
    Backbone, 
    TemplateView,
    tmplGameLayout
) {
    'use strict';

    var GameController;

    GameController = {
        init : function () {
            _.bindAll(this, 
                    'onOpenGame', 
                    'onOpenGamePlay');


            this._gameControllerInstalled = true;
            this.layouts.game = tmplGameLayout;

        },

        onOpenGame : function () {
            this.setLayout('game');
            var view = new TemplateView({
                templtate : ''
            });
            this.setMainView(view);
        },

        onOpenGamePlay : function (type, level) {
            this.setLayout('game');
        }
    };


    return {
        installTo : function (target) {
            _.extend(target, GameController);
            GameController.init.apply(target);
        }
    };
});

