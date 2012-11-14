/*global define*/
define([
    'underscore', 'backbone', 
    'views/templated-bridge',

    'text!tmpl/sight-map.tmpl',
], function (
    _, Backbone, TemplatedBridgeView, 
    tmplSightMap
) {
    'use strict';

    var SightMapView;

    SightMapView = TemplatedBridgeView.extend({
        tagname : 'div',
        template : tmplSightMap,

        // TODO map implementation
    });

    return SightMapView;
});
