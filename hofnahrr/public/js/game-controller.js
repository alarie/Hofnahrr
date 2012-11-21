/*global define*/
define([
    'underscore', 'backbone', 
    'views/template',

    'text!layout/game.html',
    'text!tmpl/game-nav.tmpl'
    
], function (
    _, 
    Backbone, 
    TemplateView,
    tmplGameLayout,
    tmplGameNav
) {
    'use strict';

    var GameController;

    GameController = {
        init : function () {
            _.bindAll(this, 
                    'onOpenGame', 
                    'onOpenGamePlay');

            this.createGameViews();

            this._gameControllerInstalled = true;
            this.layouts.game = tmplGameLayout;

            this.on('layout-set:game', this.initGameLayout);
        },

        createGameViews : function () {
            this.createGameSecondaryNavView();
        },

        createGameSecondaryNavView : function () {
            var data = {}; 

            this.gameNav = new TemplateView({
                template : tmplGameNav
            })
            .render();
        },

        initGameLayout : function () {
            $('body').addClass('orange');
            this.appendSecondaryNavView(this.gameNav);
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

