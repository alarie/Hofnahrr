/*global define*/
define([
    'jquery.tagsinput', 
    'underscore', 
    'backbone', 
    'templater',
    'lang',
    'data-retriever',
    'user-access-handler',

    'sight-controller',

    'views/template',
    'views/templated-bridge',
    'views/login',

    'models/user',

    'router/hofnahrr',

    'text!tmpl/navigation.tmpl',
], function (
    $, _, Backbone, Templater, lang, DataRetriever, UserAccessHandler,

    SightController,

    TemplateView, TemplatedBridgeView, LoginView,

    UserModel,

    HofnahrrRouter,
    
    navigationTmpl
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
                  'onUserLoggedIn',
                  'onUserNotLoggedIn',
                  'onLogout', 
                  'onLogin', 
                  'onSignup');

        SightController.installTo(this);

        this._started = false;

        this.createUser();

        this.createLoginView();

        // create the HofnahrrRouter instance
        this.createRouter();
        this.addEventListeners();
        // -- TODO: Put this in a SightAppController mixin
            
        // --

        this.currentUser.isLoggedIn(this.onUserLoggedIn, 
                                    this.onUserNotLoggedIn);
        
        Backbone.history.start();
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
        },

        addEventListeners : function () {
            // routing events 
            // CALL Backbone.history.start() ONLY AFTER THIS SETUP
            this.router.on('route:open-sight', this.onOpenSight);
            this.router.on('route:edit-sight', this.onEditSight);
            this.router.on('route:create-new-sight', this.onCreateNewSight);
            this.router.on('route:show-sight-map', this.onShowSightMap);
            
            this.router.on('route:login', this.loginView.onShowLogin);
            this.router.on('route:logout', this.onLogout);
        },

        createNav : function () {
            $('#main-nav #user')
                .before((Templater.compile(navigationTmpl))());
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
        }
    };

    _.extend(AppController, Backbone.Events);

    return AppController;
});
