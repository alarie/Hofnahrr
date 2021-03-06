/*global requirejs */
requirejs.config({
    "packages": [
        {
            "name": "backbone",
            "location": "jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "bootstrap-sass",
            "location": "jam/bootstrap-sass"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "paths" : {
        "tmpl" : '../templates',
        "layout" : '../templates/layouts'
    },
    "version": "0.1.4",
    "shim": {
        "jquery.ui.custom" : ['jquery'],
        "jquery.tagsinput" : {
            deps : ['jquery', 'jquery.ui.custom'],
            exports : 'jQuery'
        },
        "jam/bootstrap-sass/js/bootstrap-modal" : {
            deps : ['jquery', 'jam/bootstrap-sass/js/bootstrap-transition'],
            exports : 'jQuery'
        },
        "jam/bootstrap-sass/js/bootstrap-carousel" : {
            deps : ['jquery', 'jam/bootstrap-sass/js/bootstrap-transition'],
            exports : 'jQuery'
        },
        "jam/bootstrap-sass/js/bootstrap-popover" : {
            deps : ['jquery', 'jam/bootstrap-sass/js/bootstrap-transition', 'jam/bootstrap-sass/js/bootstrap-tooltip'],
            exports : 'jQuery'
        },
        "jam/bootstrap-sass/js/bootstrap-dropdown" : {
            deps : ['jquery', 'jam/bootstrap-sass/js/bootstrap-transition'],
            exports : 'jQuery'
        },
    }
});

/*global define*/
require([
    'app'
], function (App) {

    var app = new App();

});
