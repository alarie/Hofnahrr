/*global define*/

/**
 * @file templated-bridge.js
 * @description Mixes the TemplateView class with the BridgeView class, thus
 * making both advantages available in one class.
 */

define([
    'underscore',
    'views/bridge',
    'views/template'
], function (_, BridgeView, TemplateView) {
    'use strict';

    var TemplatedBridgeView;

    TemplatedBridgeView = BridgeView.extend({});
    _.extend(TemplatedBridgeView.prototype, TemplateView.prototype);
    TemplatedBridgeView.prototype.initialize = function () {
        BridgeView.prototype.initialize.apply(this, arguments);  
        TemplateView.prototype.initialize.apply(this, arguments);
    };


    return TemplatedBridgeView;
});
