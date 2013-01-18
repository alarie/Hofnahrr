/*global define*/
define([
    'underscore', 'backbone',
    'templater',

    'collections/game-collection',
    'models/game',
    'models/sight',

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
    SightModel,

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

    /**
     * @class
     * Provides functionality for the games, e.g. gets data needed for the questions,
     * initializes needed views, adds new highscores and keeps control of the game 
     * logic. 
     * Is mixed into the AppController.
     */
    var GameController;


    GameController = {
        /*
         * Constructorfunction
         */
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
        },

        /*
         * Initializes the questionCollection.
         * The collection contains the questions a user has to answer.
         */
        initQuestionCollection : function () {
            this.questionCollection = new Backbone.Collection();
            this.questionCollection.on('reset', this.gameSidebar.onAddAll);
        },

        /*
         * Initializes the gameCollection
         * The collection contains the highscores of all games played and
         * is synchronized with the server
         */
        createGameCollection : function () {
            this.gameCollection = new GameCollection();
            this.gameCollection.model = GameModel;
            this.gameCollection.url = settings.API.GAMES;
            this.gameCollection.comparator = function (game) {
                return game.get('score') * -1;
            };
            this.gameCollection.fetch();
        },

        /*
         * Starts the creation of all views needed.
         */
        createGameViews : function () {
            this.createGameSecondaryNavView();
            this.createGameSidebarView();
            this.createGameSelectView();
            this.createTimeGameView();
            this.createLocationGameView();
            this.createGameHighscoreView();
            this.createGameStartView();
        },

        /*
         * Creates the View for the Sidebar.
         * The Sidebar displays the progress of a running game.
         */
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

        /*
         * Creates the view for the secondary navigation.
         * The view displays e.g. the exit button
         */
        createGameSecondaryNavView : function () {
            var data = {},
                GameNavView = TemplateView.extend({
                    template : tmplGameNav,
                    hideNewGameButton : function (progressSummaryData) {
                        this.$('#newgame').addClass("hide");
                    },
                    showNewGameButton : function (progressSummaryData) {
                        this.$('#newgame').removeClass("hide");
                    }
                });

            this.gameNav = new GameNavView().render();
        },

        /*
         * Creates the view for selecting a game mode.
         * The view is displayed in the GameSidebar on
         * the startpage of the game section. If the user
         * clicks on a game (e.g. assigning game) the game
         * starts.
         */
        createGameSelectView : function () {
            var view = new TemplateView({
                className : 'gameselectview',
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
            this.gameSidebar.setGameSelect(this.gameSelectView);
        },

        /*
         * Creates the startpage of the game section.
         * The view displays a big catchy picture and the headline.
         */
        createGameStartView : function () {
            var view = new TemplateView({
                className : 'container padded gamestartview',
                template : '<h1>' + Templater.i18n('game_headline') + '</h1>'
            });
            view.render();
            this.gameStartView = view;
        },

        /*
         * Creates the view for the time game mode.
         * TODO This game mode is not implemented yet.
         */
        createTimeGameView : function () {
            var view = new TimeGameView({
                className : 'container padded'
            });
            view.on('game-progress', this.gameSidebar.setGameProgress);
            view.on('game-reset', this.onResetGame);
            this.timeGameView = view;
        },

        /*
         * Creates the for the location assigning game.
         * The view displays all elements needed for the game, e.g. the map.
         */
        createLocationGameView : function () {
            var view = new LocationGameView();
            view.on('game-progress', this.onGameProgress, this);
            view.on('game-reset', this.onResetGame);
            // view.on('game-add-pic-location', this.onAddPicLocation, this);
            this.locationGameView = view;
        },

        /*
         * Initiliazes the layout for the game section.
         */
        initGameLayout : function () {
            $('body').addClass('orange');
            this.appendSecondaryNavView(this.gameNav);
            this.appendGameSidebar();
        },

        /*
         * Adds the Game Sidebar to the according element.
         */
        appendGameSidebar : function () {
            $('#sidebar').empty().append(this.gameSidebar.el);
        },

        /**
         * Called when the game section (landing page) is called. Adds the needed
         * views to the surface.
         */
        onOpenGame : function () {
            this.setLayout('game');
            this.gameSidebar.reset();
            this.setMainView(this.gameStartView);
            this.gameSelectView.$el.slideDown();
            this.gameNav.hideNewGameButton();
        },

        /**
         * Called when the help button is clicked
         * TODO help is not implemented yet 
         */
        onOpenGameHelp : function () {
            this.setLayout('game');
        },

        /**
         * Called when a game is started.
         * Checks which game mode is selected and displays the according
         * view.
         */
        onOpenGamePlay : function (type, level) {
            this.setLayout('game');
            var view = type === 'time' ? 
                            this.timeGameView : 
                            this.locationGameView;

            this.time = Date.now();

            this.currentGame.level = level;
            view.setLevel(level);
            view.render();

            console.log('qc', this.questionCollection.length);
            if (this.questionCollection.length > 0) {
                view.setModel(this.questionCollection.first());
                this.gameSelectView.$el.slideUp();
                this.setMainView(view);
                this.gameNav.showNewGameButton();
            } else {
                window.location.hash = 'game/';
                alert('Hey there there are no sights you could play with!!!');
            }
        },

        /**
         * Called when a user answers a question.
         * Calculates the progress of the game and checks if the game ended.
         */
        onGameProgress : function (options) {

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

            /**
             * in case a the question was a joker question and the user
             * put in a location for the image this information is stored
             */
            if (options) {
                //piclocation abspeichern
                this.storePicLocation(options);
            }

        },

        /**
         * Stores a location of a picture on the server.
         * The location is the answer of a user to the joker question. It is
         * stored to the according picture in the "unknown"-sight
         */
        storePicLocation : function (options) {
            var that = this,
                location = options.location,
                pic = options.pic,
                piclocation = {playerid: this.currentUser.attributes.id, location: {lat: location.lat, lng: location.lng}},
                //hinzufügen zu unknwon sight
                unknownSight = this.sightCollection.get('unknown'),
                serverPic = _.find(unknownSight.attributes.pictures, function (pic) {
                    return pic.id === this.id;
                }, pic);

            if (!serverPic.locations) {
                serverPic.locations = [];
            }

            serverPic.locations.push(piclocation);
            unknownSight.save();
        },

        /**
         * Called on end of game. Calculates the highscore, opens the highscore modal
         * and stores the highscore in the gameCollection.
         */
        onEndOfGame : function () {
            //open highscore modal / collection auslesen
            //create game object pass it to highscore view
            this.questionCollection.forEach(function (item) {
                if (item.attributes.correct) {
                    this.currentGame.correct++;
                }
            }, this);

            this.currentGame.time = Math.floor((Date.now() - this.time) / 1000);
            this.currentGame.score = this.currentGame.correct * 1000 - this.currentGame.time; // a real score calculation
            this.currentGame.playername = this.currentUser.attributes.firstname ? this.currentUser.attributes.firstname : 'Unbekannt';

            //open modal with current Game model and highscore list
            this.openHighscoreModal();


            this.storeCurrentGame();
        },

        /**
         * Displays HighscoreModal. The modal displays the result of the current game,
         * a highscore list and buttons which allow the user to save or discard his result.
         */
        openHighscoreModal : function () {
            var that = this,
                highscoreModal;

            if (!this.highscoreModal) {
                highscoreModal = new ModalView({
                    el : 'body',
                    template : tmplModal,
                    modalOptions : {
                        show : false,
                        backdrop : 'static'
                    },
                    modalData : {
                        modalClassName : 'orange',
                        modalId : 'game-highscore-modal',
                        modalHeadline : Templater.i18n('game_highscore'),
                        modalClose : Templater.i18n('modal_cancel'),
                        modalSave : Templater.i18n('modal_save')
                    }
                });

                this.highscoreModal = highscoreModal;
                this.highscoreModal
                    .render()
                    .setContentViews([{
                        view : this.gameHighscoreView
                    }]);

                this.highscoreModal.modal.on('hide', function () {
                    
                    window.location.hash = 'game/';
                });
                this.highscoreModal.on('onSave', function () {
                    that.highscoreModal.modal.hide();
                })
                .on('onDataDismiss', function () {
                    console.log('datadismiss delete game');
                    console.log(that.gameCollection);
                    console.log(that.currentGameModel);
                    that.currentGameModel.destroy();
                    that.gameCollection.remove(that.currentGameModel);
                    console.log(that.currentGameModel);
                    console.log(that.gameCollection);
                });
            }
            this.highscoreModal.modal.show();
        },

        /**
         * Stores the current game in the highscore list (gameCollection)
         */
        storeCurrentGame : function () {            
            var that = this;
            this.currentGameModel = this.gameCollection.create(this.currentGame, {
                success : function () {
                    that.gameHighscoreView.setModel(that.currentGameModel);
                    that.gameHighscoreView.setHighscoreCollection(that.gameCollection);
                }
            });
        },

        /**
         * Resets all data used for the game.
         */
        onResetGame : function (visitor) {
            console.log('in onResetGame');
            var data = this.visitSightCollection(visitor);
            this.questionCollection.reset(data);
            this.questionCollectionIndex = 1;
            this.currentGame = {
                type : 'location', 
                playerid : 'todo',
                score : 'score',
                date : Date.now(),
                time : 'todo',
                level : this.level,
                correct : 0
            };
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
