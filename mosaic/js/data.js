/*global define*/
define([
    
], function () {
    'use strict';

    var savedData = window.localStorage.images ? JSON.parse(window.localStorage.images) : null,
        data = {
            version : 0.0, 
            data : [{
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
            },

            {
                x : 0,
                y : 0,
                sacle: 1.0,
                url : 'http://www.athensberlin.com/en/photos/text/235.jpg',
                title : 'nach 1999',
                date : '2002-01-01',
                description : 'Bla'
            }
        ]
        };
    
    if (savedData && savedData.version > data.version) {
        data = savedData;
    }

    return data.data;
});
