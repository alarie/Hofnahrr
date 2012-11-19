/*global define*/
define([
    'underscore',
    'views/list',
    'views/sight-list-item'
], function (_, ListView, SightListItem) {
    'use strict';

    var SightListView;

    SightListView = ListView.extend({
        events : function () {
            return {
                'input .search-query' : 'onSearchKeydown',
                'blur .search-query' : 'onSearchChanged'
            };
        },

        initialize : function (options) {
            options = (options || {});
            options.itemViewConstructor = SightListItem;
            ListView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onSearchChanged', 'onSearchKeydown');
        },

        onSearchKeydown : function (e) {
            //if (e.keyCode === 13) {
                this.onSearchChanged(e);
            //}
        },
        onSearchChanged : function (e) {
            window.location.hash = 'search/' + e.target.value;
        },

        appendView : function (view) {
            this.$el
                .find('ul #sight-list-header')
                .after(view.render().el);
        },

        reset : function () {
            this.views = [];
            this.$el
                .find('ul li')
                .not('.fixed')
                .remove();
        },

        setSubPage : function (page) {
            this.subPage = page;
            _.each(this.views, function (view) {
                view.render({
                    subPage : page
                });
            });
            return this;
        },

        setSight : function (speakingId) {
            this.$('.active').removeClass('active');
            this.$('a[href*="/' + speakingId + '/"]')
                .closest('li')
                .addClass('active');
            return this;
        }

    });

    return SightListView;
});

