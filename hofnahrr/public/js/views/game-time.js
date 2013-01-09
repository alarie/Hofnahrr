/*global define*/
/**
 * @file game-time.js
 * @description This file contains a TimeGameView for rendering the elements 
 * for the time assigning game. This game mode is not implemented yet, therefore 
 * this is only a dummy view.
 */

define([
    'views/game',
    'text!tmpl/time-game.tmpl'
], function (GameView, tmplTimeGame) {
    'use strict';

    var TimeGameView;

    TimeGameView = GameView.extend({
        template : tmplTimeGame,

        recalculateGame : function () {
            GameView.prototype.recalculateGame.apply(this, arguments);
            var level = this.level;

            this.trigger('game-reset', function (collection) {
                var sightsMax = collection.length - 1,
                    numQuestions = parseInt((Math.log(level) + 1) * 8, 10),
                    sight, pictures, rnd,
                    data = [];

                while (numQuestions) {
                    rnd = parseInt(Math.random() * sightsMax, 10);
                    sight = collection.at(rnd);
                    pictures = sight.get('pictures');
                    rnd = parseInt(Math.random() * pictures.length, 10);

                    data.push(pictures[rnd]);

                    numQuestions -= 1;
                }

                return data;
            });
        }       
    });

    return TimeGameView;
});

