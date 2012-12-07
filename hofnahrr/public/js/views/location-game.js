/*global define*/
define([
    'views/game',
    'text!tmpl/location-game.tmpl'
], function (GameView, tmplLocationGame) {
    'use strict';

    var LocationGameView;

    LocationGameView = GameView.extend({
        template : tmplLocationGame,

        recalculateGame : function () {
            GameView.prototype.recalculateGame.apply(this, arguments);
            var level = this.level;

            this.trigger('game-reset', function (collection) {
                var sightsMax = collection.length - 1,
                    numQuestions = parseInt((Math.log(level) + 1) * 8, 10),
                    sight, rnd,
                    data = [],
                    json;


                while (numQuestions) {
                    rnd = parseInt(Math.random() * sightsMax, 10);
                    sight = collection.at(rnd);
                    json = sight.toJSON();

                    data.push({
                        name : json.name,
                        location : json.location,
                        replied : false,
                        correct : false
                    });

                    numQuestions -= 1;
                }
                
                return data;
            });

        }       
    });

    return LocationGameView;
});

