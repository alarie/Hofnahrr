/*global define*/

/**
 * @file game-sidebar.js
 * @description This file contains a GameSidebarView which renders the Sidebar element in the game section.
 */

define([
    'underscore',
    'backbone',
    'views/template',
    'templater',
    'text!tmpl/game-sidebar-progress-summary.tmpl',
    'text!tmpl/game-select.tmpl'
], function (_, Backbone, TemplateView, Templater, summaryTemplate, tmplGameSelect) {
    'use strict';

    var GameSidebarView;

    GameSidebarView = TemplateView.extend({
        initialize : function (options) {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onAdd', 'onAddAll', 'setGameProgress');

            this.itemViewConstructor = options.itemViewConstructor || 
                Backbone.View;
            this.itemViewData = options.itemViewData || {};
            this.summaryTemplate = Templater.compile(summaryTemplate);
        },

        setGameProgress : function (progressSummaryData) {
            //add progressdata to view
            if (!progressSummaryData) {
                progressSummaryData = {};
            }
            this.$('.progress-summary').empty();
            this.$('.progress-summary').append(this.summaryTemplate(progressSummaryData));
        },

        onAdd : function (itm) {
            var view = new (this.itemViewConstructor)(_.extend(this.itemViewData, {
                model : itm
            }));
            this.$('#game-progress').append(view.render().el);
        },

        onAddAll : function (collection) {
            this.$('#game-progress').empty();
            collection.each(this.onAdd);
            this.setGameProgress({diff : collection.length});
        },

        empty : function () {
            this.$('#game-progress').empty();
            this.$('.progress-summary').empty();
        },

        setGameSelect : function (view) {
            this.$('.game-select').empty().append(view.el);
        },

        reset : function () {
            this.$('.progress-summary').empty();
            this.$('#game-progress').empty();
        }


    });

    return GameSidebarView;
});

