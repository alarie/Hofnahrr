/*global define*/
define([
    'jquery.tagsinput', 
    'underscore', 
    'backbone', 
    'templater',
    'lang',
    'data-retriever',
    'user-access-handler',

    'views/list',
    'views/template',
    'views/templated-bridge',
    'views/modal',
    'views/file-drop',
    'views/login',

    'models/sight',
    'models/user',

    'router/hofnahrr',

    'text!tmpl/navigation.tmpl',
    'text!tmpl/sight-info.tmpl',
    'text!tmpl/sights-list.tmpl',
    'text!tmpl/sight-link.tmpl',
    'text!tmpl/modal.tmpl',
    'text!tmpl/upload.tmpl',
    'text!tmpl/image.tmpl',
    'text!tmpl/sight-form.tmpl',
    'text!tmpl/picture-form.tmpl',
], function (
    $, _, Backbone, Templater, lang, DataRetriever, UserAccessHandler,

    ListView, TemplateView, TemplatedBridgeView, ModalView, FileDropView, LoginView,

    SightModel, UserModel,

    HofnahrrRouter,
    
    navigationTmpl,
    tmplSightInfo,
    tmplSightsList, tmplSightLink, tmplModal,
    tmplUpload, tmplImage,

    tmplSightForm,
    tmplPictureForm
) {
    /* use strict */
    
    var AppController;

    AppController = function () {
        // set the defaul language for everything that is rendered, before the
        // actual is identified
        // TODO: check browser language and use that instead
        Templater.setLanguage(lang.en);

        // bind the this pointer in all of the following functions to the
        // current AppController instance
        _.bindAll(this, 
                  'start',
                  'onEditSight', 
                  'onOpenSight', 
                  'onCreateSight', 
                  'onCreateNewSight',
                  'onUserLoggedIn',
                  'onUserNotLoggedIn',
                  'onLogout', 
                  'onLogin', 
                  'onSignup');

        this._started = false;

        this.createUser();

        // create the HofnahrrRouter instance
        this.createRouter();

        // -- TODO: Put this in a SightAppController mixin
        // no sight is selected now
        this.selectedSight = null;

        // create a new Sight Collection
        this.collection = new Backbone.Collection({
            model : SightModel,
        });
        this.collection.url = 'sights/';
            
        // --

        this.createLoginView();
        this.currentUser.isLoggedIn(this.onUserLoggedIn, 
                                    this.onUserNotLoggedIn);
    };

    AppController.prototype = {
        createUser : function () {
            // create a new UserModel
            this.currentUser = new UserModel({}, {
                url : 'users'
            });
        },

        createRouter : function () {
            this.router = new HofnahrrRouter();
        },

        createLoginView : function () {
            this.loginView = new LoginView({
                model : this.currentUser
            });
            this.currentUser.on('change', this.loginView.render);
            this.loginView.on('login-user', this.onLogin);
            this.loginView.on('signup-user', this.onSignup);
            this.loginView.on('logout-user', this.onLogout);

            $('#user').append(this.loginView.render().el);
        },

        onUserLoggedIn : function () {
            this.setUserLanguage();

            if (!this._started) {
                this._started = true;
                this.collection.fetch({
                    success : this.start
                });
            }
        },

        setUserLanguage : function () {
            var l = null;
            if (this.currentUser && 
                (l = this.currentUser.get('language')) &&
                l in lang) {
                Templater.setLanguage(lang[l]);
            }
        },

        onUserNotLoggedIn : function () {
            this.onUserLoggedIn();
        },

        start : function () {
            this.initTemplateHelpers();
            this.createViews();
            this.addEventListeners();

            // let all lsiteners know that collection has been updated
            this.collection.trigger('reset', this.collection);

            Backbone.history.start();
        },

        initTemplateHelpers : function () {
            var that = this;
            Templater.registerHelper('sightsOptions', function (current, options) {
                var html = '<option value="-1">' + Templater.i18n('sight_dont_know') + '</opion>';
                that.collection.each(function (item) {
                    var selected = current === item.id ? 'selected="selected"' : '';
                    html += options.fn(_.extend({selected : selected}, item.attributes));
                }); 
                return html;
            });
            Templater.registerHelper('hasLocation', function () {
                return this.location.latitude && this.location.longitude;
            });
        },

        createViews : function () {
            this.createNav();
            this.createSightInfoView();
            this.createListView();
        },

        addEventListeners : function () {

            // sight collection events
            this.collection.on('add', this.listView.onAdd);
            this.collection.on('reset', this.listView.onAddAll);

            // routing events 
            // CALL Backbone.history.start() ONLY AFTER THIS SETUP
            this.router.on('route:open-sight', this.onOpenSight);
            this.router.on('route:edit-sight', this.onEditSight);
            this.router.on('route:create-new-sight', this.onCreateNewSight);
            this.router.on('route:login', this.loginView.onShowLogin);
            this.router.on('route:logout', this.onLogout);

        },

        createNav : function () {
            $('#main-nav #user')
                .before((Templater.compile(navigationTmpl))());
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


        // from now on: stuff that happens on demand 

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

        onLogin : function (data) {
            this.currentUser.login(data, {
                success : this.onUserLoggedIn
            });
        },

        onLogout : function () {
            this.currentUser.logout({
                success : function () {
                    window.location.reload();
                }
            });
        },

        onSignup : function (data) {
            this.currentUser.signup(data);
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
                this.selectedSight = this.collection.find(function (model) {
                    return id === model.get('speakingId');
                });
            }
            else {
                this.selectedSight = null;
            }
        },

        onOpenSight : function (id) {
            this.setSelectedSight(id);
            if (this.selectedSight) {
                this.sightInfoView.setModel(this.selectedSight);
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
                this.collection.create(data, {
                    success : function () {
                        that.sightFormView.setModel(null);
                    }
                });
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

    };

    _.extend(AppController, Backbone.Events);

    return AppController;
    
});
