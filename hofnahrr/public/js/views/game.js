/*global define*/
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
        },

        setLevel : function (level) {
            this.level = level;
            this.recalculateGame();

            this.trigger('game-init');
        },

        recalculateGame : function () {
            // override in subclasses 
        },
    });

    return GameView;
});

