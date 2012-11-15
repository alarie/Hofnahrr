/*global define*/
define([
   'jam/bootstrap-sass/js/bootstrap-modal',
   'underscore',
   'views/template'
], function ($, _, TemplateView) {
    'use strict';

    var Modal,
        transitionEvents = 'transitionend webkitTransitionEnd oTransitionEnd oTransitionend';

    Modal = TemplateView.extend({
        className : 'animated-turn',

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

            this.contentViews = [];

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

        setContentViews : function (contentViewOptions, selected) {
            var container = this.$('.modal-body'),
                that = this,
                needsDelegateEvents = false;

            that.contentViews = contentViewOptions;

            _.each(contentViewOptions, function (options, i) {
                container.append(options.view.$el.hide());
                if (options.trigger) {
                    var trigger = {};
                    needsDelegateEvents = true;

                    trigger[options.trigger] = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that.openContentView(i);
                        return false;
                    };

                    that.additionalEvents || (that.additionalEvents = {});
                    _.extend(that.additionalEvents, trigger);
                }
            });

            if (needsDelegateEvents) {
                this.delegateEvents();
            }

            this.openContentView(selected || 0);
            
            return this;
        },

        delegateEvents : function () {
            var events = _.isFunction(this.events) ? this.events() : this.events;
            if (this.additionalEvents) {
                _.extend(events, this.additionalEvents);
            }
            return TemplateView.prototype.delegateEvents.apply(this, [events]);
        },

        openContentView : function (selected) {

            selected || (selected = 0);
            if (selected >= 0 && selected < this.contentViews.length) {
                var opts = this.contentViews[selected],
                    title = opts.title,
                    view = opts.view,
                    that = this;

                if (opts.className) {
                    this.$el.addClass(opts.className);
                }

                //this.$('.modal').one(transitionEvents, function () {
                    that.closeCurrentView();
                    that.selectedView = selected;
                    view.$el.show();
                    view.render();

                    that.$('.modal')
                        .removeClass('turn-out')
                        .addClass('turn-in').on(transitionEvents, function () {
                        that.$('.modal').removeClass('turn-in');
                    });

                    this.updateModal();
                //}).addClass('turn-out');
            }
        },

        updateModal : function () {
            var that = this,
                i = this.selectedView,
                header = this.$('.modal-header h3');
            _.each(this.contentViews, function (opts, j) {
                opts.view.setModel(that.model);
                if (i === j) {
                    header.text(_.isFunction(opts.title) ? 
                        opts.title(that.model) : 
                        opts.title
                    );
                }
            });
        },

        setModel : function (model) {
            this.model = model;
            this.updateModal();
        },

        closeCurrentView : function () {
            if (this.selectedView !== null) {
                if (this.contentViews[this.selectedView].className) {
                    this.$el.removeClass(
                        this.contentViews[this.selectedView].className
                    );
                }
                this.contentViews[this.selectedView].view.$el.hide();
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
        },


    });
    
    return Modal;
});
