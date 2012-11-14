/*global define */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var mosaic,
        MosaicTile,
        MosaicRenderer,
        MosaicComposer,
        resizers = '<div class="resizers"><span class="br"/></div>',
        transitionEvent = 'transtionend webkitTransitionEnd oTransitionEnd',
        translateZ = function (val) {
            var z = '';
            if ($.browser.mozilla && parseInt($.browser.version, 10) < 10) {
                z = '';
            }
            else {
                z = 'translateZ(' + val + 'px)';
            }
            return z;
        };

    MosaicTile = function (spec) {
        this.spec = _.extend({
            active : true,
            title : '',
            description : '',
            opacity : 0,
            z : 0
        }, spec);
        this._loadImage();
    };

    _.extend(MosaicTile.prototype, Backbone.Events);
    

    MosaicTile.prototype.get = function (key) {
        return this.spec[key];
    };

    MosaicTile.prototype.set = function (hash, options) {
        var that = this, 
            didChange = false,
            silent = options ? options.silent : false;
        
        _.each(hash, function (val, key) {

            if (that.spec[key] !== val) {
                didChange = true;
                that.spec[key] = val;

                if (!silent) {
                    that.trigger('change:' + key, that, val);
                }
            } 
        });

        if (didChange && !silent) {
            that.trigger('change', that);
        }

        return this;
    };

    /**
     * @private
     */
    MosaicTile.prototype._loadImage = function () {
        var that = this,
            img = new Image();

        img.src = this.spec.url;
        img.onload = function () {
            that._prepareImageForRendering(img);
            that.trigger('image-loaded', this);
        };
    };
    /**
     * @private
     */
    MosaicTile.prototype._prepareImageForRendering = function (img) {
        this.spec.width = img.width;
        this.spec.height = img.height;
    };

    /**
     * @private
     */
    MosaicTile.prototype.getTransforms = function () {
        var spec = this.spec,
            x = parseInt((spec.baseOffsetX || 0) + spec.x, 10), 
            y = parseInt((spec.baseOffsetY || 0) + spec.y, 10),
            transform = 'translateX(' + x + 'px) ' + 
                'translateY(' + y + 'px) ' + 
                translateZ(spec.z || 0) + ' ' + 
                'rotateZ(' + (spec.rotate || 0) + 'deg) '/* + 
                'scale(' + (spec.scale || 1) + ')'*/;

        return transform;
    };

    MosaicTile.prototype.setBaseOffset = function (x, y) {
        this.spec.baseOffsetX = x;
        this.spec.baseOffsetY = y;
        this.trigger('render');
    };

    MosaicTile.prototype.deactivate = function () {
        this.set({'active' : false});
    };

    MosaicTile.prototype.activate = function () {
        this.set({'active' : true});
    };








    /**
     * @constructor
     */
    MosaicRenderer = function (opts, tiles) {
        if (!opts.canvas) {
            throw new Error('An canvaselement for the renderer ' + 
                            'is required');
        }

        this.spec = _.extend({
            minOpacity : 0.5,
            width : 800,
            height : 500
        }, opts);
        tiles || (tiles = null);

        _.bindAll(this, 
                  'createTileElement', 
                  'appendTile');

        this.reset();
        this.canvas = this.spec.canvas;
        this.canvas.addClass('initializing');

        if (tiles) {
            this.addTiles(tiles);
        }
    };

    _.extend(MosaicRenderer.prototype, Backbone.Events);
    

    /**
     * @private
     */
        

    // PUBLIC API
    MosaicRenderer.prototype.reset = function () {
        this.tiles = [];
        this.activeTiles = [];
        this.trigger('reset');
    };
    MosaicRenderer.prototype.addTile = function (imgObj) {
        var that = this,
            tile = this.createTileObject(imgObj),
            tileElem = this.createTileElement(tile);

        this._addTileEventListeners(tile, tileElem);
       
        // make the first active tile the base tile 
        if (tile.get('active') && this.numActiveTiles() === 0) {
            tile.on('image-loaded', function () {
                that.setBaseTile(tile);
            });
        }

        if (tile.get('active')) {
            this.appendTile(tileElem);
            this.activeTiles.push(tile);
        }

        this.trigger('tile-added', tile);
        this.tiles.push(tile);
    };

    MosaicRenderer.prototype.removeTile = function (tile) {
        var allIndex = -1,
            activeIndex = -1;

        allIndex = _.indexOf(this.tiles, tile);
        activeIndex = _.indexOf(this.activeTiles, tile);

        if (allIndex >= 0 && (!tile.get('active') || activeIndex >= 0)) {
            this.tiles.splice(allIndex, 1);
            if (activeIndex >= 0) {
                this.activeTiles.splice(activeIndex, 1);
            }
            tile.trigger('remove-tile');
        }
    };

    MosaicRenderer.prototype._addTileEventListeners = function (tile, tileElem) {
        var that = this;

        tile.on('image-loaded', function () {
            if (tile.get('active') && that.numActiveTiles() > 0) {
                that.renderTileImage(tile, tileElem);
            }
        });

        tile.on('render', function (animated) {
            if (tile.get('active')) {
                that.renderTileImage(tile, tileElem, animated);
            }
        });

        tile.on('remove-tile', function () {
            that._removeTile(tile, tileElem);  
        });

        tile.on('init-tile', function (index) {
            that._initTile(tile, tileElem, index);  
        });

        tile.on('change:active', function (tile, active) {
            that._toggleActiveState(active, tile, tileElem);            
        });

        this.on('base-offset-changed', function (x, y) {
            tile.setBaseOffset(x, y);
        });

        tileElem.on('mousedown', function () {
            that.trigger('select-tile', tile, tileElem);
        });
    };

    MosaicRenderer.prototype._removeTile = function (tile, tileElem) {
        var index = 0, 
            that = this;

        tileElem
        .off(transitionEvent)
        .css({
            opacity : 0,
            transform : 'scale(0.1)'
        }) 
        .addClass('anim-out')
        .one(transitionEvent, function (e) {
            tileElem.remove();
        });
    };

    MosaicRenderer.prototype._initTile = function (tile, tileElem, index) {
        var that = this,
            transform = tile.getTransforms(),
            transformStart = transform.replace(/translateZ\([^\)]+\)/, 'translateZ(1000px)');

        tileElem.css({
            opacity : 0,
            transform : transformStart
        });

        window.setTimeout(function () {
            tileElem
            .addClass('anim-in')
            .css({
                opacity : 1,
                transform : transform
            })
            .one(transitionEvent, function (e) {
                tileElem.removeClass('anim-in');
            });
        }, index * 600);
    };

    MosaicRenderer.prototype._toggleActiveState = function (active, tile, tileElem) {
        if (!active) {
            this._deactivateTile(tile, tileElem);
        }
        else {
            this._activateTile(tile, tileElem);       
        }
    };

    MosaicRenderer.prototype._deactivateTile = function (tile, tileElem) {
        var index = 0, 
            that = this;

        tileElem
        .removeClass('anim-in')
        .off(transitionEvent)
        .css({transform : 'translateX(' + this.spec.width + 'px) ' + 
                'translateY(0px) ' + 
                'scale(0.1) '/* + 
                'rotateY(180deg)'*/
        })
        .addClass('anim-out')
        .one(transitionEvent, function (e) {
            tileElem.detach().removeClass('anim-out');
            index = _.indexOf(that.activeTiles, tile);
        });
        that.activeTiles.splice(index, 1);
    };

    MosaicRenderer.prototype._activateTile = function (tile, tileElem) {
        var index = 0, 
            that = this, 
            insertionPoint = index;

        _.each(this.tiles, function (t) {
            if (t === tile) {
                insertionPoint = index;
            }
            else {
                index += t.get('active') ? 1 : 0;
            }
        });

        if (insertionPoint === 0) {
            that.canvas.prepend(tileElem);
        }
        else {
            that.canvas.children().eq(insertionPoint - 1).after(tileElem);
        }

        window.setTimeout(function () {
            tileElem
            .removeClass('anim-in')
            .off(transitionEvent)
            .addClass('anim-in')
            .css({transform : tile.getTransforms()})
            .one(transitionEvent, function (e) {
                tileElem.removeClass('anim-in');
            });
        }, 0);
        that.activeTiles.splice(insertionPoint, 0, tile);  
    };

    MosaicRenderer.prototype.addTiles = function (imgObjArray) {
        var i = 0, 
            len = imgObjArray.length;

        for (i = 0; i < len; i += 1) {
            this.addTile(imgObjArray[i]);
        }
    };


    MosaicRenderer.prototype.setBaseTile = function (tile) {
        var that = this;
        this.setBaseOffset((this.spec.width - tile.get('width')) / 2, 
                           (this.spec.height - tile.get('height')) / 2);

        this.canvas
            .width(this.spec.width)
            .height(this.spec.height)
            .removeClass('initializing')
            .one(transitionEvent, function () {
                that.forEachActiveTile(function (tile, i) {
                    tile.trigger('init-tile', i);
                });
            });

    };

    MosaicRenderer.prototype.setBaseOffset = function (x, y) {
        this.spec.baseOffsetX = x;
        this.spec.baseOffsetY = y;
        this.trigger('base-offset-changed', x, y);
    };

    MosaicRenderer.prototype.createTileObject = function (imgObj) {
        imgObj.baseOffsetX = this.spec.baseOffsetX;
        imgObj.baseOffsetY = this.spec.baseOffsetY;
        var tile = new MosaicTile(imgObj);
        return tile;
    };

    MosaicRenderer.prototype.createTileElement = function (/*tile*/) {
        var $el = $('<div class="panel">').css({
                'position' : 'absolute',
                'display' : 'inline-block',
                'transform' : translateZ(1000)
            });
        return $el;
    };

    MosaicRenderer.prototype.appendTile = function (tile) {
        if (tile instanceof MosaicTile) {
            tile = this.createTileElement(tile);
        }
        
        this.canvas.append(tile);
    };

    MosaicRenderer.prototype.renderTileImage = function (tile, tileEl, animated) {
        var scale = tile.get('scale') || 1;
        if (animated) {
            tileEl.addClass('anim-in').one(transitionEvent, function () {
                tileEl.removeClass('anim-in');
            });
        }
        tileEl.css({
            'opacity' : tile.get('opacity'),
            'width'     : parseInt(tile.get('width') * scale, 10),
            'height'    : parseInt(tile.get('height') * scale, 10),
            'background-image': 'url(' + tile.get('url') + ')',
            'transform' : tile.getTransforms(),
            'filter' : tile.get('filter') || 'none'
        });
    };

    // use this for each tile
    MosaicRenderer.prototype.forEachTile = function (callback, context) {
        var that = this;
        _.each(this.tiles, function () {
            callback.apply(context || that, arguments);
        });
    };

    // use this for each active tile
    MosaicRenderer.prototype.forEachActiveTile = function (callback, context) {
        var that = this;
        _.each(this.activeTiles, function () {
            callback.apply(context || that, arguments);
        });
    };

    MosaicRenderer.prototype.numTiles = function () {
        return this.tiles.length;
    };

    MosaicRenderer.prototype.numActiveTiles = function () {
        return this.activeTiles.length;
    };

    MosaicRenderer.prototype.goTo = function (step, animated) {
        var len = this.numActiveTiles(),
            percent;

        if (step) {
            percent = step / len;
            this.goToPercent(percent, animated);
        }
    };

    MosaicRenderer.prototype.goToPercent = function (percent, animated) {
        var tiles = this.activeTiles,
            stepsLeft = this.numActiveTiles() - 1,
            progressedSteps = stepsLeft * percent,
            progressedRest = progressedSteps - parseInt(progressedSteps, 10),
            tile, css;

        animated || (animated = false);

        for (; stepsLeft; stepsLeft -= 1) {
            tile = tiles[stepsLeft];
            css = this._createTileCss(progressedSteps || progressedRest);

            tile.set(css)
                .trigger('render', animated);

            progressedSteps -= 1;
        }
    };

    MosaicRenderer.prototype._createTileCss = function (stepWidth) {
        /* defaults */
        var opacity = 1, 
            greyscale = 0, 
            blur = 0, 
            z = 0,

            minOpacity = this.spec.minOpacity;

        if (stepWidth >= 1) {
            z = 1000 * stepWidth;
            greyscale = 1;
            opacity = 0;
        }
        else if (stepWidth < 1 && stepWidth > 0) {
            z = stepWidth < minOpacity ? 
                0 : 
                parseInt((stepWidth - minOpacity) * (1 / minOpacity) * 1000, 10);
            opacity = 1 - stepWidth;
            greyscale = stepWidth < minOpacity ? 
                0 :
                stepWidth;
            blur = stepWidth < minOpacity ? 
                0 :
                parseInt(stepWidth * 10, 10);
        }

        return {
            'z' : z,
            'opacity' : opacity.toPrecision(3),
            'filter' : 'blur(' + blur + 'px) ' + 
                'grayscale(' + greyscale.toPrecision(3) + ')'
        };
    };












    MosaicComposer = function () {
        this.renderer = null;

        _.bindAll(this, 'selectTile');
    };

    MosaicComposer.prototype.installTo = function (mosaicRenderer) {
        this.renderer = mosaicRenderer;
        mosaicRenderer.on('select-tile', this.selectTile);
    };

    MosaicComposer.prototype.uninstall = function () {
        this.renderer.off('select-tile', this.selectTile);
        this.resizers.detach();
        this.renderer = null;
    };

    MosaicComposer.prototype.selectTile = function (tile, tileElem) {   
        var resizers;
        this.selectedTile = tile;
        resizers = this._getResizers(tile).detach();
        tileElem.append(resizers);
    };

    MosaicComposer.prototype.getSelectedTile = function () {
        return this.selectedTile;
    };

    MosaicComposer.prototype._getResizers = function () {
        if (!this.resizers) {
            this.resizers = $(resizers);
            this._registerResizeListeners();
            this._registerTranslateListeners();
        }
        return this.resizers;
    };

    MosaicComposer.prototype._registerTranslateListeners = function () {
        var that = this,
            startX, startY,
            origX, origY,
            origWidth, origHeight,
            tile,
            translateHandler = function (e) {
                var x = startX - e.screenX, 
                    y = startY - e.screenY,
                    tile = that.getSelectedTile();

                tile.set({
                    // Base offset is ignored as the values are just changed
                    // relatively to the base offset.
                    'x' : origX - x,
                    'y' : origY - y,
                    'opacity' : 0.5
                })
                .trigger('render');
            };

        this.resizers.on('mousedown', function (e) {
            startX = e.screenX;
            startY = e.screenY;
            tile = that.getSelectedTile();
            origX = tile.get('x');
            origY = tile.get('y');

            $('body').one('mouseup', function (e) {
                that.getSelectedTile().set({'opacity' : 1});
                $('body').off('mousemove', translateHandler);
            })
            .on('mousemove', translateHandler);
        });
    };

    MosaicComposer.prototype._registerResizeListeners = function () {
        var that = this,
            startX, startY,
            origX, origY,
            origWidth, origHeight,
            tile,
            resizeHandler = function (e) {
                var diff = startX - e.screenX, 
                    f = (origWidth - diff) / origWidth,
                    width = parseInt(origWidth * f, 10),
                    height = parseInt(origHeight * f, 10),
                    tile = that.getSelectedTile();

                tile.set({
                    width : width,
                    height : height,
                    // Base offset is ignored as the values are just changed
                    // relatively to the base offset.
                    x : origX + (origWidth - width) / 4,
                    y : origY + (origHeight - height) / 4
                })
                .trigger('render');
            };

        this.resizers.on('mousedown', 'span', function (e) {
            e.stopPropagation();
            startX = e.screenX;
            startY = e.screenY;
            tile = that.getSelectedTile();
            origX = tile.get('x');
            origY = tile.get('y');
            origWidth = tile.get('width');
            origHeight = tile.get('height');

            $('body').one('mouseup', function (e) {              
                $('body').off('mousemove', resizeHandler);
            })
            .on('mousemove', resizeHandler);
        });
    };

    _.extend(MosaicComposer.prototype, Backbone.Events);


    mosaic = {
        MosaicTile      : MosaicTile,
        MosaicRenderer  : MosaicRenderer, 
        MosaicComposer  : MosaicComposer
    };

    return mosaic;
});
