/*global define*/
define([
    'underscore',
    'views/list',
    'views/list-item'
], function (_, ListView, ListItemView) {
    'use strict';

    var MosaicLayerView,
        MosaicLayerPanelView;

    MosaicLayerView = ListItemView.extend({
        events : function () {
            return {
                'change [type="checkbox"]' : 'onCheckboxChanged'
            };
        },

        initialize : function () {
            ListItemView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'onCheckboxChanged');
        },

        onCheckboxChanged : function (e) {
            this.trigger('item-toggle', e.target.checked, this.model);
        }
    });

    MosaicLayerPanelView = ListView.extend({
        events : function () {
            return {
                'dragstart ul li' : 'onDragStart',
                'dragover ul li' : 'onDragOver',
                'dragenter ul li' : 'onDragEnter',
                'dragleave ul' : 'onDragLeave',
                'dragend ul li' : 'onDragEnd',
                'drop' : 'onDrop'
            };
        },

        initialize : function () {
            ListView.prototype.initialize.apply(this, arguments);

            _.bindAll(this, 
                      'onDragStart', 
                      'onDragOver', 
                      'onDragEnter', 
                      'onDragLeave', 
                      'onDragEnd', 
                      'onDrop', 
                      '_onItemToggle');
        },

        createItemView : function (item) {
            var view = new MosaicLayerView(_.extend({
                tagName : 'li',
                template : this.options.listItemTemplate,
                model : item
            },
            this.options.listItemOptions  || {}));

            view.on('item-toggle', this._onItemToggle);

            return view;
        },

        _onItemToggle : function (isOn, model) {
            this.trigger(isOn ? 'item-selected' : 'item-deselected', model);
        },

        onDragStart : function (e) {
            e = e.originalEvent;
            this.draggedElement = e.target;
            $(e.target).addClass('dragged');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', $(e.target)
                                   .find('[data-drop-item-id]')
                                   .attr('data-drop-item-id'));
        },

        onDragOver : function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        onDragEnter : function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (e.currentTarget !== this.draggedElement) {
                $(e.currentTarget).before(this.draggedElement);
            }
        },

        onDragLeave : function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.target.tagName === 'UL') {
                $(e.target).append(this.draggedElement);
            }
        },

        onDragEnd : function (e) {
            e = e.originalEvent;
            $(e.target)
                .closest('ul')
                .find('.dragged')
                .removeClass('dragged');
        },

        onDrop : function (e) {
            e.stopPropagation();
            e.preventDefault();
            e = e.originalEvent;
            var id = e.dataTransfer.getData('text/plain');
            this.trigger('item-resorted', id, 
                         this.$('[data-drop-item-id="' + id + '"]').closest('li').index());
        }
    });

    return MosaicLayerPanelView;
});

