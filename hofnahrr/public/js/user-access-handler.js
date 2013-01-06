/*global define*/

/**
 * @file usar-access-handler.js
 * @description Defines a class that can be used to determine what a user may
 * do and what not.
 */

define([
    'underscore', 'backbone'    
], function (_, Backbone) {
    'use strict';

    var UserAccessHandler,
        userAccessHandler,
        acl;

    UserAccessHandler = function (acl) {
        this.acl = acl || {};
    };

    UserAccessHandler.prototype.may = function (doWhat, user) {
        return doWhat && 
            doWhat in this.acl && 
            this.acl[doWhat](user);
    };
    UserAccessHandler.prototype.isRegisteredUser = function (user) {
        return !!(user && user.id);
    };

    UserAccessHandler.prototype.isAdmin = function (user) {
        return !!(user && user.id && user.get('isAdmin'));
    };

    _.extend(UserAccessHandler.prototype, Backbone.Events);


    acl = {
        'edit_mosaic' : function (user) {
            return userAccessHandler.isRegisteredUser(user);
        },
        'edit_sight' : function (user) {
            return userAccessHandler.isRegisteredUser(user);
        }
    };

    userAccessHandler = new UserAccessHandler(acl);

    return userAccessHandler;
});

