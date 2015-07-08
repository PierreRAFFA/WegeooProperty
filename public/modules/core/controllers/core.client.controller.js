'use strict';


angular.module('core')

    //.config(['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
    //    GoogleMapApiProviders.configure({
    //        //    key: 'your api key',
    //        v: '3.19.20',
    //        libraries: 'weather,geometry,visualization'
    //    });
    //}])

    .controller('CoreController', ['$scope', '$location', '$stateParams', 'Authentication', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
	function($scope, $location, $stateParams, Authentication, uiGmapGoogleMapApi, uiGmapIsReady) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

        $scope.map = { center: { latitude: 51.5, longitude: -0.2 }, zoom: 12 };
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
	}
]);
