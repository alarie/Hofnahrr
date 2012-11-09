/*global define*/
define([
    'underscore', 'backbone', 
    'templater',
    'data-retriever',

    'models/sight',

    'views/list',
    'views/templated-bridge',
    'views/file-drop',
    'views/modal',

    'text!tmpl/sight-info.tmpl',
    'text!tmpl/sights-list.tmpl',
    'text!tmpl/sight-link.tmpl',
    'text!tmpl/modal.tmpl',
    'text!tmpl/upload.tmpl',
    'text!tmpl/image.tmpl',
    'text!tmpl/sight-form.tmpl',
    'text!tmpl/picture-form.tmpl',
], function (
    _, Backbone, Templater,
    
    DataRetriever,
    
    SightModel, 

    ListView, 
    TemplatedBridgeView,
    FileDropView,
    ModalView,

    tmplSightInfo,
    tmplSightsList, tmplSightLink,
    tmplModal, tmplUpload, tmplImage, tmplSightForm, tmplPictureForm) {
    'use strict';

    var SightController;

    SightController = {
        init : function () {
            _.bindAll(this, 
                    'onEditSight', 
                    'onOpenSight', 
                    'onCreateSight', 
                    'onCreateNewSight',
                    'onShowSightMap');
            // no sight is selected now
            this.selectedSight = null;



            this.createListView();
            this.createSightInfoView();

            this.createSightCollection();

            this._sightControllerInstalled = true;

            this.sightCollection.fetch({
                success : this.start
            });
        },

        createSightCollection : function () {
            // create a new Sight Collection
            this.sightCollection = new Backbone.Collection({
                model : SightModel,
            });
            this.sightCollection.url = 'sights/';

            // sight collection events
            this.sightCollection.on('add', this.listView.onAdd);
            this.sightCollection.on('reset', this.listView.onAddAll);
        },

        createSightInfoView : function () {
            this.sightInfoView = new TemplatedBridgeView({
                el : $('#main'),
                template : tmplSightInfo
            });
        },

        createListView : function () {
            this.listView = new ListView({
                el : $('#sidebar'),
                template : tmplSightsList,
                listItemTemplate : tmplSightLink
            });

            this.listView.render();
        },

        onShowSightMap : function () {
            console.log("todo");
        },

        onOpenSight : function (id) {
            this.setSelectedSight(id);
            if (this.selectedSight) {
                this.sightInfoView.setModel(this.selectedSight);
            }
        },

        onEditSight : function (id) {
            this.setSelectedSight(id);
            if (this.selectedSight) {
                this.createSightModal();
                this.sightFormView.setModel(this.selectedSight);
                this.pictureFormView.setModel(this.selectedSight);
                this.sightModal.show();
            }
        },

        onCreateNewSight : function () {
            this.selectedSight = null;
            this.createSightModal();
            this.sightFormView.setModel(null);
            this.pictureFormView.setModel(null);
            this.sightModal.show();
        },


        setSelectedSight : function (id) {
            if (id) {
                this.selectedSight = this.sightCollection.find(function (model) {
                    return id === model.get('speakingId');
                });
            }
            else {
                this.selectedSight = null;
            }
        },


        onCreateSight : function (data) {
            var that = this;
            if (this.selectedSight) {
                this.selectedSight.save(data, {
                    success : function () {
                        that.sightFormView.render();
                    }
                });
            }
            else {
                this.sightCollection.create(data, {
                    success : function () {
                        that.sightFormView.setModel(null);
                    }
                });
            }
        },

        createSightFormView : function () {
            if (this.sightFormView) {
                return;
            }

            this.sightFormView = new TemplatedBridgeView({
                el : $('<div/>'),
                template : tmplSightForm,
                events : function () {
                    return {
                        'submit' : function (e) {
                            e.preventDefault();

                            if (e.target.checkValidity()) {
                                var data = (new DataRetriever({
                                    el : $(e.target)
                                })).getData();

                                data.location = {
                                    latitude : data.lat,
                                    longitude : data.lng
                                };
                                data.tags = data.tags.split(',');
                                data.links = data.links.split(',');

                                delete data.lat;
                                delete data.lng;

                                this.trigger('create-sight', data);
                            }

                        }
                    };
                }
            });

            // sight form events
            this.sightFormView.on('create-sight', this.onCreateSight);

            this.sightFormView.afterRender = function () {
                this.$('#sight-tags').tagsInput({
                    height : '50px;',
                    defaultText : Templater.i18n('sight_add_tag')
                });
                this.$('#sight-links').tagsInput({
                    height : '50px;',
                    defaultText : Templater.i18n('sight_add_link')
                });
            };
        },

        createPictureFormView : function () {
            if (this.pictureFormView) {
                return;
            }

            this.pictureFormView = new TemplatedBridgeView({
                el : $('<div class="row-fluid"/>'),
                template : tmplPictureForm,
                events : function () {
                    return {
                        'submit' : function () {
                            // TODO
                        }
                    };
                }
            });
        },

        createFileDropView : function () {
            this.fileDropView = new FileDropView({
                el : $('<div/>'),
                template : tmplUpload,
                fileTemplate : tmplImage,
                uploadToPath : 'http://localhost:2403/pictures'
            });

            // upload events
            this.fileDropView.on('drag-over', this.onFileDragOver);
            this.fileDropView.on('drag-end', this.onFileDragEnd);
            this.fileDropView.on('drop', this.onFileDragEnd);
            this.fileDropView.on('files-dropped', this.onFileDropped);
            this.fileDropView.files.on('uploaded', this.onFileUploaded);

            $('body').append(this.fileDropView.render().el);
        },

        onFileUploaded : function (file) {
            console.log(file);
        },

        createSightModal : function () {
            var that = this;

            if (!this.sightModal) {
                this.sightModal = new ModalView({
                    template : tmplModal,
                    modalOptions : {
                        show : false,
                        backdrop : true
                    },
                    modalData : {
                        modalId : 'sights-modal',
                        modalHeadline : Templater.i18n('sight_wizard'),
                        modalClose : Templater.i18n('wizard_close'),
                        modalNext : Templater.i18n('sight_add_photos'),
                        modalPrev : Templater.i18n('sights_edit_sight'),
                    }
                });

                this.createSightFormView();
                this.createPictureFormView();

                // TODO create views on the fly
                this.sightModal
                    .render()
                    .setContentViews([this.sightFormView, this.pictureFormView]);

                this.sightModal.on('hide', function () {
                    that.router.navigate('sights');
                });
            }
        },

    };

    return {
        installTo : function (target) {
            _.extend(target, SightController);
            SightController.init.apply(target);
        }
    };
});

