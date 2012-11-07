/*global define*/
define([
    'underscore',
    'views/template',
    'data-retriever',

    'text!tmpl/login.tmpl'
], function (_, TemplateView, DataRetriever, tmplLogin) {
    'use strict';

    var LoginView;

    LoginView = TemplateView.extend({
        template : tmplLogin,

        events : function () {
            return {
                'submit .login-form ' : 'onLogin',
                'submit .signup-form' : 'onSignup',
                'click .login' : 'onShowLogin',
                'click .signup' : 'onShowSignup'
            };
        },

        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);

            _.bindAll(this, 'onLogin');
        },

        onShowLogin : function () {
            this.$('form')
                .addClass('hide')
                .filter('.login-form')
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
        }
    });

    return LoginView;
});

