/**
 * Created by pierre on 12/09/15.
 */
'use strict';


//Menu service used for managing  menus
angular.module('core').service('WegeooService', ['Classifieds', /*'Cities', */'SearchModel' , '$filter',

    function(Classifieds, SearchModel, $filter) {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var WegeooService = function() {

            /**
             * Classifieds
             */
            this.Classifieds = Classifieds;

            /**
             * Search Model
             */
            this.SearchModel = SearchModel;

            /**
             * Test for check if unique
             * @type {number}
             */
            this.test = Math.random();

            /**
             * Loaded Classifieds
             *
             * @type {Array}
             * @private
             */
            this._loadedClassifieds = [];


            this.bannerImages = [];

        };
        WegeooService.NUM_CLASSIFIEDS_LOADED_IN_A_ROW = 10;


        WegeooService.prototype.setCity = function(city)
        {
            if (city)
            {
                this.SearchModel.city = city;

                this.updateAnimatedBanner(city);
                
                this.updateMap(city);
            }
        };

        WegeooService.prototype.updateMap = function(city)
        {

        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CLASSIFIED LIST
        /**
         * Load all classifieds from the references.
         * New references are set in SearchModel.
         * Client can load the classifieds in infinite scroll from 'getClassifiedsFromLastSearch'
         *
         * @param value
         */
        WegeooService.prototype.updateClassifiedList = function(value) {
            this._loadedClassifieds = [];
            this.loadNextClassifieds();
        };

        WegeooService.prototype.loadNextClassifieds = function()
        {
            this.Classifieds.getClassifiedsFromLastSearch().query(this.onClassifiedsLoadComplete.bind(this));
        };

        WegeooService.prototype.onClassifiedsLoadComplete = function(event)
        {
            this._loadedClassifieds = this._loadedClassifieds.concat(event);
        };
        WegeooService.prototype.getLoadedClassifieds = function()
        {
            return this._loadedClassifieds;
        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  LOAD CLASSIFIEDS FROM SLUGNAME
        WegeooService.prototype.updateAnimatedBanner = function(city)
        {
            var self = this;
            var classifieds = this.Classifieds.getMostRecentfromCity(city.slugName).query(function()
            {
                var images = [];

                console.log('classifieds found:' + classifieds.length);

                for (var iC=0; iC < classifieds.length; iC++)
                {
                    var classified = classifieds[iC];
                    var image = {};
                    image.caption = classified.title.substr(0,30) + '...' + '<br/>' + $filter('formatPrice')(classified.details.price, classified.details.currency);
                    image.href = '/property/sale/city-london/rm-34964157';
                    image.src = classified.medias[0];
                    images.push(image);
                }

                self.bannerTitle = window.translations.wegeooLastClassifiedsIn + ' ' + city.name;
                self.bannerImages = images;

                //angular.element(self.$element[0]).displayImages(lImages,true);
                //angular.element(self.$element[0]).find('.bannerTitle .part2').text(slugName.substr(slugName.indexOf('-') +1));

            });
        };

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  SEARCH TYPE


        return new WegeooService();

    }
]);


