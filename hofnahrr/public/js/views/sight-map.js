/*global define*/
define([
    'underscore', 'backbone', 
    'views/templated-bridge',
], function (_, Backbone, TemplatedBridgeView) {
    'use strict';

    var SightMapView;

    SightMapView = TemplatedBridgeView.extend({
        tagname : 'div'

        // TODO map implementation
    });

    return SightMapView;
});

