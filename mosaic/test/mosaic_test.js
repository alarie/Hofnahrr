/*global describe, it, expect, beforeEach, spyOn, runs, waitsFor */
require(['../js/mosaic'], function (mosaic) {
    var images = [{
            x : 0, 
            y: 0, 
            url : 'http://germanhistorydocs.ghi-dc.org/images/vor%20dem%20Reichstag.jpg'
        },
        {
            x : -1, 
            y: -24, 
            scale : 1.1, 
            url : 'http://iconicphotos.files.wordpress.com/2009/12/09_wrapped_reichstag_02.jpg'
        },
        {
            x : 25, 
            y: -24, 
            scale : 1.19, 
            url : 'http://www.berliner.de/sites/default/files/orte/bilder/Reichstag.jpg'
        },
        {
            x : 307,
            y : -40,
            scale : 0.52,
            url : 'http://abenteuerinberlin.files.wordpress.com/2010/03/reichstag1.jpg'
        }
    ],
    el = $('<div>').css({
            'position': 'relative',
            'border': '1px solid black',
            'width': '500px',
            'height': '400px',
            'transform-origin': '50% 50% 0',
            '-webkit-perspective': '1000px',
            'overflow': 'hidden'
        });


    describe('Constructor', function () {
        el.empty();
        it('empty', function () {
            expect(mosaic.MosaicRenderer).toThrow();
        });

        it('with element', function () {
            var mosaicRenderer = new mosaic.MosaicRenderer({
                canvas : el
            });

            expect(mosaicRenderer.canvas).toBe(el);
        });
    });

    describe('Adding', function () {
        $('body').append(el);
        var mosaicRenderer;

        beforeEach(function () {
            el.empty();
            mosaicRenderer = new mosaic.MosaicRenderer({
                canvas : el
            });
        });
        
        it('an image', function () {
            spyOn(mosaicRenderer, 'createTileObject').andCallThrough();
            spyOn(mosaicRenderer, 'createTileElement').andCallThrough();
            spyOn(mosaicRenderer, 'renderTileImage').andCallThrough();

            mosaicRenderer.addTile(images[1]);

            expect(mosaicRenderer.numActiveTiles()).toBe(1);
            expect(mosaicRenderer.canvas.children().length).toBe(1);
            expect(mosaicRenderer.createTileObject).toHaveBeenCalled();
            expect(mosaicRenderer.createTileElement).toHaveBeenCalled();

            waitsFor(function () {
                return mosaicRenderer.renderTileImage.calls.length;
            }, 'the image to have been loaded', 4000);

            runs(function () {
                var image = mosaicRenderer.activeTiles[0].spec,
                    method = mosaicRenderer.renderTileImage,
                    tile = method.mostRecentCall.args[0],
                    tileElem =  method.mostRecentCall.args[1],
                    width = parseInt(tileElem.css('width'), 10),
                    height = parseInt(tileElem.css('height'), 10),
                    backgroundImg = tileElem.css('background-image');

                expect(tile instanceof mosaic.MosaicTile).toBeTruthy();
                expect(tileElem.jquery).toBeDefined();
                expect(width).toBe(parseInt(image.width * image.scale, 10));
                expect(height).toBe(parseInt(image.height * image.scale, 10));
                expect(backgroundImg).toBe('url(' + images[1].url + ')');
                expect(method.calls.length > 0).toBeTruthy();
            });
        });

        it('multiple images', function () {
            spyOn(mosaicRenderer, 'addTile').andCallThrough();

            mosaicRenderer.addTiles(images);
            
            expect(mosaicRenderer.addTile).toHaveBeenCalled();
            expect(mosaicRenderer.numActiveTiles()).toBe(4);
            expect(mosaicRenderer.canvas.children().length).toBe(4);

        });
    });

    describe('Stepping through tiles', function () {
        el.empty();
        var mosaicRenderer = new mosaic.MosaicRenderer({
            canvas : el
        }, images);

        it('to position 60% through tiles', function () {
            waitsFor(function () {
                return mosaicRenderer.numActiveTiles() === 4;
            }, 'all images to be loaded', 8000);
        
            runs(function () {                
                mosaicRenderer.goToPercent(0.6, true); 
                //expect(mosaicRenderer.canvas.);
            });
        });
        
        it('to step 1', function () {
            waitsFor(function () {
                return mosaicRenderer.numActiveTiles() === 4;
            }, 'all images to be loaded', 8000);

            
            runs(function () {        
                spyOn(mosaicRenderer, 'goToPercent');        
                mosaicRenderer.goTo(1, true); 
                expect(mosaicRenderer.goToPercent).toHaveBeenCalledWith(1 / 4, true);
            });
        });
    });

    describe('Setting tile', function () {
        var mosaicRenderer = new mosaic.MosaicRenderer({
            canvas : el,
            width : 1000,
            height : 500
        }, images);

        it('deactive', function () {
            var tile = mosaicRenderer.activeTiles[0];
            expect(mosaicRenderer.numTiles()).toBe(images.length);
            expect(mosaicRenderer.numActiveTiles()).toBe(images.length);
            tile.deactivate();
            expect(tile.get('active')).toBe(false);
            expect(mosaicRenderer.numActiveTiles()).toBe(images.length - 1);
            expect(mosaicRenderer.numTiles()).toBe(images.length);
        });

        it('active', function () {
            var tile = mosaicRenderer.tiles[0];
            expect(mosaicRenderer.numTiles()).toBe(images.length);
            expect(mosaicRenderer.numActiveTiles()).toBe(images.length - 1);
            tile.activate();
            expect(tile.get('active')).toBe(true);
            expect(mosaicRenderer.numActiveTiles()).toBe(images.length);
            expect(mosaicRenderer.numTiles()).toBe(images.length);

        });
    });

    describe('Removing', function () {
        var el, mosaicRenderer;

        beforeEach(function () {
            el = $('<div />');
            mosaicRenderer = new mosaic.MosaicRenderer({
                canvas : el
            });
        }); 

        it('the first tile', function () {
            spyOn(mosaicRenderer, 'setBaseTile').andCallThrough();
            mosaicRenderer.addTiles(images);
            var tile = mosaicRenderer.activeTiles[0];

            waitsFor(function () {
                return mosaicRenderer.setBaseTile.calls.length > 0;
            }, 'images to have been loaded', 8000);

            runs(function () {
                expect(mosaicRenderer.numTiles()).toBe(images.length);
                expect(mosaicRenderer.numActiveTiles()).toBe(images.length);
                expect(el.children().length).toBe(images.length);
                
                mosaicRenderer.removeTile(tile);

                expect(mosaicRenderer.numTiles()).toBe(images.length - 1);
                expect(mosaicRenderer.numActiveTiles()).toBe(images.length - 1);
                window.setTimeout(function () {
                    expect(el.children().length).toBe(images.length - 1);
                }, 1000);
            });
        });

        it('a tile', function () {
            spyOn(mosaicRenderer, 'setBaseTile').andCallThrough();
            mosaicRenderer.addTiles(images);
            var tile = mosaicRenderer.activeTiles[1];

            waitsFor(function () {
                return mosaicRenderer.setBaseTile.calls.length > 0;
            }, 'images to have been loaded', 8000);

            runs(function () {
                expect(mosaicRenderer.numTiles()).toBe(images.length);
                expect(mosaicRenderer.numActiveTiles()).toBe(images.length);
                expect(el.children().length).toBe(images.length);
                
                mosaicRenderer.removeTile(tile);

                expect(mosaicRenderer.numTiles()).toBe(images.length - 1);
                expect(mosaicRenderer.numActiveTiles()).toBe(images.length - 1);
                window.setTimeout(function () {
                    expect(el.children().length).toBe(images.length - 1);
                }, 1000);
            });
        });
    });


});
