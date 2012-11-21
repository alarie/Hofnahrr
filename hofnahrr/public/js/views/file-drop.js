/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-popover',
    'underscore', 
    'backbone', 
    'views/template', 
    'views/templated-bridge', 
    'templater',
    'helpers/file-handler',
    'data-retriever'
], function ($, _, Backbone, TemplateView, TemplatedBridgeView, Templater, FileHandler, DataRetriever) {
    'use strict';

    var FileDropView, FileView, FileFormView;


    FileView = TemplateView.extend({
        tagName : 'li',
        className : 'span6',
        attributes : {
            draggable : true 
        },

        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 
                        'remove', 
                        'onUploadStarted', 
                        'onUploadSucceeded');

            this.model.on('upload-started', this.onUploadStarted);
            this.model.on('upload-succeeded', this.onUploadSucceeded);
        },

        onUploadStarted : function () {
            this.$el.addClass('uploading');
        },

        onUploadSucceeded : function () {
            this.$el.removeClass('uploading').remove();
        },



        remove : function () {
            this.$el.remove();
        }
    });

    FileFormView = TemplateView.extend({
        events : function () {
            return {
                'submit' : 'onSubmit',
                'click .edit-image' : 'onEditImage'
            };
        },

        initialize : function () {
            TemplateView.prototype.initialize.apply(this, arguments);
            _.bindAll(this, 'render', 'onEditImage');
            this.model = new Backbone.Model();
            this.model.on('change', this.render);
        },

        onSubmit : function (e) {
            var data = (new DataRetriever({el : this.$el})).getData();
            e.preventDefault();
            this.trigger('files-edited', data, this.getEditedFileIds());
        },

        getEditedFileIds : function () {
            var edited = [];
            _.each(this.models, function (model) {
                edited.push(model.id);
            });
            return edited;
        },

        setModels : function (models) {
            var that = this;

            this.models = models;

            this.currentFiles = [];
            _.each(models, function (model) {
                that.currentFiles.push(model.get('title') || model.get('name'));
            });

            if (this.models.length >= 1) {
                this.model.set(this.models[0].toJSON());
                this.readImage(this.models[0]);
                this.model.trigger('change');
            }
        },

        readImage : function (model) {
            var that = this;
            this.img = new Image();
            this.imageLoaded = false;
            this.img.src = 'http://localhost:2403/' + model.get('url');
            this.img.onload = function () {
                that.imageLoaded = true;  
            };
        },

        onEditImage : function () {
            var Intent = window.Intent || window.intent,
                that = this,
                onsuccess = function (data) {
                    var model = that.models[0].toJSON();
                    model.file = data;                    
                    that.trigger('file-data-edited', model, model.id);
                };


            if (!Intent) {
                return;
            }

            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                mime = 'image/png',
                data,
                intent;

            canvas.width = this.img.width;
            canvas.height = this.img.height;
            ctx.drawImage(this.img, 0, 0);
            data = canvas.toDataURL(mime, null);

            intent = new Intent('http://webintents.org/edit', mime, data);
            window.navigator.startActivity(intent, onsuccess);
        },

        render : function () {
            this.beforeRender();

            var data = _.extend({
                names : this.currentFiles
            }, this.model.toJSON());
            this.$el.empty().append(this._compiledTemplate(data));

            this.afterRender();
            return this;
        }
    });

    FileDropView = TemplatedBridgeView.extend({
        dragEvents : {
            'dragenter' : 'ignoreEvent',
            'dragleave' : 'ignoreEvent',
            'dragover' : 'onDragOver',
            'dragend' : 'onDragEnd',
            'drop' : 'onDrop',
        },

        events : function () {
            return {
                'click .items .closer' : 'onRemoveItem',
                'click .thumbnail' : 'onSelectThumbnail',
                'dragstart .thumbnail' : 'onThumbnailDragStart', 
                'dragend .thumbnail' : 'onThumbnailDragEnd',
                'mousedown .items li' : 'onToggleThumbnail'
            };
        }, 

        initialize : function (options) {
            var that = this;

            _.bindAll(this);

            this.uploadToPath = options.uploadToPath;

            TemplateView.prototype.initialize.apply(this, arguments);

            this.fileTemplate = options.fileTemplate;

            this._createCollection();

            _.each(this.dragEvents, function (val, key) {
                $('body').on(key, that[val]);
            });
        },

        updateFiles : function () {
            var files;
            if (this.model && (files = this.model.get(this.options.modelFileListProperty || 'files'))) {
                this.files = new Backbone.Collection(files);
                this.onAddAll(this.files);
            }
        },

        onToggleThumbnail : function (e) {
            // TODO check for win or mac
            var ctrl = e.ctrlKey || e.metaKey,
                shift = e.shiftKey;

            console.log(ctrl, shift);

            if (!(shift || ctrl)) {
                this._deselectAll();
                this._select(e.currentTarget);
            }
            else if (shift) {
                this._deselectAll();
                this._expandSelectionTo(e.currentTarget);
            }
            else if (ctrl) {
                this._toggle(e.currentTarget);
            }
        },

        _deselectAll : function () {
            this.$('.items').find('.selected').removeClass('selected');
        },

        _select : function (el) {
            this._firstSelected = $(el).addClass('selected');
        },

        _toggle : function (el) {
            $(el).toggleClass('selected');
        },

        _expandSelectionTo : function (el) {
            var that = this,
                items = this.$('.items').children(),
                i = items.index(this._firstSelected),
                j = items.index(el),
                tmp;

            if (i > j) {
                tmp = i;
                i = j;
                j = tmp;
            }

            j += 1;
            items = Array.prototype.slice.apply(items, [i, j]);
            _.each(items, function (child) {
                that._select(child);
            });
        },

        setModel : function () {
            if (this.model) {
                this.model.off('change:pictures', this.updateFiles);
            }

            var retval = TemplatedBridgeView.prototype.setModel.apply(this, arguments);
            
            this.updateFiles();

            if (this.model) {
                this.model.on('change:pictures', this.updateFiles);
            }

            return retval;
        },

        _getItemIdByElement : function (el) {
            return $(el)
                .closest('[data-file-drop-item-id]')
                .attr('data-file-drop-item-id');
        },

        _getContainerIdByElement : function (el) {
            return $(el)
                .closest('li')
                .find('[data-file-drop-container-id]')
                .attr('data-file-drop-container-id');
        },

        _createCollection : function () {
            this.fileCollection = new Backbone.Collection([], {
                url : this.uploadToPath
            });

            this.fileCollection.on('add', this.onAdd);
            this.fileCollection.on('reset', this.onAddAll);
        },

        onSelectThumbnail : function () {
            if (this.fileEdit) {
                this.fileEdit.setModels(this.getSelectedItems());
            }
        }, 

        onRemoveItem : function (e) {
            var itemId = this._getItemIdByElement(e.target),
                containerId = this._getContainerIdByElement($('aside.well .active'));

            e.preventDefault();

            if (containerId) {
                this.trigger('remove-item-from-container', itemId, containerId);
            }
            else {
                this.trigger('remove-item', itemId);
            }
        },

        onAdd : function (model) {
            var view = new FileView({
                model : model,
                template : this.fileTemplate
            });

            this.$('.items').append(view.render().el);
        },

        onAddAll : function (collection) {
            this.$('.items').empty();
            collection.each(this.onAdd);
        },

        ignoreEvent : function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        onThumbnailDragStart : function (e) {
            e = e.originalEvent;

            // TODO create nice drag preview
            var data = [],
                div = document.createElement('div');

            div.style.maxWidth = '300px';
            div.style.height = '120px';
            this.$('.thumbnail.selected').each(function () {
                this.style.opacity = '0.4';  // this / e.target is the source node.
                div.appendChild(this.cloneNode(true), null);
            });
            document.body.appendChild(div, null);
            e.dataTransfer.setDragImage(div, 0, 0);
            e.dataTransfer.setData('text/plain', JSON.stringify(data));
        },

        onThumbnailDragEnd : function () {
            this.$('aside .drag-over').removeClass('drag-over');
        },

        getSelectedItems : function () {
            var files = this.files,
                items = [];
                
            this.$('.selected').each(function () {
                var id = $(this).find('[data-file-drop-item-id]')
                            .attr('data-file-drop-item-id'),
                    item = files.get(id);

                if (item) {
                    item.set((new DataRetriever({el : $(this)})).getData());
                    items.push(item);
                }
            });

            return items;
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
                this.readFiles(files, {
                    onFileRead : this.onFileRead
                });
                this.trigger('files-dropped', files);
            }
        },

        onClose : function (e) {
            e.preventDefault();
            this.$el.hide();
        },

        readFiles : function (files, options) {
            _.each(files, function (file) {
                FileHandler.create()
                    .filter(file.type)
                    .getDataURL(file, options.onFileRead);
            });
        },

        onFileRead : function (file) {
            console.log(file);
            file.id || (file.id = file.name);
            this.trigger('file-read', file, this.model ? this.model.id : null);
        },

        addUploadFile : function (file) {
            var view = new FileView({
                model : file,
                template : this.fileTemplate
            });
            this.$('.upload-container').append(view.render().el);
        },

        uninstall : function () {
            var that = this;
            _.each(this.dragEvents, function (val, key) {
                $('body').off(key, that[val]);
            });
        },

        afterRender : function () {
            var that = this;

            this.$('.pictures-help').popover({
                title : Templater.i18n('pictures_help'),
                content : Templater.i18n('pictures_add_by_dragging'),
                placement : 'right',
                trigger : 'hover'
            });

            this.fileEdit = new FileFormView({
                el : '.item-details',
                template : this.options.fileEditTemplate
            }).render();

            this.fileEdit.on('file-data-edited', this.onFileRead);

            this.fileEdit.on('files-edited', function (data, fileIds) {
                that.trigger('files-edited', data, fileIds, that.model.id);
            });
        }

    });

    return FileDropView;
});
