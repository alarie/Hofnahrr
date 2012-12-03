/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-carousel',
    'underscore', 'backbone', 
    'views/templated-bridge',
    'libs/jquery.lightbox-0.5',

    'text!tmpl/sight-gallery.tmpl',
], function (
    $, _, Backbone, TemplatedBridgeView,
    lightbox, 
    tmplSightGallery
) {
    'use strict';

    var SightGalleryView;

    SightGalleryView = TemplatedBridgeView.extend({
        tagname : 'div',
        className : 'container',
        template : tmplSightGallery,

        afterRender : function () {
            
            $('a.lightbox').lightBox({
                // overlayBgColor: '#FFF',
                // overlayOpacity: 0.6,
                imageLoading: './img/lightbox-ico-loading.gif',
                imageBtnClose: './img/lightbox-btn-close.gif',
                imageBtnPrev: './img/lightbox-btn-prev.gif',
                imageBtnNext: './img/lightbox-btn-next.gif',
                imageBlank: './img/lightbox-blank.gif',
                containerResizeSpeed: 350,
                txtImage: 'Bild', //TODO use translation
                txtOf: 'von' //TODO user translation
            });
        }
    });

    return SightGalleryView;
});