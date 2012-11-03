/*global define */
define(['underscore', 'backbone'], function (_, Backbone) { 
    /** @ignore */
    var BridgeView = Backbone.View.extend(
        /** @lends BridgeView# */
        {
        /**
         * @class Baseclass for classes that exchange the models they are
         * attached to. Thus these classes act as bridges for the exchanged
         * models.
         * @extends Backbone.View
         * @exports BridgeView
         * @constructs
         * @description Creates a new ExchangeableModelView instance.
         * In case the options object contains a template attribute that
         * template will be used for rendering.
         * @param {Object} options The options object, that can specify further
         * data for this view.
         */
        initialize : function (options) {
            _.bindAll(this,
                      'setModel',
                      'getModel',
                      'tellSave',
                      'render',
                      'delegateEvents');
            
            this.el = $(this.el);
            
            if (this.options.template) {
                this._template = this.options.template;
            }
        },
		
        /**
         * Set the model that should be attached to this view.
         */
        setModel : function (model) {
            if (this.model !== model) {
                this.model = model;
                return this.render();
            }
        },
		
        /**
         * Get the model that is currently attached to this view.
         */
		getModel : function (model) {
            return this.model;
        },
        
        /**
         * Tell the model bridged by this view, to save itself.
         */
		tellSave : function () {
			if (this.model && this.model.collection) {
				this.model.save(null, {silent : true});
			}
		},

        tellDestroy : function () {
            if (this.model) {
                this.model.destroy();
            }
        }
    });
    

    return BridgeView;
});
