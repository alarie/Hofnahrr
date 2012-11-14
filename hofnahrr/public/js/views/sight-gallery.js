/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-carousel',
    'underscore', 'backbone', 
    'views/templated-bridge',

    'text!tmpl/sight-gallery.tmpl',
], function (
    $, _, Backbone, TemplatedBridgeView, 
    tmplSightGallery
) {
    'use strict';

    var SightGalleryView;

    SightGalleryView = TemplatedBridgeView.extend({
        tagname : 'div',
        className : 'container',
        template : tmplSightGallery,

        afterRender : function () {
            this.$('.carousel').carousel();
        }
    });

    return SightGalleryView;
});
