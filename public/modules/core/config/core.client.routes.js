'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
            state('home', {
                url: '/',
                views:{
                    'map@': {
                        templateUrl: 'modules/core/views/partials/map.client.view.html',
                        controller: ['$scope' , 'Classifieds', 'uiGmapGoogleMapApi' , function($scope, Classifieds, uiGmapGoogleMapApi) {

                            uiGmapGoogleMapApi.then(function(maps) {

                                //load the classifieds in the map
                                alert('ok');
                                //Classifieds.
                            });
                        }]
                    },
                    'latestClassifieds@': {
                        templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                        controller: function($scope, $stateParams) {

                            //update the slugName watched by the latestClassifieds View
                            $scope.slugName = window.slugName;
                        }
                    }
                }
            }).
            state('citySearch', {
                url: '/:theme/:category/{cityPostcode:[a-zA-Z0-9]*}-{cityName:[-%a-zA-Z0-9]*}',
                views:{
                    'latestClassifieds@': {
                        templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                        controller: function($scope, $stateParams) {

                            //update the slugName watched by the latestClassifieds View
                            $scope.slugName = $stateParams.cityPostcode + '-' + $stateParams.cityName;
                        }
                    },
                    //'classifiedList@': {
                    //    templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                    //    controller: function($scope, $stateParams) {
                    //
                    //        //update the slugName watched by the latestClassfied View
                    //        $scope.slugName = $stateParams.cityPostcode + '-' + $stateParams.cityName;
                    //    }
                    //}
                }

                //onEnter: function()
                //{
                //
                //}
            });
            //.state('advancedSearch' , {
            //    url: '/:theme/:category/{cityPostcode:[a-zA-Z0-9]*}-{cityName:[-%a-zA-Z0-9]*}/search{map:@[-.0-9]*,[-.0-9]*,[0-9]*}/?priceMin&priceMax&numRooms',
            //    //url: '^/search{map:@[-.0-9]*,[-.0-9]*,[0-9]*}/{filters:[;+&=,a-zA-Z0-9]*}',
            //    templateUrl: 'modules/core/views/city2.client.view.html'
            //});

        //$stateProvider.html5Mode(true);
	}
]);