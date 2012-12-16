/*global define*/
define([
    'jquery',
    'underscore',
    'templater',
    'views/templated-bridge',
    'settings'
], function ($, _, Templater, TemplatedBridgeView, settings) {
    'use strict';

    var SightInfoView;

    SightInfoView = TemplatedBridgeView.extend({
        afterRender : function () {
            this.fetchWikipediaContent();
        },

        fetchWikipediaContent : function () {
            var links,
                wikiLink,
                url = settings.WIKI_API, 
                wiki, 
                query;

            if (this.model && (links = this.model.get('links'))) {
                _.each(links, function (link) {
                    if (link.indexOf('wikipedia') >= 0) {
                        wiki = /wiki\/([^\/]+)/g.exec(link);
                        if (wiki) {
                            query = wiki[1];
                            wikiLink = link;
                        }
                    }
                });
                console.log("query", query);

                if (query) {
                    // TODO set lang
                    url = url.replace('%lang%', 'de');
                    url = url.replace('%query%', window.encodeURIComponent(query));
                    $.ajax({
                        type : 'get',
                        url : 'http://hofnahrr.de:2403/reverse-proxy',
                        contentType : 'json',
                        data : {
                            url : url,
                        },
                        success : function (data) {
                            var pages = JSON.parse(data).query.pages,
                                data;

                            _.each(pages, function (page) {
                                data = page.extract;
                            });

                            data = data.replace(/==([^=]+)==/g, '<h5>$1</h5>');
                            data += '<a href="' + wikiLink + '" target="_blank">' + Templater.i18n('app_more') + '</a>';

                            $('#wiki-content').html(data);
                        },
                        error : function () {
                            console.log("ERROR", arguments);
                        }
                    });
                }

            }
        },
    });

    return SightInfoView;
});

