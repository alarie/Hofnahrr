/*global define*/
define([
   'jam/bootstrap-sass/js/bootstrap-modal',
   'underscore',
   'views/template'
], function ($, _, TemplateView) {
    'use strict';

    var Modal;

    Modal = TemplateView.extend({
        events : function () {
            return {
                'click [data-wizard-action]' : 'onWizardAction'
            };
        },

        initialize : function () {
            _.bindAll(this, 'onWizardAction');

            _.defaults((this.options.modalOptions || {}), {
                backdrop : true,
                keyboard : true,
                show : true,
                remote : false
            });

            TemplateView.prototype.initialize.apply(this, arguments);

            this.selectedView = null;
        },

        onWizardAction : function (e) {
            var action = $(e.target).data('wizard-action');
            this[action + 'Step']();
        },

        prevStep : function () {
            this.openContentView(this.selectedView - 1);
        },

        nextStep : function () {
            this.openContentView(this.selectedView + 1);
        },

        render : function () {
            this.beforeRender();
            var data = this.options.modalData;
            
            this.$el.empty().append(this._compiledTemplate(data));

            $('body').append(this.el);
            
            this.modalEl = $('#' + this.options.modalData.modalId);
            this.modalEl.modal(this.options.modalOptions);

            this.afterRender();
            return this;
        },

        setContentViews : function (contentViews, selected) {
            var container = this.$('.modal-body');
            this.contentViews = contentViews;

            _.each(contentViews, function (view) {
                container.append(view.$el.hide());
            });

            this.openContentView(selected || 0);
            
            return this;
        },

        openContentView : function (selected) {
            selected || (selected = 0);
            if (selected >= 0 && selected < this.contentViews.length) {
                var view = this.contentViews[selected];
                this.closeCurrentView();
                this.selectedView = selected;
                view.$el.show();
                view.render();
            }
        },

        closeCurrentView : function () {
            if (this.selectedView !== null) {
                this.contentViews[this.selectedView].$el.hide();
            }
        },

        toggle : function () {
            this.modalEl.modal('toggle');
            return this;
        },

        show : function () {
            this.modalEl.modal('show');
            return this;
        },

        hide : function () {
            this.modalEl.modal('hide');
            return this;
        },

        on : function (event, callback) {
            this.modalEl.on(event, callback);
            return this;
        },

        off : function (event, callback) {
            this.modalEl.off(event, callback);
            return this;
        }
    });
    
    return Modal;
});
