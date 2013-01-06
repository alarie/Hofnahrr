/*global define*/

/**
 * @file templater.js
 * @description Simple wrapper around Handlebars.
 */

define([
    'extended-handlebars'
], function (Handlebars) {
    'use strict';

    /**
     * Adapter for template engins. The consumer only needs to know this
     * interface, this the used template engine can easily replaced.
     */
    var Templater;

    Templater = {
        compile : function (template) {
            return Handlebars.compile(template);
        },

        setLanguage : function (lang) {
            Handlebars.initLang(lang);
        },

        i18n : function (id) {
            return Handlebars.helpers.i18n(id);
        },

        registerHelper : function (name, helper) {
            return Handlebars.registerHelper(name, helper);
        }
    };

    return Templater;
});
