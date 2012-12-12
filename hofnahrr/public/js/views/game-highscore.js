define([
	'underscore',
	'backbone',
	'views/templated-bridge',
	'text!tmpl/game-highscore.tmpl'
], function (
	_,
	Backbone,
	TemplatedBridgeView,
	tmplGameHighscore
) {
	'use strict';

	var GameHighscoreView;

	GameHighscoreView = TemplatedBridgeView.extend({
		tagName : 'div',
		template : tmplGameHighscore,

		initialize : function (options) {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'setHighscoreCollection');
        },

		setHighscoreCollection : function (collection) {
			console.log(collection);
			console.log(this.$('#game-highscore-list'));
			this.$('#game-highscore-list').empty();
			console.log(this.$('#game-highscore-list'));
			// collection.each(function (item) {
			// this.$('#game-highscore-list').append('<li>' + item.attributes.score + '</li>');
			// }, this);
			console.log(this);
		}
	
	});

	return GameHighscoreView;	
});