'use strict';

//Classifieds service used for communicating with the classifieds REST endpoints
angular.module('classifieds').factory('Classifieds', ['$resource',
	function($resource) {

        var lMethods = {};

        //lMethods.getClassifieds = function()
        //{
        //    return $resource('/api/v1/classifieds', {}, {
        //        update: {
        //            method: 'GET'
        //        }
        //    });
        //};
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
        lMethods.getClassifiedByReference = function()
        {
            return $resource('/api/v1/classifieds/:reference', {
                articleId: '@reference'
            }, {
                update: {
                    method: 'GET'
                }
            });
        };

		return lMethods;
	}
]);