/*global define*/
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    'use strict';

    var FileDropView;

    FileDropView = Backbone.View.extend({
        el : 'body',
        events : function () {
            return {
                'dragenter' : 'ignoreEvent',
                'dragleave' : 'ignoreEvent',
                'dragover' : 'onDragOver',
                'dragend' : 'onDragEnd',
                'drop' : 'onDrop',
            };
        },
        initialize : function () {
            _.bindAll(this);
        },

        ignoreEvent : function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        onDragOver : function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.trigger('drag-over');
        },

        onDragEnd : function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.trigger('drag-end');
        },

        onDrop : function (e) {
            e.stopPropagation();
            e.preventDefault();
            e = e.originalEvent;

            this.trigger('drop');

            var files = e.dataTransfer.files,
                count = files.length;

            if (count) {
                this.trigger('files-dropped', files);
            }
        },

        uninstall : function () {
            this.$el.off('dragenter, dragleave, dragover, dragend, drop');
        }
    });

    return FileDropView;
});
