/*global define*/
define([
    'underscore', 'backbone', 
    'views/templated-bridge',
    'libs/mosaic',
    
    'text!tmpl/sight-mosaic.tmpl',
], function (
    _, Backbone, TemplatedBridgeView,
    mosaic,
    tmplSightMosaic
) {
    'use strict';

    var SightMosaicView;

    SightMosaicView = TemplatedBridgeView.extend({
        events : function () {
            return {
                'mousewheel .mosaic-container' : 'onScroll',
                'DOMMouseScroll .mosaic-container' : 'onScroll',
            };
        },
        tagname : 'div',
        className : 'container padded',
        template : tmplSightMosaic,

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);

            this.scrollStep = 0;

            _.bindAll(this, 'onScroll');
        },

        
        onScroll : function (e) {
            e.preventDefault();
            e.stopPropagation();
            var evt = e.originalEvent,
                delta = evt.wheelDeltaY || (-1.5 * evt.detail);

            this.scrollStep += (delta * -1) / 2000;
            if (delta < 0) {
                this.scrollStep = Math.max(this.scrollStep, 0);
            }
            else {
                this.scrollStep = Math.min(this.scrollStep, 1);
            }

            this.mosaicRenderer.goToPercent(this.scrollStep);
        },

        setModel : function () {
            if (this.modaicRenderer) {
                this.mosaicRenderer.reset();
            }
            TemplatedBridgeView.prototype.setModel.apply(this, arguments);
        },

        afterRender : function () {
            var images = null;

            this.mosaicRenderer  = new mosaic.MosaicRenderer({
                canvas : this.$('.mosaic-container'),
                width : 1000,
                height: 600,
                minOpacity : 0.7
            });

            if (this.model && (images = this.model.get('pictures'))) {
                console.log(images);
                this.mosaicRenderer.addTiles(images);
            }
        },

        editMosaic : function () {
            if (!this.mosaicComposer) {
                this.mosaicComposer = new mosaic.MosaicComposer();
            }
            if (this.mosaicComposer.renderer) {
                this.mosaicComposer.uninstall();
            }
            else {
                this.mosaicComposer.installTo(this.mosaicRenderer);
            }
        }
    });

    return SightMosaicView;
});
