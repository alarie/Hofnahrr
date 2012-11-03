/*global define*/
define([
    'backbone' 
], function (Backbone) {
    'use strict';

    var HofnahrrRouter;

    HofnahrrRouter = Backbone.Router.extend({
        routes : {
            'sight/create' : 'create-new-sight',
            'sight/:id' : 'open-sight',
            'sight/:id/edit' : 'edit-sight'
        }
    });

    return HofnahrrRouter;
});
