/*global define*/

/**
 * @file template.js
 * @description Simple base class that takes a template and renders it.
 * Interpolates the template witha a model if available.
 */

define([
    'underscore', 'backbone', 'templater'
], function (_, Backbone, Templater) {
    'use strict';

    /*
     * options:
     *   noRenderOnChange : Prevent rerendering on changing
     */
    var TemplateView = Backbone.View.extend({
        initialize : function (options) {
            options || (options = {});

            if (options.template) {
                this.template = options.template;
            }

            _.bindAll(this, 'render');

            if (options.events) {
                this.events = _.isFunction(options.events) ? 
                    options.events() : 
                    options.events;
                this.delegateEvents(this.events);
            }

            if (this.model && 
                    this.model instanceof Backbone.Model &&
                    !options.noRenderOnChange) {
                this.model.on('change', this.render);
            }

            this._compiledTemplate = this._compileTemplate();
        },

        _compileTemplate : function (tmpl) {
            return Templater.compile(tmpl || this.template);
        },

        beforeRender : function () {},
        afterRender : function () {},

        render : function () {
            this.beforeRender();
            var data = this.model ? 
                (this.model instanceof Backbone.Model ? this.model.toJSON() : this.model) : 
                {};
            
            this.$el.empty().append(this._compiledTemplate(data));

            this.afterRender();
            return this;
        }
    
    });

    return TemplateView;
});    
