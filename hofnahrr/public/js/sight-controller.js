/*global define*/
define([
    'underscore', 'backbone', 
    'templater',
    'data-retriever',

    'models/sight',

    'views/sight-nav',
    'views/sight-list',
    'views/template',
    'views/templated-bridge',
    'views/file-drop',
    'views/modal',
    'views/sight-map',
    'views/sight-mosaic',
    'views/sight-gallery',

    'text!layout/sight.html',
    'text!tmpl/sight-nav.tmpl',
    'text!tmpl/sight-info.tmpl',
    'text!tmpl/sights-list.tmpl',
    'text!tmpl/sight-link.tmpl',
    'text!tmpl/modal.tmpl',
    'text!tmpl/upload.tmpl',
    'text!tmpl/image.tmpl',
    'text!tmpl/sight-form.tmpl',
    'text!tmpl/picture-form.tmpl'
], function (
    _, Backbone, Templater,
    
    DataRetriever,
    
    SightModel, 

    SightNavView,
    SightListView, 
    TemplateView,
    TemplatedBridgeView,
    FileDropView,
    ModalView,
    SightMapView,
    SightMosaicView,
    SightGalleryView,

    tmplSightLayout,
    tmplSightNav,
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
                    'onOpenSightInfo', 
                    'onOpenSightMap', 
                    'onOpenSightGallery', 
                    'onOpenSightMosaic', 
                    'onCreateSight', 
                    'onCreateNewSight', 
                    'onShowSightMap', 
                    'initSightLayout');


            // no sight is selected now
            this.selectedSight = null;

            this.createSightViews();

            this.createSightCollection();

            this._sightControllerInstalled = true;
            this.layouts.sight = tmplSightLayout;

            this._openedPage = '';

            this.sightCollection.fetch({
                success : this.start
            });

            this.on('layout-set:sight', this.initSightLayout);
        },

        createSightViews : function () {
            this.createSecondaryNavView();
            this.createSightListView();
            this.createSightInfoView();
            this.createSightMapView();
            this.createSightMosaicView();
            this.createSightGalleryView();
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

// TODO create event sight:layout-created and do all inits in that event handler

        createSecondaryNavView : function () {
            var data = {}; 

            if (this.selectedSight) {
                data = this.selectedSight.toJSON();
            }

            this.sightNav = new SightNavView({
                template : tmplSightNav
            })
            .render();
        },

        createSightInfoView : function () {
            this.sightInfoView = new TemplatedBridgeView({
                tagName : 'div',
                className : 'container-fluid',
                template : tmplSightInfo
            });
        },

        createSightMapView : function () {
            this.sightMapView = new SightMapView();
        },

        createSightMosaicView : function () {
            this.sightMosaicView = new SightMosaicView();
        },

        createSightGalleryView : function () {
            this.sightGalleryView = new SightGalleryView();
        },

        createSightListView : function () {
            this.listView = new SightListView({
                template : tmplSightsList,
                listItemTemplate : tmplSightLink
            }).render();
        },

        appendSightListView : function () {
            console.log($('#sidebar')[0]);
            $('#sidebar').empty().append(this.listView.el);
        },

        appendSecondaryNavView : function () {
            $('#secondary-nav').empty().append(this.sightNav.el);
        },

        onOpenSight : function (id) {
            // TODO make this open the map
            this.onOpenSightInfo(id);        
        },

        onOpenSightInfo : function (id) {
            this.sightSubpage = 'info/';
            this.openSightView(id, this.sightInfoView);
        },

        onOpenSightMap : function (id) {
            this.sightSubpage = 'map/';
            this.openSightView(id, this.sightMapView);
        },

        onOpenSightGallery : function (id) {
            this.sightSubpage = 'gallery/';
            this.openSightView(id, this.sightGalleryView);
        },

        onOpenSightMosaic : function (id) {
            this.sightSubpage = 'mosaic/';
            this.openSightView(id, this.sightMosaicView);
        },

        onShowSightMap : function () {
            this.sightSubpage = '';
            this.openSightView(null, this.sightInfoView);
        },

        openSightView : function (sightId, view) {
            this.setLayout('sight');

            this.setSelectedSight(sightId);
            this.listView
                .setSubPage(this.sightSubpage)
                .setSight(this.selectedSight && this.selectedSight.get('speakingId'));

            if (this.selectedSight) {
                view.setModel(this.selectedSight);
            }
            this.setMainView(view);
            this.sightNav.openPage(this.sightSubpage);
        },

        initSightLayout : function () {
            this.appendSightListView();
            this.appendSecondaryNavView();
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
            
            this.sightNav.setModel(this.selectedSight);
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

