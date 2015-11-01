'use strict';

//Classifieds service used for communicating with the classifieds REST endpoints
angular.module('cities').factory('Cities', ['$resource',
	function($resource) {

        var lMethods = {};

        lMethods.getMostRecentfromCity = function(slugName)
        {
            var lLimit = 15;

            return $resource('/api/v1/classifieds?list=cityMostRecent&slugName=:slugName', {
                slugName : slugName
            }, {
                update: {
                    method: 'GET'
                }
            });

        };
        lMethods.getClassifiedsFromCity = function(slugName,filters)
        {
            return $resource('/api/v1/classifieds?list=fromCity&slugName=:slugName', {
                slugName : slugName
            }, {
                update: {
                    method: 'GET'
                }
            });

        };
        lMethods.getClassifiedsFromMapBounds = function(mapBounds,filters)
        {
            return $resource('/api/v1/classifieds?list=fromMapBounds&mapBounds=:bounds', {
                bounds : mapBounds
            }, {
                update: {
                    method: 'GET'
                }
            });

        };
        lMethods.getClassifiedFromReference = function()
        {
            return $resource('/api/v1/classifieds/:reference', {
                articleId: '@reference'
            }, {
                update: {
                    method: 'GET'
                }
            });
        };
        lMethods.getClassifiedsFromLastSearch = function()
        {
            return $resource('/api/v1/classifieds?list=lastSearch', {
            }, {
                update: {
                    method: 'GET'
                }
            });
        };

		return lMethods;
	}
]);