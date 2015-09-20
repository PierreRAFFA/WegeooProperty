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
                        controller: 'MapController'
                    },
                    'latestClassifieds@': {
                        templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                        controller: ['$scope' , 'WegeooService' , function($scope, WegeooService) {

                            this.WegeooService = WegeooService;
                            WegeooService.setSlugName(window.slugName);
                            console.log(WegeooService.getSlugName());

                        }],
                        controllerAs: 'vm'
                    },
                    'classifiedList@' : {
                        templateUrl: 'modules/core/views/partials/classifiedList.client.view.html',
                    }
                },
                controller: function(){
                    this.sll = 'My Contacts';
                },
                controllerAs: 'contact'
            }).
            state('home.citySearch', {
                url: ':theme/:category/{cityPostcode:[a-zA-Z0-9]*}-{cityName:[-%a-zA-Z0-9]*}',
                views:{
                    //'map@': {
                    //    templateUrl: 'modules/core/views/partials/map.client.view.html',
                    //    controller: 'MapController'
                    //},
                    'latestClassifieds@': {
                        templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                        controller: ['$scope' , 'WegeooService' , function($scope, WegeooService) {

                            this.WegeooService = WegeooService;
                            WegeooService.setSlugName(window.slugName);
                            console.log(WegeooService.getSlugName());

                        }],
                        controllerAs: 'vm'
                    },
                    'classifiedList@' : {
                        templateUrl: 'modules/core/views/partials/classifiedList.client.view.html',
                        controller: 'ClassifiedListController',
                        controllerAs: 'vm'
                    }
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
