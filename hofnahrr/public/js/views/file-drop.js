/*global define*/
define([
    'jam/bootstrap-sass/js/bootstrap-popover',
    'underscore', 'backbone', 
    'views/template', 
    'templater',
    'helpers/file-handler', 'helpers/file-upload'
], function ($, _, Backbone, TemplateView, Templater, FileHandler, FileUpload) {
    'use strict';

    var FileDropView,

        FileModel = Backbone.Model.extend({

            defaults : {
                doUpload : true,
                uploaded : false
            },
           
            // Overwrite default save, so the image is JUST uploaded once the
            // the upload function is called.
            // This is necessary because Collection.create implicitly calls
            // save and would thus trigger the upload. 
            save : function (attributes, options) {},

            upload : function (attributes, options) {
                var that = this,
                    uploader = new FileUpload(this.collection.url);

                if (attributes) {
                    this.set(attributes);
                }
                
                uploader.on('success', function (data) {
                    that.onUploaded(data, options);
                });

                this.trigger('upload-started');

                uploader.upload(this.attributes.file);
            },

            onUploaded : function (result, options) {
                options || (options = {});

                this.set(_.extend(result, {
                    uploaded : true,
                    doUpload : false,
                    origFileName : this.attributes.name,
                    url : 'http://localhost:2403/pictures/' + result.name
                }));

                delete this.attributes.file;

                this.trigger('uploaded', this.attributes);

                this.trigger('upload-succeeded');

                if (options.success) {
                    console.log("TODO: set success args");
                    options.success();
                }

                delete this.attributes.id;
                delete this.id;
                this.destroy();
            }
        
        }),

        FileView = TemplateView.extend({
            tagName : 'li',
            className : 'span3',
            attributes : {
                draggable : true 
            },

            events : function () {
                return {
                    'click .thumbnail' : 'onToggleThumbnail',
                };
            },

            initialize : function () {
                TemplateView.prototype.initialize.apply(this, arguments);
                _.bindAll(this, 
                          'remove', 
                          'onToggleThumbnail', 
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

            onToggleThumbnail : function (e) {
                $(e.target).closest('li').toggleClass('selected');
            },

            remove : function () {
                this.$el.remove();
            }
        }),

        FileCollection = Backbone.Collection.extend({
            model : FileModel,
            initialize : function (models, options) {
                this.url = options.url;
            }
        });

    FileDropView = TemplateView.extend({
        dragEvents : {
            'dragenter' : 'ignoreEvent',
            'dragleave' : 'ignoreEvent',
            'dragover' : 'onDragOver',
            'dragend' : 'onDragEnd',
            'drop' : 'onDrop',
        },

        events : function () {
            return {
                'click .cancel' : 'onClose',

                'click .adder' : 'onThumbnailsAddToCollection',
                'dragstart .thumbnail' : 'onThumbnailDragStart', 
                'dragleave aside li:not(.nav-header)' : 'onThumbnailDragLeave', 
                'dragover aside li:not(.nav-header)' : 'onThumbnailDragOver', 
                'dragend .thumbnail' : 'onThumbnailDragEnd', 
                'drop aside li:not(.nav-header)' : 'onThumbnailDrop'
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

        _createCollection : function () {
            this.files = new FileCollection([], {
                url : this.uploadToPath
            });

            this.files.on('add', this.onAdd);
            this.files.on('reset', this.onAddAll);
        },

        onAdd : function (model) {
            var view = new FileView({
                model : model,
                template : this.fileTemplate
            });


            this.$('#upload-preview .justifier').before(view.render().el);
        },

        onAddAll : function (collection) {
            this.$('#upload-preview').children().not('.justifier').remove();
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

        onThumbnailDragOver : function (e) {
            e = e.originalEvent;
            this.ignoreEvent(e);

            $(e.target).closest('li').addClass('drag-over');
            e.dataTransfer.dropEffect = 'move';

            return false;
        },

        onThumbnailDragLeave : function (e) {
            $(e.target).closest('li').removeClass('drag-over');
        },

        onThumbnailDrop : function (e) {
            e = e.originalEvent;

            var that = this,
                containerId = $(e.target)
                    .closest('li')
                    .find('[data-file-drop-container-id]')
                    .attr('data-file-drop-container-id'),
                items;

            e.preventDefault();

            items = this.getSelectedItems();
            this.addItemsToContainer(items, containerId);

            return false;
        },
        
        onThumbnailDragEnd : function (e) {
            this.$('aside .drag-over').removeClass('drag-over');
        },

        onThumbnailsAddToCollection : function (e) {
            var containerId = $(e.target)
                    .closest('li')
                    .find('[data-file-drop-container-id]')
                    .attr('data-file-drop-container-id'),
                items = this.getSelectedItems();

            this.addItemsToContainer(items, containerId);
        },

        getSelectedItems : function () {
            var files = this.files,
                items = [];
            this.$('.selected').each(function () {
                var id = $(this).find('[data-file-drop-item-id]')
                            .attr('data-file-drop-item-id'),
                    item = files.get(id);
                items.push(item);
            });
            return items;
        },

        addItemsToContainer : function (items, containerId) {
            var that = this;
            _.each(items, function (itm) {
                itm.upload(null, {
                    success : function () {
                        that.trigger('add-items-to-container', [itm], containerId);
                    }
                });
            });
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
                this.readFiles(files);
                this.trigger('files-dropped', files);
            }
        },

        onClose : function (e) {
            e.preventDefault();
            this.$el.hide();
        },

        readFiles : function (files) {
            var that = this;
            _.each(files, function (file) {
                FileHandler.create()
                    .filter(file.type)
                    .getDataURL(file, that.onFileRead);
            });
        },

        onFileRead : function (file) {
            file.id = file.name;
            this.files.create(file);
        },

        uninstall : function () {
            var that = this;
            _.each(this.dragEvents, function (val, key) {
                $('body').off(key, that[val]);
            });
        },

        render : function () {
            this.$el.empty()
                .append(this._compiledTemplate());

            this.$('.pictures-help').popover({
                title : Templater.i18n('pictures_help'),
                content : Templater.i18n('pictures_add_by_dragging'),
                placement : 'right',
                trigger : 'hover'
            });
            return this;
        }

    });

    return FileDropView;
});
