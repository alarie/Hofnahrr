/*global define*/

/**
 * @file picture-form.js
 * @description Defines a view for editing picture meta data.
 */

define([
    'underscore', 
    'views/templated-bridge',
    'text!tmpl/picture-form.tmpl'
], function (
    _, 
    TemplatedBridgeView,
    tmplPictureForm
) {
    'use strict';

    var PictureFormView;

    PictureFormView = TemplatedBridgeView.extend({
        tagName : 'div',
        className : 'row-fluid',
        template : tmplPictureForm,
        events : function () {
            return {
                'submit' : 'onSubmit'
            };
        },

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onSubmit');
        },

        onSubmit : function () {},

    });

    return PictureFormView;
});

