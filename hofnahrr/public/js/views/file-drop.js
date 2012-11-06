/*global define*/
define([
    'underscore', 'backbone', 
    'views/template', 
    'helpers/file-handler', 'helpers/file-upload'
], function (_, Backbone, TemplateView, FileHandler, FileUpload) {
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

                this.set(attributes, options);
                
                uploader.on('success', function (data) {
                    that.onUploaded(data, options);
                });

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

                if (options.success) {
                    console.log("TODO: set success args");
                    options.success();
                }
            }
        
        }),

        FileView = TemplateView.extend({
            tagName : 'li',
            className : 'span3',

            events : function () {
                return {
                    'change .upload-file' : 'onDoUploadChange'
                };
            },

            initialize : function () {
                TemplateView.prototype.initialize.apply(this, arguments);
                _.bindAll(this, 'remove', 'onDoUploadChange');
            },

            onDoUploadChange : function (e) {
                this.model.set({
                    doUpload : e.target.checked
                });
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
                'submit' : 'onStartUpload',
                'click .close' : 'onClose'
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

            this.$el.show();

            if (count) {
                this.readFiles(files);
                this.trigger('files-dropped', files);
            }
        },

        onStartUpload : function (e) {
            var that = this,
                files = this.files;

            e.preventDefault();
            
            this.files.each(function (file) {
                if (file.get('doUpload')) {
                    file.upload();
                }
            });
            
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
            this.files.create(file);
        },

        uninstall : function () {
            var that = this;
            _.each(this.dragEvents, function (val, key) {
                $('body').off(key, that[val]);
            });
        },

        render : function () {
            this.$el
                .append(this._compiledTemplate())
                .hide();
            return this;
        }

    });

    return FileDropView;
});
