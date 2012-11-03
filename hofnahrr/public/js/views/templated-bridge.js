/*global define*/
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
