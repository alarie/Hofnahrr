/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-modal',
    'underscore',
    'views/template'
], function ($, _, TemplateView) {
    'use strict';

    $.fn.modal.Constructor.prototype.minimize = function () {
        this.isShown = false;
        $.support.transition && this.$element.hasClass('fade') ?
            this.hideWithTransition() :
            this.hideModal();
    };

    $.fn.modal.Constructor.prototype.maximize = function () {
        var that = this;
        $.support.transition ?
            this.$element.one($.support.transition.end, function () { 
                that.$element.trigger('shown');
            }) :
            this.$element.trigger('shown');
        this.isShown = true;
    };

    var Modal,
        transitionEvents = 'transitionend webkitTransitionEnd oTransitionEnd oTransitionend';

    Modal = TemplateView.extend({
        className : 'animated-turn',

        events : function () {
            return {
                'click [data-wizard-action]' : 'onWizardAction',
                'click #save' : 'onSave',
                'click [data-dismiss]' : 'onDataDismiss'
            };
        },

        onDataDismiss : function () {
            this.trigger('onDataDismiss');
        },

        onSave : function () {
            this.trigger('onSave');
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

            var that = this, modal = {
                toggle : function () {
                    that.modalEl.modal('toggle');
                    return that;
                },

                show : function () {
                    that.modalEl.modal('show');
                    return that;
                },

                hide : function () {
                    that.modalEl.modal('hide');
                    return that;
                },

                on : function (event, callback) {
                    that.modalEl.on(event, callback);
                    return that;
                },

                off : function (event, callback) {
                    that.modalEl.off(event, callback);
                    return that;
                },

                minimize : function () {
                    that.modalEl.modal('minimize');
                    return that;
                },

                maximize : function () {
                    that.modalEl.modal('maximize');
                    return that;
                }
            };
            this.modal = modal;


            this.selectedView = null;
        },

        minimize : function () {
            
        },

        maximize : function () {
        
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
            
            this.$el.append(this._compiledTemplate(data));

            this.modalEl = $('#' + this.options.modalData.modalId);
            this.modalEl.modal(this.options.modalOptions);

            this.afterRender();
            return this;
        },

        setContentViews : function (contentViewOptions, selected) {
            var container = this.$('.modal-content'),
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
                    view = opts.view;

                if (opts.className) {
                    this.$el.addClass(opts.className);
                }

                this.closeCurrentView();
                this.selectedView = selected;
                view.$el.show();
                view.render();

                this.updateModal();
            }
        },

        getSelectedView : function () {
            return this.contentViews[this.selectedView].view;
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
        }

    });
    
    return Modal;
});
