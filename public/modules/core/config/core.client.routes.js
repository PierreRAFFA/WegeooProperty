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
                templateUrl: 'modules/core/views/city.client.view.html',
                controller: function($scope)
                {
                    //alert('ok1');
                }
            }).
            state('home.city', {
                url: ':theme/:category/:cityPostcode-:cityName',
                templateUrl: 'modules/core/views/city.client.view.html',
                controller: function($scope, $stateParams) {
                    //$scope.name = 'bla';
                    //alert('ok2');
                }
            });

        //$stateProvider.html5Mode(true);
	}
]);