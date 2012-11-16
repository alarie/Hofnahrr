/*global define*/
define([
    'backbone' 
], function (Backbone) {
    'use strict';

    var HofnahrrRouter;

    HofnahrrRouter = Backbone.Router.extend({
        routes : {
            'sight/' : 'show-sight-map',
            'sight/create/' : 'create-new-sight',
            'sight/:id/' : 'open-sight-map',
            'sight/:id/info/' : 'open-sight-info',
            'sight/:id/gallery/' : 'open-sight-gallery',
            'sight/:id/mosaic/' : 'open-sight-mosaic',
            'sight/:id/map/' : 'open-sight-map',
            'sight/:id/edit/' : 'edit-sight',
            '*path/search/:query' : 'search',

            'game/' : 'game',
            'game/:type/:level/' : 'game-play',

            'login' : 'login',
            'logout' : 'logout',

            'tag/:tagname' : 'onChangeTag'
        }
    });

    Backbone.History.prototype.checkUrl = function (e) {
        var current = this.getFragment(),
            old = this.fragment;

        if (current.indexOf('tag/') === 0 || current.indexOf('search/') === 0) {
            if (old.indexOf('tag/') >= 0) {
                current = old.replace(/tag\/.*$/, current);
            }
            if (old.indexOf('search/') >= 0) {
                current = old.replace(/search\/.*$/, current);
            }
            else {
                current = old + current;
            }

            if (current !== old) {
                this.navigate(current);
            }
        }

        if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
        if (current == this.fragment) return false;
        if (this.iframe) this.navigate(current);
        this.loadUrl() || this.loadUrl(this.getHash());
    };

    return HofnahrrRouter;
});
