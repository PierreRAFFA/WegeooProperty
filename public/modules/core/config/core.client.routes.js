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
                        controller: ['$scope' , 'Search' , function($scope, Search) {

                            Search.setSlugName(window.slugName);

                            this.Search = Search;

                            //update the slugName watched by the latestClassifieds View


                        }],
                        controllerAs: 'vm'
                    },
                    'classifiedList@' : 'ClassifiedListController'
                },
                controller: function(){
                    this.sll = 'My Contacts';
                },
                controllerAs: 'contact'
            }).
            state('home.citySearch', {
                url: ':theme/:category/{cityPostcode:[a-zA-Z0-9]*}-{cityName:[-%a-zA-Z0-9]*}',
                views:{
                    'map@': {
                        templateUrl: 'modules/core/views/partials/map.client.view.html',
                        controller: 'MapController'
                    },
                    'latestClassifieds@': {
                        templateUrl: 'modules/core/views/partials/latestClassifieds.client.view.html',
                        controller: ['$scope','$stateParams' , function($scope,$stateParams) {

                            //update the slugName watched by the latestClassifieds View
                            $scope.slugName = $stateParams.cityPostcode + '-' + $stateParams.cityName;
                        }]
                    },
                    'classifiedList@' : 'ClassifiedListController'
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
])
.controller('MapController' , ['$scope' , '$stateParams' , 'Classifieds', 'uiGmapGoogleMapApi' , function($scope, $stateParams, Classifieds, uiGmapGoogleMapApi) {

        console.log('home map@');

        //map configuration
        $scope.map =
        {
            center: {
                latitude: 51.5,
                longitude: -0.2
            },
            zoom: 12,
            markers: [],
            clusterOptions:{
                title: 'Click to get more details', //@Todo
                gridSize: 60,
                ignoreHidden: true,
                minimumClusterSize: 1,
                enableRetinaIcons: true,
                styles: [{
                    url: 'modules/core/img/multimarker.png',
                    textColor: '#333',
                    textSize: 20,
                    anchorText: [-39,1],
                    width: 54,
                    height: 63,
                    fontFamily: 'FuturaStd-Book',
                    backgroundPosition: '1 -30'
                }]
            }
        };


        uiGmapGoogleMapApi.then(function(maps) {

            var lSlugName = window.slugName;
            if ( $stateParams.cityPostcode && $stateParams.cityName)
                lSlugName = $stateParams.cityPostcode + '-' + $stateParams.cityName;

            //load the classifieds in the map
            var lClassifiedResponse = Classifieds.getClassifiedsFromCity(lSlugName).query(function()
            {
                var lMarkers = [];

                var lClassifieds    = lClassifiedResponse[0].classifieds;
                var lCity           = lClassifiedResponse[0].city;

                for (var iC=0; iC < lClassifieds.length; iC++)
                {
                    var lClassified = lClassifieds[iC];
                    lMarkers.push({
                        id: lClassified.reference,
                        latitude: lClassified.latitude,
                        longitude: lClassified.longitude,
                        showWindow: false
                    });
                }

                //$scope.map = lMapConfiguration;

                //add markers
                $scope.map.markers = lMarkers;

                //center the map to the city if information is present
                if ( lCity )
                {
                    $scope.map.center = {
                        latitude: lCity.latitude,
                        longitude: lCity.longitude
                    };
                }


            });
        });
    }]
)
.controller('ClassifiedListController' , ['$scope' , '$stateParams' , 'Classifieds' , function($scope, $stateParams, Classifieds) {

        //var lClassifiedResponse = Classifieds.getClassifiedsFromCity(lSlugName).query(function()
        //{
        //
        //});
    }]
);
