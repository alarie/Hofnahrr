/*global define*/

/**
 * @file login.js
 * @description Defines the view used to login users.
 */

define([
    'jam/bootstrap-sass/js/bootstrap-dropdown',
    'underscore',
    'views/template',
    'data-retriever',

    'text!tmpl/login.tmpl'
], function ($, _, TemplateView, DataRetriever, tmplLogin) {
    'use strict';

    var LoginView;

    LoginView = TemplateView.extend({
        template : tmplLogin,

        events : function () {
            return {
                'submit .signup-form' : 'onSignup',
                'click .login' : 'onShowLogin',
                'click .signup' : 'onShowSignup',
                'click .logout' : 'onLogout',
                'click .open-id .immediate' : 'onCheckLogin',
                'keydown .open-id .immediate' : 'onCheckLogin'
            };
        },

        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onLogin', 'onShowLogin', 'onShowSignup');
        },

        onCheckLogin : function (e) {
            var target = e.currentTarget,
                event = e.type;

            if ((target.nodeName === 'A' && event === 'click') ||
                (target.nodeName === 'INPUT' && event === 'keydown' && e.which === 13)) {
                e.preventDefault();
                this.$('form.open-id').submit();
            }
        },

        onShowLogin : function () {
            this.$('.login-form')
                .removeClass('hide');
        },

        onShowSignup : function () {
            this.$('form')
                .addClass('hide')
                .filter('.signup-form')
                .removeClass('hide');
        },

        onLogin : function (e) {
            e.preventDefault();
            var data = (new DataRetriever({el : this.$el})).getData();
            this.trigger('login-user', data);
        },

        onSignup : function (e) {
            e.preventDefault();
            var data = (new DataRetriever({el : this.$el})).getData();
            this.trigger('signup-user', data);
        },

        onLogout : function (e) {
            e.preventDefault();
            this.trigger('logout-user');
        },

        afterRender : function () {
            $('.dropdown-toggle').dropdown();
        }
    });

    return LoginView;
});

