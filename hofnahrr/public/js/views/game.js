/*global define*/

/**
 * @file game.js
 * @description This file contains a GameView which is the baseclass 
 * for the different game modes.
 */

define([
    'backbone',
    'views/templated-bridge'
], function (Backbone, TemplatedBridgeView) {
    'use strict';

    var GameView;

    GameView = TemplatedBridgeView.extend({
        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            this.level = 1;
            this.currentStep = 0;
        },

        setLevel : function (level) {
            this.level = level;
            this.recalculateGame();

            this.trigger('game-init');
        },

        // override in subclasses 
        recalculateGame : function () {
            this.currentStep = 0;
        }

    });

    return GameView;
});

