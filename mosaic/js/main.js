require(['handlebars', '../js/mosaic'], function (Handlebars, mosaic) {

    var lang = {
        history_item_remove : 'Löschen',
        history_item_toggle : 'Ein-/Ausblenden',
    };

    Handlebars.registerHelper('i18n', function (textId) {
        return lang[textId] || '';
    }); 

    Handlebars.registerHelper('isChecked', function (checked) {
        return checked ? 'checked="checked"' : '';
    });

    Handlebars.registerHelper('year', function (date) {
        return (new Date(date)).getFullYear();
    }); 


    var images = window.localStorage.images ? JSON.parse(window.localStorage.images) : [{
                x : 0, 
                y: 0, 
                url : 'http://germanhistorydocs.ghi-dc.org/images/vor%20dem%20Reichstag.jpg',
                title : 'Vor 1945',
                date : '1919-05-15',
                description : ''
            },
            {
                x : -2, 
                y: 19.5, 
                scale : 1.1, 
                url : 'http://iconicphotos.files.wordpress.com/2009/12/09_wrapped_reichstag_02.jpg',
                title : 'Christos Verhüllter Reichstag 1995',
                date : '1995-01-01',
                description : ''
            },
            {
                x : 30, 
                y: 21.5, 
                scale : 1.19, 
                url : 'http://www.berliner.de/sites/default/files/orte/bilder/Reichstag.jpg',
                title : 'Nach 1999: Die Kuppel',
                date : '1999-01-01',
                description : ''
            },
            {
                x : -10,
                y : -13,
                scale : 0.52,
                url : 'http://abenteuerinberlin.files.wordpress.com/2010/03/reichstag1.jpg',
                title : 'Nach 1999: Die Kuppel bei Nacht',
                date : '2000-01-01',
                description : ''
            }
        ],
        range = $('input[type="range"]'),
        mosaicRenderer = new mosaic.MosaicRenderer({
            canvas : $('#container'),
            width : 1000,
            height: 600,
            minOpacity : 0.7
        }),
        max, step, 
        template = Handlebars.compile($('#list-item').text()),

        historyTemplate = Handlebars.compile($('#hb-history-item').text()),
        
        layers = $('ul.layers'),
        history = $('ul.history');

    var composer = new mosaic.MosaicComposer();
    $('#edit').click(function () {
        if (composer.renderer) {
            composer.uninstall();
        }
        else {
            composer.installTo(mosaicRenderer);
        }

    });

    $('#save').click(function () {
        var tiles = [];
        mosaicRenderer.forEachActiveTile(function (tile) {
            tiles.push(tile.spec);
        });
        console.log(tiles);
        window.localStorage.images = JSON.stringify(tiles);
    });

    mosaicRenderer.on('tile-added', function (tile) {
        var el = $(template(tile.spec)),
        el2 = $(historyTemplate(tile.spec));

        layers.append(el);
        history.append(el2);

        el.add(el2).on('click', 'a', function (e) {
            $(e.target).closest('label').trigger('click');
            var step;
            range.val(max * ((mosaicRenderer.numTiles() - $(this).closest('li').prevAll('li').length - 1) / (mosaicRenderer.numTiles() - 1)));
            step = range[0].value / max;
            mosaicRenderer.goToPercent(step, true);
        });

        el2.on('click', '.remove', function () {
            mosaicRenderer.removeTile(tile);
            el2.remove();
        });
        el2.on('click', '.toggle', function (e) {
            var target = $(e.target); 
            if (target.hasClass('pressed')) {
                tile.activate();
                target.removeClass('pressed');
            }
            else {
                tile.deactivate();
                target.addClass('pressed');
            }

        });
    });


    mosaicRenderer.addTiles(images);
    
    max = range[0].max * 1;
    step = 0;

    range.on('change', function (e) {
        var step = range[0].value / max;
        mosaicRenderer.goToPercent(step);
    });

    mosaicRenderer.canvas.on('mousewheel DOMMouseScroll', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var evt = e.originalEvent,
            delta = evt.wheelDeltaY || (-1.5 * evt.detail);

        step += (delta * -1) / 2000;
        if (delta < 0) {
            step = Math.max(step, 0);
        }
        else {
            step = Math.min(step, 1);
        }
        range.val(max * step);
        range.change();
    });

});
