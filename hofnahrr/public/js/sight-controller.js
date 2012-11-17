/*global define*/
define([
    'underscore', 'backbone', 
    'templater',

    'models/sight',

    'settings',

    'views/sight-nav',
    'views/sight-list',
    'views/template',
    'views/templated-bridge',
    'views/file-drop',
    'views/sight-modal',
    'views/sight-map',
    'views/sight-mosaic',
    'views/sight-gallery',
    'views/sight-form',
    'views/picture-form',

    'text!layout/sight.html',
    'text!tmpl/sight-nav.tmpl',
    'text!tmpl/sight-info.tmpl',
    'text!tmpl/sights-list.tmpl',
    'text!tmpl/sight-link.tmpl',
    'text!tmpl/sight-manager.tmpl',
    'text!tmpl/upload.tmpl',
    'text!tmpl/image.tmpl',
], function (
    _, Backbone, Templater,
    
    SightModel, 

    settings,

    SightNavView,
    SightListView, 
    TemplateView,
    TemplatedBridgeView,
    FileDropView,
    ModalView,
    SightMapView,
    SightMosaicView,
    SightGalleryView,
    SightFormView,
    PictureFormView,

    tmplSightLayout,
    tmplSightNav,
    tmplSightInfo,
    tmplSightsList, tmplSightLink,
    tmplSightModal, 
    tmplUpload, 
    tmplImage
) {
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
                    'initSightLayout',
                    'onAddPicturesToSight', 
                    'onRemovePicturesFromSight', 
                    'onOpenContainer', 
                    'onSearch');


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

        onSearch : function (query) {
            console.log(query);
        },

        createSightViews : function () {
            this.createSightSecondaryNavView();
            this.createSightListView();
            this.createSightInfoView();
            this.createSightMapView();
            this.createSightMosaicView();
            this.createSightGalleryView();
        },

        createSightCollection : function () {
            // create a new Sight Collection
            this.sightCollection = new Backbone.Collection();
            this.sightCollection.model = SightModel;
            this.sightCollection.url = settings.API.SIGHTS;

            // sight collection events
            this.sightCollection.on('add', this.listView.onAdd);
            this.sightCollection.on('reset', this.listView.onAddAll);
        },

        createSightSecondaryNavView : function () {
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
            $('#sidebar').empty().append(this.listView.el);
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
            this.openSightView(id, this.sightMapView, {silent : true});
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

        openSightView : function (sightId, view, options) {
            options || (options = {});

            this.setLayout('sight');

            this.setSelectedSight(sightId);
            this.listView
                .setSubPage(this.sightSubpage)
                .setSight(this.selectedSight && this.selectedSight.get('speakingId'));

            if (this.selectedSight) {
                view.setModel(this.selectedSight);
            }

            if (this.currentView !== view || !options.silent) {
                this.setMainView(view);
            }

            this.currentView = view;

            this.sightNav.openPage(this.sightSubpage);
        },

        initSightLayout : function () {
            this.appendSightListView();
            this.appendSecondaryNavView(this.sightNav);
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
                this.openModal(this.selectedSight);
            }
        },

        onCreateNewSight : function () {
            this.setSelectedSight(null);
            this.openModal(null);
        },

        openModal : function (sight) {
            this.createSightModal();
            this.sightModal.setModel(sight);
            this.sightModal.modal.show();
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


        createSightModal : function () {
            var that = this,
                sightModal;

            if (!this.sightModal) {
                sightModal = new ModalView({
                    el : 'body',
                    template : tmplSightModal,
                    modalOptions : {
                        show : false,
                        backdrop : true
                    },
                    modalData : {
                        modalId : 'sights-modal',
                        modalHeadline : Templater.i18n('sight_manager'),
                        modalClose : Templater.i18n('modal_close'),
                        modalNext : Templater.i18n('sight_add_photos'),
                        modalPrev : Templater.i18n('sights_edit_sight'),
                    }
                });

                this.sightModal = sightModal;
                this.createSightFormView();
                this.createFileDropView();


                sightModal
                    .render()
                    .setContentViews([{
                        view : this.sightFormView,
                        trigger : 'click .show-sight-form',
                        className : 'large'
                    }, {
                        view : this.fileDropView,
                        trigger : 'click .show-file-browser',
                        className : 'wide'
                    }]);

                sightModal.on('add-items-to-container', this.onAddPicturesToSight);
                sightModal.on('remove-item-from-container', this.onRemovePicturesFromSight);
                sightModal.on('open-container', this.onOpenContainer);
                sightModal.modal.on('hide', function () {
                    that.router.navigate('sights');
                });


            }
        },

        createSightFormView : function () {
            // early return if view exists already
            if (this.sightFormView) {
                return;
            }

            this.sightFormView = new SightFormView();
            // sight form events
            this.sightFormView.on('create-sight', this.onCreateSight);
        },

        createFileDropView : function () {
            this.fileDropView = new FileDropView({
                tagName : 'div',
                template : tmplUpload,
                fileTemplate : tmplImage,
                uploadToPath : settings.BASE_URL + settings.API.PICTURES,
                modelFileListProperty : 'pictures'
            });
        },

        onAddPicturesToSight : function (pictures, sightId) {
            var sight = this.sightCollection.get(sightId);
            if (pictures && sight) {
                _.each(pictures, function (pictures) {
                    sight.addImage(pictures);
                });
            }
        },

        onRemovePicturesFromSight : function (pictureId, sightId) {
            var sight = this.sightCollection.get(sightId);
            if (pictureId && sight) {
                sight.removeImage(pictureId, {
                    success : function () {
                        console.log('SUCCESS: TODO'); 
                    }
                });
            }
        },

        onOpenContainer : function (containerId) {
            var sight = this.sightCollection.get(containerId); 
            if (sight) {
                this.sightModal.setModel(sight);
            }
        }

    };

    return {
        installTo : function (target) {
            _.extend(target, SightController);
            SightController.init.apply(target);
        }
    };
});
