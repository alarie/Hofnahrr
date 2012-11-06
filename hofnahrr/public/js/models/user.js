/*global define*/
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    'use strict';

    var UserModel;

    UserModel = Backbone.Model.extend({
        initialize : function (attributes, options) {
            Backbone.Model.prototype.initialize.apply(this, attributes);
            this.options = options;
        },
        url : function () {
            return this.options.url;    
        },

        login : function (data, options) {
            var url = this.url() + '/login';
            options || (options = {});
            this.save(data, _.extend({url : url}, options));
        },  

        logout : function (options) {
            var url = this.url() + '/logout';
            options || (options = {});
            this.attributes = {};
            this.save(null, _.extend({url : url}, options));
        },

        signup : function (data, options) {
            var url = this.url();
            options || (options = {});
            this.save(data, _.extend({url : url}, options));
        },

        isLoggedIn : function (onTrue, onFalse) {
            var url = this.url() + '/me';
            this.fetch({
                url : url,
                success : function (result) {
                    console.log(result);
                    if (result.get('username')) {
                        onTrue();
                    }
                    else {
                        onFalse();
                    }
                }
            });
        }
    });

    return UserModel;
});
