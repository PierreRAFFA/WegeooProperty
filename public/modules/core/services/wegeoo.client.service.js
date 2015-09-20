/**
 * Created by pierre on 12/09/15.
 */
'use strict';


//Menu service used for managing  menus
angular.module('core').service('WegeooService', ['SearchModel', 'Classifieds',

    function(SearchModel,Classifieds) {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var WegeooService = function() {

            /**
             * Test for check if unique
             * @type {number}
             */
            this.test = Math.random();

            this._searchModel = new SearchModel();

            this.Classifieds = Classifieds;
        };
        WegeooService.NUM_CLASSIFIEDS_LOADED_IN_A_ROW = 10;

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  REFERENCES MANAGEMENT
        /**
         * Load all classifieds from the references.
         * New references are set in SearchModel.
         * Client can load the classifieds in infinite scroll from 'getClassifiedsFromLastSearch'
         *
         * @param value
         */
        WegeooService.prototype.loadReferences = function(value) {
            this._searchModel.references = value;
            this._searchModel.loadedClassifieds = [];
            this.loadNextClassifieds();
        };

        WegeooService.prototype.loadNextClassifieds = function()
        {
            this.Classifieds.getClassifiedsFromLastSearch().query(this.onClassifiedsLoadComplete.bind(this));
        };

        WegeooService.prototype.onClassifiedsLoadComplete = function(event)
        {
            this._searchModel.loadedClassifieds = this._searchModel.loadedClassifieds.concat(event);
        };
        WegeooService.prototype.getLoadedClassifieds = function()
        {
            return this._searchModel.loadedClassifieds;
        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  SEARCH TYPE
        WegeooService.prototype.setSearchType = function(value) {
            this._searchModel.searchType = value;
        };
        WegeooService.prototype.getSearchType = function() {
            return this._searchModel.searchType;
        };

        WegeooService.prototype.setMapBounds = function(value) {
            this._searchModel.mapBounds = value.replace(/ /g, '');
        };
        WegeooService.prototype.getMapBounds = function() {
            return this._searchModel.mapBounds;
        };

        WegeooService.prototype.setSlugName = function(value) {
            this._searchModel.slugName = value;
        };
        WegeooService.prototype.getSlugName = function() {
            return this._searchModel.slugName;
        };


        return new WegeooService();

    }
]);


