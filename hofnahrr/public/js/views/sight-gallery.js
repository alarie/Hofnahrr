/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-carousel',
    'underscore', 'backbone', 
    'views/templated-bridge',
    'libs/kort',

    'text!tmpl/sight-gallery.tmpl',
], function (
    $, _, Backbone, TemplatedBridgeView,
    kort, 
    tmplSightGallery
) {
    'use strict';

    var SightGalleryView;

    SightGalleryView = TemplatedBridgeView.extend({
        tagname : 'div',
        className : 'container',
        template : tmplSightGallery,

        afterRender : function () {
            var carousel = this.$('.carousel');
            carousel.carousel();

            this.$('.left').click(carousel, function () {
                carousel.carousel('prev');
            });
            this.$('.right').click(carousel, function () {
                carousel.carousel('next');
            });

            Kort.bind();
        }
    });

    return SightGalleryView;
});