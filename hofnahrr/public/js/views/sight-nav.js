/*global define*/
define([
    'views/templated-bridge' 
], function (TemplatedBridge) {
    'use strict';

    var SightNavView;

    SightNavView = TemplatedBridge.extend({
        openPage : function (page) {
            this.$('.active').removeClass('active');
            this.$('a[href$="' + page + '"]')
                .closest('li')
                .addClass('active');
        }
    });

    return SightNavView;
});

