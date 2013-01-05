/*global define*/
define([
    'jquery.tagsinput', 
    'underscore', 
    'backbone', 
    'templater',
    'lang',
    'data-retriever',
    'user-access-handler',

    'settings',

    'sight-controller',
    'game-controller',
    'team-controller',

    'views/template',
    'views/templated-bridge',
    'views/login',
    'views/user-form',
    'views/modal',

    'models/user',

    'router/hofnahrr',

    'text!tmpl/navigation.tmpl',
    'text!tmpl/modal.tmpl'
], function (
    $, _, Backbone, Templater, lang, DataRetriever, UserAccessHandler,

    settings, 

    SightController,
    GameController,
    TeamController,

    TemplateView, TemplatedBridgeView, LoginView, UserFormView, ModalView,

    UserModel,

    HofnahrrRouter,
    
    navigationTmpl,
    tmplModal
) {
    /* use strict */



    /* 
    * To make all browsers that support WebIntents work simultanously, map the
    * make the API consistent
    */
    window.Intent = window.Intent || window.WebKitIntent;
    window.navigator.startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
    window.intent = window.intent || window.webkitIntent;
    
    /**
     * @class
     * @static
     * Singleton AppController. Provides all functinality for syncing data and
     * initializing global views and layouts. 
     * Controllers for different parts of tha app (e.g. the GameController or
     * the SightController) are being mixed into this controller (thus they are
     * using the same this-reference!). 
     */
    var AppController;

    AppController = function () {
        // set the defaul language for everything that is rendered, before the
        // actual is identified
        // TODO: check browser language and use that instead
        Templater.setLanguage(lang.de);

        // bind the this pointer in all of the following functions to the
        // current AppController instance
        _.bindAll(this, 
                  'start',
                  'onUserLoggedIn',
                  'onUserNotLoggedIn',
                  'onLogout', 
                  'onLogin', 
                  'onSignup', 
                  'onToggleSidebar',
                  'onOpenProfile', 
                  'onUpdateUser', 
                  'onDeleteUser');

        // contains the various layouts for various controllers
        this.layouts = {};

        this._started = false;

        this.createUser();
        
        // Register a global controller event handler, that listens on
        // 'login-required' events.
        this.on('login-required', function () {
            alert('Please login');
        });
        
        $('body').on('click', '.toggle-sidebar', this.onToggleSidebar);

        // Register handlers for once the user has been logged in (or not)
        this.currentUser.isLoggedIn(this.onUserLoggedIn, 
                                    this.onUserNotLoggedIn);
    };

    AppController.prototype = {
        /**
         * Set the layout for the current page. If the desired layout is the
         * same as the current one, no changes will be made. Otherwise name
         * will be looked up in the layouts-hash and made the current layout.
         * Once the layout has been set, the event layout-set:<name> will be
         * triggered.
         * @param {String} name Name of the layout to be used.
         */
        setLayout : function (name) {
            if (this.currentLayout !== name) {
                $('body').removeClass('lilac green orange');
                $('#main-content')
                    .html(Templater.compile(this.layouts[name]));
                this.currentLayout = name;
                this.trigger('layout-set:' + name);
            }
        },

        /**
         * Toggles the sidebar if it exists.
         */
        onToggleSidebar : function () {
            $('body').toggleClass('sidebar-visible');
        },

        /**
         * Appends the secondary nav view to the page.
         */
        appendSecondaryNavView : function (view) {
            $('#secondary-nav').empty().append(view.el);
        },

        /**
         * Creates the currentUser model.
         */
        createUser : function () {
            // create a new UserModel
            this.currentUser = new UserModel({}, {
                url : settings.API.USERS
            });
        },

        /**
         * Creates the app router.
         */
        createRouter : function () {
            this.router = new HofnahrrRouter();
        },

        createLoginView : function () {
            this.loginView = new LoginView({
                tagName : 'li',
                id : 'user',
                model : this.currentUser
            });

            // In case the currentUser-model changes, reflect those changes
            // onto the view.
            this.currentUser.on('change', this.loginView.render);

            // Bind actions in the login view to this controller.
            this.loginView.on('login-user', this.onLogin);
            this.loginView.on('signup-user', this.onSignup);
            this.loginView.on('logout-user', this.onLogout);

            // Add the view to the DOM.
            $('#main-nav').append(this.loginView.render().el);
        },

        createUserFormView : function () {
            this.userFormView = new UserFormView();
            // sight form events
            this.userFormView.on('update-user', this.onUpdateUser);
            this.userFormView.on('delete-user', this.onDeleteUser);
        },

        /**
         * Sets the users language and installs the additional
         * controllers.
         * TODO installing those countrollers could be made on demand.
         */
        onUserLoggedIn : function () {
            this.setUserLanguage();

            if (!this._started) {
                this._started = true;
            }

            SightController.installTo(this);
            GameController.installTo(this);
            TeamController.installTo(this);

        },

        /**
         * Sets the language in the templater based on the currentUsers
         * settings
         */
        setUserLanguage : function () {
            var l = null;
            if (this.currentUser && 
                (l = this.currentUser.get('language')) &&
                l in lang) {
                Templater.setLanguage(lang[l]);
            }
        },

        /**
         * In case the user is not logged in.
         * TODO Check if some special treatment i necessary. Currently it 
         * looks good without.
         */
        onUserNotLoggedIn : function () {
            this.onUserLoggedIn();
        },

        /**
         * Starts the app. First all template helpers will be initialized, then 
         * the views will be created. Then creates and starts the router.
         * Triggers the 'app-started' event.
         */
        start : function () {
            this.initTemplateHelpers();
            this.createViews();

            this.trigger('app-started');

            this.createRouter();
            this.addEventListeners();
            Backbone.history.start();
        },

        /** 
         * Register some template helpers, that can be used within templates.
         */ 
        initTemplateHelpers : function () {
            var that = this;

            // Allows access to the settings hash
            Templater.registerHelper('settings', function (property) {
                return settings[property];
            });

            // Access the list of sights.
            Templater.registerHelper('sightsList', function (options) {
                var html = '';
                that.sightCollection.each(function (item) {
                    html += options.fn(item.attributes);
                }); 
                return html;
            });

            // Check whether location is set
            Templater.registerHelper('hasLocation', function () {
                return this.location && this.location.latitude && this.location.longitude;
            });

            Templater.registerHelper('getSightMainPicture', function () {
                return (this.pictures && this.pictures.length) ? 
                    'url(pictures/' + this.pictures[0].origUrl + ')' : 
                    'none';
            });

            Templater.registerHelper('getRandomPictureThumb', function () {
                return (this.pictures && this.pictures.length) ?
                    this.pictures[0].thumb : 'none';
            });

            Templater.registerHelper('carousel', function (all, active, options) {
                var i = 0, html = '';
                _.each(all, function (itm) {
                    if (i === active) {
                        itm.active = "active";
                    }
                    html += options.fn(itm);
                    i += 1;
                });
                return html;
            });


            Templater.registerHelper('array2String', function (items) {
                return (items || []).join(', ');
            });

            // Helper for image intents. Shows button only if intents exixt in
            // current browser.
            Templater.registerHelper('imageEditIntent', function (opts) {
                return (window.Intent || window.intent) ? 
                    '<button class="btn edit-image">' + Templater.i18n('app_edit') + '</button>' : 
                    '';
            });

            Templater.registerHelper('isChecked', function (value) {
                return value ? 'checked="checked"' : '';
            });

            Templater.registerHelper('userIsLoggedIn', function () {
                return UserAccessHandler.isRegisteredUser(that.currentUser);
            });

            Templater.registerHelper('isAdmin', function (obj, opts) {
                var html = '';
                if (UserAccessHandler.isAdmin(that.currentUser)) {
                    html += opts.fn(obj);
                }
                return html;
            });

            Templater.registerHelper('userMay', function (doWhat, opts) {
                var html = '';
                if (UserAccessHandler.may(doWhat, that.currentUser)) {
                    html = opts.fn(this);
                }
                else {
                    html = opts.inverse(this);
                }
                return html;
            });

            Templater.registerHelper('languageSelect', function (opts) {
                var html = '', 
                    selectedLanguage = that.currentUser.get('language');

                _.each(lang, function (l, key) {
                    var data = {
                        selected : key === selectedLanguage ? 'selected="selected"' : '',
                        value : key,
                        name : l.lang_name
                    };
                    html += opts.fn(data);
                });

                return html;
            });

            console.log('helpers created');
        },

        createViews : function () {
            this.createNav();
            this.createLoginView();
        },

        onUpdateUser : function (data) {
            this.currentUser.save(data);
        },

        onDeleteUser : function () {
            console.log("detele");
        },

        /**
         * Register all navigation events on the router. Map the events to
         * ebent handlers withon this controller.
         */
        addEventListeners : function () {
            // routing events 
            // CALL Backbone.history.start() ONLY AFTER THIS SETUP
            this.router.on('route:show-sight-map', this.onShowSightMap);
            this.router.on('route:open-sight', this.onOpenSight);
            this.router.on('route:open-sight-info', this.onOpenSightInfo);
            this.router.on('route:open-sight-map', this.onOpenSightMap);
            this.router.on('route:open-sight-gallery', this.onOpenSightGallery);
            this.router.on('route:open-sight-mosaic', this.onOpenSightMosaic);
            this.router.on('route:open-sight-map', this.onOpenSightMap);
            this.router.on('route:edit-sight', this.onEditSight);
            this.router.on('route:create-new-sight', this.onCreateNewSight);
            this.router.on('route:search', this.onSearch);
            this.router.on('route:profile', this.onOpenProfile);
            this.router.on('route:team', this.onOpenTeam);


            this.router.on('route:game', this.onOpenGame);
            this.router.on('route:game-play', this.onOpenGamePlay);
            
            this.router.on('route:login', this.loginView.onShowLogin);
            this.router.on('route:logout', this.onLogout);
        },



        createNav : function () {
            $('#main-nav')
                .append((Templater.compile(navigationTmpl))());
        },

        /**
         * In case the userModal does not exist yet, create it on the fly. It
         * will be saved then for later uses, so it won't have to be created
         * again. 
         * It is accessible through this#userModal.
         * Sets the current user as the model for the modal and displays it.
         */
        onOpenProfile : function () {
            var that = this,
                userModal;

            if (!this.userModal) {
                userModal = new ModalView({
                    el : 'body',
                    template : tmplModal,
                    modalOptions : {
                        show : false,
                        backdrop : true
                    },
                    modalData : {
                        modalClassName : 'green',
                        modalId : 'user-modal',
                        modalHeadline : Templater.i18n('user_profile'),
                        modalClose : Templater.i18n('modal_close')
                    }
                });

                this.userModal = userModal;
                // create the userFormView for editing user data.
                this.createUserFormView();

                userModal
                    .render()
                    // set the content of the modal to the userForm view.
                    .setContentViews([{
                        view : this.userFormView
                    }]);


                userModal.modal.on('hide', function () {
                    that.router.navigate('sight/');
                });
            }

            this.userModal.setModel(this.currentUser);
            this.userModal.modal.show();
        },

        // from now on: stuff that happens on demand 

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


        /**
         * Sets the page's main view. This is the largest content container on
         * the screen. Detaches old views first, so their event handlers won't 
         * be destroyd.
         * @param {Backbone.View} view The view that should be rendered into
         * the main container (#page-container).
         */
        setMainView : function (view) {
            if (this.mainView) {
                this.mainView.$el.detach();
            }
            this.mainView = view;
            $('#page-content').append(this.mainView.el);
        },

        visitSightCollection : function (visitor) {
            return visitor(this.sightCollection);
        }
    };

    _.extend(AppController.prototype, Backbone.Events);

    return AppController;
});
