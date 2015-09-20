'use strict';

(function(angular)
{
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  CONSTRUCTOR
    function MapController($scope, Classifieds, SearchService)
    {
        this.searchService = SearchService;
        this.Classifieds = Classifieds;
        this.$scope = $scope;

        this.initMap();
    }
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////   INIT MAP
    MapController.prototype.initMap = function()
    {
        var self = this;

        //map configuration
        this.$scope.map =
        {
            center: {
                latitude: 51.5,
                longitude: -0.2
            },
            zoom: 12,
            markers: [],
            typeOptions:{
                title: 'Click to get more details', //@Todo
                gridSize: 60,
                ignoreHidden: true,
                zoomOnClick: false,
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
            },
            events: {
                idle: self.onMapIdle.bind(self)
            },
            markersEvents: {
                click: self.onMarkerClicked.bind(self)
            }

        };
        //uiGmapGoogleMapApi.then(function(maps) {
        //
        //    var lSlugName = window.slugName;
        //    if ( $stateParams.cityPostcode && $stateParams.cityName)
        //        lSlugName = $stateParams.cityPostcode + '-' + $stateParams.cityName;
        //
        //    //load the classifieds in the map
        //    //self.updateClassifieds();
        //});
    };
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  ON MAP DRAG END/ ZOOM END
    MapController.prototype.onMapIdle = function (mapModel, eventName, originalEventArgs) {

        this.searchService.setMapBounds(mapModel.getBounds().toString());
        this.updateClassifieds();

        // mapModel.getBounds().getSouthWest()
        console.dir(this.$scope.map.center.latitude + ' ' + this.$scope.map.center.longitude);
        console.dir(this.$scope.map);
        console.dir(mapModel);
    };
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  UPDATE CLASSIFIEDS
    MapController.prototype.updateClassifieds = function()
    {
        console.log(this.searchService.getSlugName());

        if ( this.searchService.getSearchType() === 'bySlugName' )
        {
            this.Classifieds.getClassifiedsFromCity(this.searchService.getSlugName()).query(this.onClassifiedsLoadComplete.bind(this));
        }else{
            this.Classifieds.getClassifiedsFromMapBounds(this.searchService.getMapBounds()).query(this.onClassifiedsLoadComplete.bind(this));
        }
    };

    MapController.prototype.onClassifiedsLoadComplete = function(event)
    {
        var self = this;

        var lMarkers = [];

        var lClassifieds    = event[0].classifieds;


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
        this.$scope.map.markers = this.$scope.map.markers.concat(lMarkers);

        //center the map to the city if information is present
        if (event[0].hasOwnProperty('city'))
        {
            var lCity           = event[0].city;

            this.$scope.map.center = {
                latitude: lCity.latitude,
                longitude: lCity.longitude
            };

            this.searchService.setSearchType('byMapBounds');
        }
    };
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  ON MARKER CLICKED
    MapController.prototype.onMarkerClicked = function(marker, eventName, model, args) {
        alert('Model: event:' + eventName + ' ' + JSON.stringify(model));
    };

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
    MapController.$inject = ['$scope', 'Classifieds', 'SearchService'];
    angular.module('core').controller('MapController', MapController);

})(angular);

