'use strict';

//Classifieds service used for communicating with the classifieds REST endpoints
angular.module('classifieds').factory('Classifieds', ['$resource',
	function($resource) {

        var lMethods = {};

        lMethods.getClassifieds = function()
        {
            return $resource('/api/v1/classifieds', {}, {
                update: {
                    method: 'GET'
                }
            });
        };
        lMethods.getLatestClassifiedsIn = function(slugName)
        {
            var lLimit = 15;

            return $resource('/api/v1/classifieds?list=getLatestIn&slugName=:slugName', {
                slugName : slugName
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