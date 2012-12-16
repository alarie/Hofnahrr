/*global define*/
define([
    
], function () {
    'use strict';

    return {
        CITY : 'Hof', 
        CITY_LAT : 50.31390041107301,
        CITY_LNG : 11.912698745727539,
        CITY_SW_LAT : 50.32979261319801,
        CITY_SW_LNG : 11.898322105407715,
        CITY_NE_LAT : 50.30145694518725,
        CITY_NE_LNG : 11.94814682006836,
        YAHOO_API_KEY : 'cf9244713a7ac320bf3fc2743b133480caeff7d4',
        BASE_URL : 'http://hofnahrr.de:2403/',
        API : {
            PICTURES : 'pictures/',
            SIGHTS : 'sights/',
            USERS : 'users/',
            GAMES : 'games/'
        },
        WIKI_API : 'http://%lang%.wikipedia.org/w/api.php?format=json&action=query&titles=%query%&prop=images|extracts&list=tags&tgprop=displayname|name&exchars=600&explaintext=1'
    };
});
