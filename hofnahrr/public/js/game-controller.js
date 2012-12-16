/*global define*/
define([
    'underscore', 'backbone',
    'templater',

    'collections/game-collection',
    'models/game',

    'settings',

    'views/template',
    'views/game-sidebar',
    'views/game-time',
    'views/game-location',
    'views/modal',
    'views/game-highscore',

    'text!layout/game.html',
    'text!tmpl/game-nav.tmpl',
    'text!tmpl/game-sidebar.tmpl',
    'text!tmpl/game-select.tmpl',
    'text!tmpl/game-list-item.tmpl',
    'text!tmpl/modal.tmpl'
], function (
    _, 
    Backbone,
    Templater,

    GameCollection,
    GameModel,

    settings,

    TemplateView,
    GameSidebarView,
    TimeGameView,
    LocationGameView,
    ModalView,
    GameHighscoreView,

    tmplGameLayout,
    tmplGameNav,
    tmplGameSidebar,
    tmplGameSelect,
    tmplGameListItem,
    tmplModal
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
            this.initQuestionCollection();
            this.createGameCollection();

            this._gameControllerInstalled = true;
            this.layouts.game = tmplGameLayout;
            this.questionCollectionIndex = 1;

            this.on('layout-set:game', this.initGameLayout);

            this.currentGame = {
                type : 'location', 
                playerid : 'todo',
                score : 'score',
                date : Date.now(),
                time : 'todo',
                level : this.level,
                correct : 0
            };

            console.log('init', this);
        },

        initQuestionCollection : function () {
            this.questionCollection = new Backbone.Collection();
            this.questionCollection.on('reset', this.gameSidebar.onAddAll);
        },

        createGameCollection : function () {
            this.gameCollection = new GameCollection();
            this.gameCollection.model = GameModel;
            this.gameCollection.url = settings.API.GAMES;
            this.gameCollection.fetch();
        },

        createGameViews : function () {
            this.createGameSecondaryNavView();
            this.createGameSidebarView();
            this.createGameSelectView();
            this.createTimeGameView();
            this.createLocationGameView();
            this.createGameHighscoreView();
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
                className : 'container padded',
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
            var view = new TimeGameView({
                className : 'container padded'
            });
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

            this.time = Date.now();

            this.currentGame.level = level;
            view.setLevel(level);
            view.render();

            view.setModel(this.questionCollection.first());

            this.setMainView(view);
        },

        onGameProgress : function () {

            var percentage = this.questionCollectionIndex / this.questionCollection.length * 100,
                progressSummaryData = {length : this.questionCollection.length, index : this.questionCollectionIndex, diff : this.questionCollection.length - this.questionCollectionIndex, percentage : percentage};
            this.gameSidebar.setGameProgress(progressSummaryData);

            if (this.questionCollectionIndex < this.questionCollection.length) {
                this.locationGameView.setModel(this.questionCollection.at(this.questionCollectionIndex));
                this.questionCollectionIndex++;
            } else {
                //if last model - calculate scores and end
                //open popup with highscore
                this.onEndOfGame();

            }

        },

        onEndOfGame : function () {
            console.log('end of game!!!');
            //open highscore modal / collection auslesen

            //create game object pass it to highscore view

            this.questionCollection.forEach(function (item) {
                if (item.attributes.correct) {
                    this.currentGame.correct++;
                }
            }, this);

            this.currentGame.time = Math.floor((Date.now() - this.time) / 1000);
            this.currentGame.score = this.currentGame.correct * 1000 - this.currentGame.time; // a real score calculation
            //open modal with current Game model and highscore list
            // this.gameHighscoreView.setModel()
            this.openHighscoreModal();
            this.storeCurrentGame();
            
        },

        openHighscoreModal : function () {
            var that = this,
                highscoreModal;

            if (!this.highscoreModal) {
                highscoreModal = new ModalView({
                    el : 'body',
                    template : tmplModal,
                    modalOptions : {
                        show : false,
                        backdrop : true
                    },
                    modalData : {
                        modalClassName : 'orange',
                        modalId : 'game-highscore-modal',
                        modalHeadline : Templater.i18n('game_highscore'),
                        modalClose : Templater.i18n('modal_close')
                    }
                });

                this.highscoreModal = highscoreModal;
                this.highscoreModal
                    .render()
                    .setContentViews([{
                        view : this.gameHighscoreView
                    }]);
            }
            this.highscoreModal.modal.show();
        },

        storeCurrentGame : function () {            
            var that = this;
            this.currentGameModel = this.gameCollection.create(this.currentGame, {
                success : function () {
                    that.gameHighscoreView.setModel(that.currentGameModel);
                    that.gameHighscoreView.setHighscoreCollection(that.gameCollection);
                }
            });
        },

        onResetGame : function (visitor) {
            var data = this.visitSightCollection(visitor);
            this.questionCollection.reset(data);
            this.questionCollectionIndex = 1;
        },

        createGameHighscoreView : function () {
            this.gameHighscoreView = new GameHighscoreView();
        }
    };


    return {
        installTo : function (target) {
            _.extend(target, GameController);
            GameController.init.apply(target);
        }
    };
});
