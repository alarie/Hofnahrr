/*global define*/
define([
    'underscore', 'backbone', 'templater'
], function (_, Backbone, Templater) {
    'use strict';

    var TemplateView = Backbone.View.extend({
        initialize : function (options) {
            this.template = options.template;

            _.bindAll(this, 'render');

            if (options.events) {
                this.events = _.isFunction(options.events) ? 
                    options.events() : 
                    options.events;
                this.delegateEvents(this.events);
            }

            if (this.model) {
                this.model.on('change', this.render);
            }

            this._compileTemplate();
        },

        _compileTemplate : function () {
            this._compiledTemplate = Templater.compile(this.template);
        },

        beforeRender : function () {},
        afterRender : function () {},

        render : function () {
            this.beforeRender();
            var data = this.model ? this.model.toJSON() : {};
            
            this.$el.empty().append(this._compiledTemplate(data));


            this.afterRender();
            return this;
        }
    
    });

    return TemplateView;
});    
