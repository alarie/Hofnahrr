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

    Handlebars.registerHelper('interpolateI18n', function (id) {
        var args = Array.prototype.splice.apply(arguments, [1]),
            str = '!' + id,
            i = 0;

        if (Handlebars.lang && Handlebars.lang[id]) {
            str = Handlebars.lang[id];
            str = str.replace('%_', function () {
                return args[i++];
            });
        }

        return str;
    });

    return Handlebars;

});
