/*global require */
require(['handlebars', '../js/lang', '../js/data', '../js/mosaic'], function (Handlebars, lang, data, mosaic) {

    var images,
        range,
        mosaicRenderer,
        composer,
        max, step, 
        template, 
        historyTemplate, 
        layers, 
        history;

    Handlebars.registerHelper('i18n', function (textId) {
        return lang[textId] || '';
    }); 

    Handlebars.registerHelper('isChecked', function (checked) {
        return checked ? 'checked="checked"' : '';
    });

    Handlebars.registerHelper('year', function (date) {
        return (new Date(date)).getFullYear();
    }); 


    images = data;

    $('body').append(Handlebars.compile($('#main-template').text()));
    template = Handlebars.compile($('#list-item').text());
    historyTemplate = Handlebars.compile($('#history-item').text());
    layers = $('ul.layers');
    history = $('ul.history');

    range = $('input[type="range"]');
    mosaicRenderer  = new mosaic.MosaicRenderer({
        canvas : $('.mosaic-container'),
        width : 1000,
        height: 600,
        minOpacity : 0.7
    });

    composer = new mosaic.MosaicComposer();
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
                target.closest('li').removeClass('disabled');
            }
            else {
                tile.deactivate();
                target.addClass('pressed');
                target.closest('li').addClass('disabled');
            }

        });
    });

    mosaicRenderer.addTiles(images);
    
    max = range[0].max * 1;
    step = 0;

    range.on('change', function () {
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
