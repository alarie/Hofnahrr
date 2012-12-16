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
			var i = 1,
				trClass = '';
				
			this.$('#game-highscore-list tbody').empty();

			console.log(collection.indexOf(this.model));
			
			_.each(collection.first(5), function (item) {
				trClass = item.cid === this.model.cid ? ' class="active" ' : '';
				this.$('#game-highscore-list tbody')
					.append('<tr' + trClass + '><td>' + i++ + '</td><td>' 
						+ item.attributes.playername + '</td><td>' 
						+ item.attributes.score + '</td></tr>');
			}, this);

			if (collection.indexOf(this.model) > 5) {
				this.$('#game-highscore-list tbody')
					.append('<tr><td colspan="3" style="text-align: center;"> ... </td></tr>')
					.append('<tr class="active"><td>' + (collection.indexOf(this.model) + 1) + '</td><td>' 
						+ this.model.attributes.playername + '</td><td>' 
						+ this.model.attributes.score + '</td></tr>')
					.append('<tr><td colspan="3" style="text-align: center;"> ... </td></tr>');
			}

		}
	
	});

	return GameHighscoreView;	
});
