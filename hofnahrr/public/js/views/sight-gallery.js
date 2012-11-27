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
            var that = this;
            this.$('.left').click(that, function () {
                that.$('.carousel').carousel('prev');
            });
            this.$('.right').click(that, function () {
                that.$('.carousel').carousel('next');
            });
        }
    });

    return SightGalleryView;
});
