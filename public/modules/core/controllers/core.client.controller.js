'use strict';


angular.module('core')

    .controller('CoreController', ['$scope', '$resource', '$location', '$stateParams', 'Authentication', 'Classifieds', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
	function($scope, $resource, $location, $stateParams, Authentication, Classifieds, uiGmapGoogleMapApi, uiGmapIsReady) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        //$scope.city = {name:'London'};
        //$scope.test = 'ok';
        //$scope.title3 = 'ok';

        $scope.map =
        {
            center: {
                latitude: 51.5,
                longitude: -0.2
            },
            zoom: 15,
            markers: [
                {
                    id: 1,
                    latitude: 51.5,
                    longitude: -0.2,
                    showWindow: false,
                },
                {
                    id: 2,
                    latitude: 51.5,
                    longitude: -0.21,
                    showWindow: false,
                }],
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

        //$scope.name = 'hello';

        //$scope.name = $stateParams.theme;
        //  alert('ok');

        //$location.path( "/property/rent/city-london" );

        $scope.alert = function(){
            $location.state('/property');
        };

        uiGmapIsReady.promise(1).then(function(instances) {
            instances.forEach(function(inst) {
                var map = inst.map;
                var uuid = map.uiGmap_id;
                var mapInstanceNumber = inst.instance; // Starts at 1.
            });
        });

        uiGmapGoogleMapApi.then(function(maps) {

            $scope.googleVersion = maps.version;
            maps.visualRefresh = true;


        });
        //uiGmapGoogleMapApi.then(function(maps) {
        //        $scope.googleVersion = maps.version;
        //        maps.visualRefresh = true;
        //        //$log.info('$scope.map.rectangle.bounds set');
        //        $scope.map.rectangle.bounds = new maps.LatLngBounds(
        //            new maps.LatLng(55,-100),
        //            new maps.LatLng(49,-78)
        //        );
        //        $scope.map.polylines = [
        //            {
        //                id: 1,
        //                path: [
        //                    {
        //                        latitude: 45,
        //                        longitude: -74
        //                    },
        //                    {
        //                        latitude: 30,
        //                        longitude: -89
        //                    },
        //                    {
        //                        latitude: 37,
        //                        longitude: -122
        //                    },
        //                    {
        //                        latitude: 60,
        //                        longitude: -95
        //                    }
        //                ],
        //                stroke: {
        //                    color: '#6060FB',
        //                    weight: 3
        //                },
        //                editable: true,
        //                draggable: true,
        //                geodesic: true,
        //                visible: true,
        //            },
        //            {
        //                id: 2,
        //                path: [
        //                    {
        //                        latitude: 47,
        //                        longitude: -74
        //                    },
        //                    {
        //                        latitude: 32,
        //                        longitude: -89
        //                    },
        //                    {
        //                        latitude: 39,
        //                        longitude: -122
        //                    },
        //                    {
        //                        latitude: 62,
        //                        longitude: -95
        //                    }
        //                ],
        //                stroke: {
        //                    color: '#6060FB',
        //                    weight: 3
        //                },
        //                editable: true,
        //                draggable: true,
        //                geodesic: true,
        //                visible: true
        //            }];
        //});

        //get latest classifieds of the current city
        var cityPostcode = 3;
        var cityName = 3;
        var lClassifieds = Classifieds.getLatestClassifiedsIn(cityPostcode,cityName).query(function()
        {
            $scope.classifieds = lClassifieds;
            $scope.numC = $scope.classifieds.length;
            //alert($scope.numC);
        });


        //$scope.find();

	}
]);
