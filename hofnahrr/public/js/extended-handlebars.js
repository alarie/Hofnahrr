/*global define */
define(['handlebars'], function (Handlebars) {

    Handlebars.initLang = function (lang) {
        Handlebars.lang = lang;
    };

    Handlebars.registerHelper('i18n', function (id) {
        if (Handlebars.lang && Handlebars.lang[id]) {
            return Handlebars.lang[id];
        }
        return '!' + id;
    });


    return Handlebars;

});
