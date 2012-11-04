/*global define*/
define([
    'underscore', 'backbone', 
    'views/template', 
    'helpers/file-handler', 'helpers/file-upload'
], function (_, Backbone, TemplateView, FileHandler, FileUpload) {
    'use strict';

    var FileDropView,
        FileModel = Backbone.Model.extend(),
        FileView = TemplateView.extend(),
        FileCollection = Backbone.Collection.extend();

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
                'submit' : 'onStartUpload'
            };
        },

        initialize : function (options) {
            var that = this;

            //this.files = new FileCollection({
                //model : FileModel
            //});
            
            this.files = {};

            this.uploadToPath = options.uploadToPath;

            TemplateView.prototype.initialize.apply(this, arguments);
            this.fileTemplate = options.fileTemplate;

            _.bindAll(this);

            _.each(this.dragEvents, function (val, key) {
                $('body').on(key, that[val]);
            });
            
            this._compiledFileTemplate = this._compileTemplate(this.fileTemplate);

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

            this.$('.upload-file:checked').each(function (index, fileInput) {
                var name = fileInput.value,
                    file = files[name];
                    
                if (file) {
                    that.uploadFile(file);
                }
            });
        },

        uploadFile : function (file) {
            var that = this,
                uploader = new FileUpload(this.uploadToPath);
            uploader.on('loaded', function (result) {
                result.origFileName = file.name;
                that.onFileUploaded(result);
            });
            uploader.upload(file.file);
        },

        onFileUploaded : function (result) {

        },

        readFiles : function (files) {
            var that = this;
            _.each(files, function (file) {
                FileHandler.create()
                    .filter(file.type)
                    .getDataURL(file, function (file) {
                        that.addFile(file);
                    });
            });

        },

        addFile : function (file) {
            this.files[file.name] = file;
            this.$el.append(this.renderFile(file));
        },

        uninstall : function () {
            var that = this;
            _.each(this.dragEvents, function (val, key) {
                $('body').off(key, that[val]);
            });
        },

        renderFile : function (file) {
            var el = this._compiledFileTemplate(file);
            this.$('#upload-preview .justifier')
                .before(el);
            return this;
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
