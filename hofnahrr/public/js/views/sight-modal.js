/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-popover',
    'underscore', 'backbone', 
    'views/template', 
    'views/modal', 
    'templater'
], function ($, _, Backbone, TemplateView, ModalView, Templater) {
    'use strict';

    var SightModalView;

    SightModalView = ModalView.extend({
        events : function () {
            return {
                'click .well li a' : 'onOpenContainer',
                'click .adder' : 'onItemsAddToContainer',
                'dragover aside li:not(.nav-header)' : 'onDragOverContainer', 
                'dragleave aside li:not(.nav-header)' : 'onDragLeaveContainer', 
                'drop aside li:not(.nav-header)' : 'onDropContainer',
                'click .container-header .nav a' : 'onChangeSightView'
            };
        },

        initialize : function (options) {
            ModalView.prototype.initialize.apply(this, arguments);

            _.bindAll(this);
        },

        onAdd : function (model) {
            var view = new TemplateView({
                template : this.options.listItemTemplate,
                tagName : 'li',
                className : 'nav-item hover-tools-trigger',
                model : model
            });

            this.$('.main-nav-list ul.nav').append(view.render().el);
        },

        onAddAll : function (collection) {
            this.$('.main-list-view ul.nav .nav-item').remove();
            collection.each(this.onAdd);
        },

        _getContainerIdByElement : function (el) {
            return $(el)
                .closest('li')
                .find('[data-file-drop-container-id]')
                .attr('data-file-drop-container-id');
        },

        _activateContainerElementById : function (containerId) {
            this.$('.well')
                .find('.active').removeClass('active')
                .end()
                .find('[data-file-drop-container-id="' + containerId + '"]')
                .parent()
                .addClass('active');
        },

        _activateSightView : function (name) {
            this.$('.container-header')
                .find('.active')
                .removeClass('active')
                .end()
                .find('.' + name)
                .parent('li')
                .addClass('active');
        },

        onChangeSightView : function (e) {
            this._activateSightView($(e.target).closest('a').attr("class"));
        },

        onOpenContainer : function (e) {
            var containerId = this._getContainerIdByElement(e.target);
            this.trigger('open-container', containerId);
        },

        setModel : function (item) {
            this._activateContainerElementById(item ? item.id : null);
            return ModalView.prototype.setModel.apply(this, arguments);
        },

        ignoreEvent : function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        onDragOverContainer : function (e) {
            e = e.originalEvent;
            this.ignoreEvent(e);

            $(e.target).closest('li').find('a').addClass('drag-over');
            e.dataTransfer.dropEffect = 'move';

            return false;
        },

        onDragLeaveContainer : function (e) {
            $(e.target).closest('li').find('a').removeClass('drag-over');
        },

        onDropContainer : function (e) {
            e = e.originalEvent;

            var that = this,
                containerId = this._getContainerIdByElement(e.target),
                items;

            e.preventDefault();

            items = this.getSelectedView().getSelectedItems();
            this.addItemsToContainer(items, containerId);

            return false;
        },
        
        onItemsAddToContainer : function (e) {
            var containerId = this._getContainerIdByElement(e.target),
                items;
                
            items = this.getSelectedView().getSelectedItems();

            this.addItemsToContainer(items, containerId);
        },

        addItemsToContainer : function (items, containerId) {
            var that = this;
            _.each(items, function (itm) {
                // if item has no id, it was not yet uploaded, so upload it
                if (!itm.id) {
                    itm.upload(null, {
                        success : function () {
                            that.trigger('add-items-to-container', [itm], containerId);
                        }
                    });
                }
                else {
                    that.trigger('add-items-to-container', [itm], containerId);
                }
            });
        },

        uninstall : function () {
            var that = this;
            _.each(this.dragEvents, function (val, key) {
                $('body').off(key, that[val]);
            });
        },

        afterRender : function () {
            this.$('.pictures-help').popover({
                title : Templater.i18n('pictures_help'),
                content : Templater.i18n('pictures_add_by_dragging'),
                placement : 'right',
                trigger : 'hover'
            });
        }

    });

    return SightModalView;
});
