/**
 * Created by pierre on 12/09/15.
 */
'use strict';

//Menu service used for managing  menus
angular.module('core').service('SearchService', [

    function() {

        var SearchService = function() {
            // Define a set of default roles
            this.defaultRoles = ['*'];

            this.test = Math.random();

            this.searchType = SearchService.SEARCH_BY_SLUGNAME;

            // Define the menus object
            this.slugName = 'toto';

            // Define the menus object
            this.mapBounds = [];
        };

        SearchService.SEARCH_BY_SLUGNAME    = 'bySlugName';
        SearchService.SEARCH_BY_MAPBOUNDS   = 'byMapBounds';

        SearchService.prototype.setSearchType = function(value) {
            this.searchType = value;
        };

        SearchService.prototype.getSearchType = function() {
            return this.searchType;
        };

        SearchService.prototype.setMapBounds = function(value) {
            this.mapBounds = value.replace(/ /g, '');
        };

        SearchService.prototype.getMapBounds = function() {
            return this.mapBounds;
        };

        SearchService.prototype.setSlugName = function(value) {
            this.slugName = value;
        };

        SearchService.prototype.getSlugName = function() {
            return this.slugName;
        };


        return new SearchService();

    }
]);


