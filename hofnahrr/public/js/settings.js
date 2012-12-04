/*global define*/
define([
    
], function () {
    'use strict';

    return {
        CITY : 'Hof', 
        CITY_LAT : 50.3219,
        CITY_LNG : 11.9189,
        YAHOO_API_KEY : 'cf9244713a7ac320bf3fc2743b133480caeff7d4',
        BASE_URL : 'http://localhost:2403/',
        API : {
            PICTURES : 'pictures/',
            SIGHTS : 'sights/',
            USERS : 'users/'
        },
        WIKI_API : 'http://%lang%.wikipedia.org/w/api.php?format=json&action=query&titles=%query%&prop=images|extracts&list=tags&tgprop=displayname|name&exchars=600&explaintext=1'
    };
});
