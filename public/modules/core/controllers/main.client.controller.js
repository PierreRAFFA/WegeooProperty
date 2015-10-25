'use strict';

(function(angular) {

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  CONSTRUCTOR
    function MainController($scope, Classifieds, SearchModel, WegeooService, I18n)
    {
        console.log('MAIN CONTROLLER');

        /**
         * Scope
         */
        this.$scope = $scope;

        /**
         * Service to access to Wegeoo db
         */
        this.WegeooService = WegeooService;

        /**
         *
         */
        this.Classifieds = Classifieds;

        /**
         *
         */
        this.I18n = I18n;

        /**
         * Specifies whether or not the map is currently displayed on the screen ( position y )
         * @type {boolean}
         */
        this.mapVisible = true;

        /**
         * Stores all informations about the user search
         * @type {SearchModel}
         * @private
         */
        this.SearchModel = SearchModel;

        console.log('this.SearchModel.id:'+this.SearchModel.id);
        /**
         * Used in the animated banner
         * @type {Array}
         */
        this.bannerImages = [];

        this.bindEvents();

        this.SearchModel.city = window.city;
        this.SearchModel.slugName = window.city.slugName;

        this.WegeooService.setCity(window.city);
    }

    MainController.prototype.bindEvents = function()
    {
        var self = this;

        this.$scope.$on('mapEventVisible' , function(event, data)
        {
            self.mapVisible = data;

            //force to refresh
            self.$scope.$apply();
        });

        this.$scope.$on('classifiedListLoadMore' , function(event)
        {
            self.WegeooService.loadNextClassifieds();

            //force to refresh
            //self.$scope.$apply();
        });
    };
    MainController.prototype.getMapVisible = function()
    {
        return this.mapVisible;
    };
    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// LOAD CLASSIFIEDS FROM SLUGNAME
    MainController.prototype.loadImagesForAnimatedBanner = function(slugName)
    {
        var self = this;
        this.WegeooService.loadImagesForAnimatedBanner(slugName, function(images)
        {
            self.bannerTitle = window.translations.wegeooLastClassifiedsIn + ' ' + self.SearchModel.city.name;
            self.bannerImages = images;

            //setTimeout(function(){
            //    self.bannerTitle = 'ok';
            //
            //    self.$scope.$digest();
            //}, 2000);

        });
    };

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// 
    MainController.prototype.setSearchType = function(value) {
        this.SearchModel.searchType = value;
    };
    MainController.prototype.getSearchType = function() {
        return this.SearchModel.searchType;
    };

    MainController.prototype.setMapBounds = function(value) {
        this.SearchModel.mapBounds = value.replace(/ /g, '');
    };
    MainController.prototype.getMapBounds = function() {
        return this.SearchModel.mapBounds;
    };

    MainController.prototype.setSlugName = function(value) {
        this.SearchModel.slugName = value;
    };
    MainController.prototype.getSlugName = function() {
        return this.SearchModel.city.slugName;
    };

    MainController.prototype.setCity = function(value) {
        this.SearchModel.city = value;
    };
    MainController.prototype.getCity = function() {
        return this.SearchModel.city;
    };
    MainController.prototype.getCityName = function()
    {
        return this.SearchModel.city.name;
    };
    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
    MainController.$inject = ['$scope', 'Classifieds', 'SearchModel', 'WegeooService', 'I18n'];
    angular.module('core').controller('MainController', MainController);

})(angular);