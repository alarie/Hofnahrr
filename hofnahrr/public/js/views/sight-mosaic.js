/*global define*/

/**
 * @file sight-list.js
 * @description Defines the view used to render the sight mosaic.
 */

define([
    'underscore', 'backbone', 
    'views/templated-bridge',
    'views/mosaic-layer-panel',
    'libs/mosaic',
    
    'text!tmpl/sight-mosaic.tmpl',
    'text!tmpl/list.tmpl',
    'text!tmpl/layer.tmpl'
], function (
    _, Backbone, 
    TemplatedBridgeView,
    MosaicLayerPanelView,
    mosaic,
    tmplSightMosaic,
    tmplList,
    tmplLayer
) {
    'use strict';

    var SightMosaicView;

    SightMosaicView = TemplatedBridgeView.extend({
        events : function () {
            return {
                'mousewheel .mosaic-container' : 'onScroll',
                'DOMMouseScroll .mosaic-container' : 'onScroll',
                'click .edit-mosaic' : 'onEditMosaic'
            };
        },
        tagname : 'div',
        className : 'container-fluid padded',
        template : tmplSightMosaic,

        initialize : function () {
            TemplatedBridgeView.prototype.initialize.apply(this, arguments);

            this.scrollStep = 0;

            _.bindAll(this, 
                      'onScroll', 
                      'onEditMosaic', 
                      'onMosaicTileAdded', 
                      'onMosaicTileRemoved',
                      'onMosaicTileResorted');
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
                width : 600,
                height: 400,
                minOpacity : 0.7
            });

            if (this.model && (images = this.model.get('mosaic'))) {
                this.mosaicRenderer.addTiles(images);
            }
        },

        showImageSelect : function () {
            var mosaicImages = this.model.get('mosaic'),
                pictures = this.model.get('pictures'),
                allImages = _.clone(mosaicImages),
                collection,
                imageListView;

            _.each(mosaicImages, function (img) {
                img.inMosaic = true;
            });

            _.each(pictures, function (img) {
                var tmp = _.clone(img),
                    match = _.find(mosaicImages, function (img2) {
                        return tmp.url === img2.url; 
                    });

                if (!match) {
                    allImages.push(tmp);
                }
            });

            imageListView = this.createLayerListView();
            collection = this.createCollection(imageListView);

            $(this.mosaicRenderer.canvas).after(imageListView.render().el);
            collection.reset(allImages);

            this.collection = collection;
            this.imageListView = imageListView;
        },

        hideImageSelect : function () {
            this.model.save();
            delete this.collection;
            this.imageListView.$el.remove();
            delete this.imageListView;
        },

        createLayerListView : function () {
            var imageListView = new MosaicLayerPanelView({
                    id : 'mosaic-image-select',
                    template : tmplList,
                    listElemSelector : '.list',
                    listItemOptions : {
                        template : tmplLayer,
                        attributes : {
                            draggable : true
                        } 
                    }
                });

            imageListView.on('item-selected', this.onMosaicTileAdded);
            imageListView.on('item-deselected', this.onMosaicTileRemoved);
            imageListView.on('item-resorted', this.onMosaicTileResorted);

            return imageListView;
        },

        onMosaicTileResorted : function (id, newIndex) {
            var model = this.model,
                mosaic = model.attributes.mosaic,  
                match, index;

            _.each(mosaic, function (itm, i) {
                if (id === itm.id) {
                    match = itm;
                    index = i;
                }
            });
console.log(match, id, index, newIndex);
            if (match) {
                mosaic.splice(index, 1);
                mosaic.splice(newIndex, 0, match);
            }
console.log(mosaic);
            model.save(null, {silent : true});
            this.mosaicRenderer.reset()
                .addTiles(mosaic)
                .goToPercent(1, false);
        },

        onMosaicTileAdded : function (item) {
            var model = this.model;

            item = item.toJSON();
            item.x || (item.x = 0);
            item.y || (item.y = 0);

            // add the image to the mosaic view
            this.mosaicRenderer.addTile(item);

            // add the image to the data
            model.attributes.mosaic = this.mosaicRenderer.toJSON();
            model.save(null, {silent : true});
        },

        onMosaicTileRemoved : function (item) {
            var model = this.model,
                url = item.get('url'),
                mosaic = model.attributes.mosaic,
                index;

            _.each(mosaic, function (img, i) {
                if (img.url === url) {
                    index = i;
                }
            });

            // remove the image from the mosiac view
            this.mosaicRenderer.removeTileById(mosaic[index].id);

            // remove the image from the data
            mosaic.splice(index, 1);
            model.save(null, {silent : true});
        },

        createCollection : function (imageListView) {
            var collection = new Backbone.Collection();
            collection.on('add', imageListView.onAdd);
            collection.on('reset', imageListView.onAddAll);
            return collection;
        },

        onEditMosaic : function () {
            var that = this;
            if (!this.mosaicComposer) {
                this.mosaicComposer = new mosaic.MosaicComposer();
            }
            if (this.mosaicComposer.renderer) {
                this.hideImageSelect();
                this.mosaicComposer.uninstall();
                this.mosaicRenderer.off('tile-change');
                that.model.save(null, {silent : true});
            }
            else {
                this.showImageSelect();
                this.mosaicComposer.installTo(this.mosaicRenderer);
                this.mosaicRenderer.on('tile-change', function (tile) {
                    var images = that.model.get('mosaic');
                    _.each(images, function (img, index) {
                        if (img.url === tile.url) {
                            images[index].scale = tile.scale;
                            images[index].x = tile.x;
                            images[index].y = tile.y;
                        }
                    });
                    that.model.set({mosaic : images}, {silent : true});
                });
            }
        }
    });

    return SightMosaicView;
});
