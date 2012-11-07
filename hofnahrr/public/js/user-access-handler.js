/*global define*/
define([
    'underscore', 'backbone'    
], function (_, Backbone) {
    'use strict';

    var UserAccessHandler;

    UserAccessHandler = function (acl) {
        this.acl = acl || {};
    };

    UserAccessHandler.prototype.may = function (doWhat, user) {
        console.log('todo implement user access handler');
        return doWhat && 
            doWhat in this.acl && 
            this.acl[doWhat](user.attributes);
    };

    _.extend(UserAccessHandler.prototype, Backbone.Events);

    return UserAccessHandler;
});

