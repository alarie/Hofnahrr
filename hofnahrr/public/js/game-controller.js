/*global define*/
define([
    'underscore', 'backbone', 
    'views/template',
    'views/game-sidebar',
    'views/game-time',
    'views/game-location',

    'text!layout/game.html',
    'text!tmpl/game-nav.tmpl',
    'text!tmpl/game-sidebar.tmpl',
    'text!tmpl/game-select.tmpl',
    'text!tmpl/game-list-item.tmpl'
], function (
    _, 
    Backbone, 
    TemplateView,
    GameSidebarView,
    TimeGameView,
    LocationGameView,
    tmplGameLayout,
    tmplGameNav,
    tmplGameSidebar,
    tmplGameSelect,
    tmplGameListItem
) {
    'use strict';

    var GameController;

    GameController = {
        init : function () {
            _.bindAll(this, 
                    'onOpenGame', 
                    'onOpenGamePlay',
                    'onResetGame');

            this.createGameViews();
            this.initGameCollection();

            this._gameControllerInstalled = true;
            this.layouts.game = tmplGameLayout;
            this.gameCollectionIndex = 1;

            this.on('layout-set:game', this.initGameLayout);

            console.log('init', this);
        },

        initGameCollection : function () {
            this.gameCollection = new Backbone.Collection();
            this.gameCollection.on('reset', this.gameSidebar.onAddAll);
        },

        createGameViews : function () {
            this.createGameSecondaryNavView();
            this.createGameSidebarView();
            this.createGameSelectView();
            this.createTimeGameView();
            this.createLocationGameView();
        },

        createGameSidebarView : function () {
            this.gameSidebar = new GameSidebarView({
                template : tmplGameSidebar,
                itemViewConstructor : TemplateView,
                itemViewData : {
                    tagName : 'li',
                    template : tmplGameListItem
                }
            }).render();
        },

        createGameSecondaryNavView : function () {
            var data = {}; 

            this.gameNav = new TemplateView({
                template : tmplGameNav
            })
            .render();
        },

        createGameSelectView : function () {
            var view = new TemplateView({
                template : tmplGameSelect,
                events : {
                    'click .start-game' : function (e) {
                        var gameType = $(e.target).hasClass('start-time-game') ?
                                'time' :
                                'location',
                            level = view.$('[name="level"]:checked').val();

                        e.preventDefault();
                        e.stopPropagation();
    
                        window.location.hash = 'game/play/' + gameType + '/' + 
                            level + '/';
                    }
                }
            });
            view.render();
            this.gameSelectView = view;
        },

        createTimeGameView : function () {
            var view = new TimeGameView();
            view.on('game-progress', this.gameSidebar.setGameProgress);
            view.on('game-reset', this.onResetGame);
            this.timeGameView = view;
        },

        createLocationGameView : function () {
            var view = new LocationGameView();
            view.on('game-progress', this.onGameProgress, this);
            view.on('game-reset', this.onResetGame);
            this.locationGameView = view;
        },

        initGameLayout : function () {
            $('body').addClass('orange');
            this.appendSecondaryNavView(this.gameNav);
            this.appendGameSidebar();
        },

        appendGameSidebar : function () {
            $('#sidebar').empty().append(this.gameSidebar.el);
        },

        onOpenGame : function () {
            this.setLayout('game');
            this.setMainView(this.gameSelectView);
        },

        onOpenGameHelp : function () {
            this.setLayout('game');
        },

        onOpenGamePlay : function (type, level) {
            this.setLayout('game');
            var view = type === 'time' ? 
                                this.timeGameView : 
                                this.locationGameView;

            
            view.setLevel(level);
            view.render();

            view.setModel(this.gameCollection.first());

            this.setMainView(view);
        },

        onGameProgress : function () {

            // get next model

            if (this.gameCollectionIndex < this.gameCollection.length) {
                this.locationGameView.setModel(this.gameCollection.at(this.gameCollectionIndex));
                this.gameCollectionIndex++;

                //calculate progressanzeige
                var progressStep = {length : this.gameCollection.length};
                progressStep.countReplied = 10;

                console.log(progressStep);

                this.gameSidebar.setGameProgress(this.gameCollection.length);
            } else {
                //if last model - calculate scores and end
                console.log('end of game');
            }

        },

        onResetGame : function (visitor) {
            var data = this.visitSightCollection(visitor);
            console.log(data);
            this.gameCollection.reset(data);
            this.gameCollectionIndex = 1;
        }
    };


    return {
        installTo : function (target) {
            _.extend(target, GameController);
            GameController.init.apply(target);
        }
    };
});