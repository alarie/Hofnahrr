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
        className : 'container padded',
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
        }
    });

    return SightGalleryView;
});
