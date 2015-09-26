'use strict';

(function(angular)
{
    var $ = window.$;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  CONSTRUCTOR
    function MapController($scope, Classifieds, WegeooService , $window)
    {
        this.wegeooService      = WegeooService;
        this.Classifieds        = Classifieds;
        this.$scope             = $scope;
        this.$window            = $window;

        this.lastVisibility     = true;

        this.initMap();

        this.addEvents();
    }
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////   EVENT TO BROADCAST
    MapController.prototype.addEvents = function()
    {
        var self = this;
        angular.element(this.$window).on('scroll', function() {

            var mapElement = angular.element('div.angular-google-map');
            var mapPositionBottom = mapElement.offset().top + mapElement.outerHeight();

            var isMapVisible = this.scrollY < mapPositionBottom;
            if (self.lastVisibility !== isMapVisible )
            {
                self.lastVisibility = isMapVisible;
                self.$scope.$emit('mapEventVisible' , isMapVisible);
            }
        });
    };
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////   INIT MAP

    MapController.prototype.initMap = function()
    {
        var self = this;

        //map configuration
        this.$scope.map =
        {
            options: {
                scrollwheel: false
            },
            center: {
                latitude: 51.5,
                longitude: -0.2
            },
            zoom: 12,
            markers: [],
            typeOptions:{
                title: 'Click to display the classified list', //@Todo
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

        this.wegeooService.setMapBounds(mapModel.getBounds().toString());
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
        console.log(this.wegeooService.getSlugName());

        if ( this.wegeooService.getSearchType() === 'bySlugName' )
        {
            this.Classifieds.getClassifiedsFromCity(this.wegeooService.getSlugName()).query(this.onClassifiedsLoadComplete.bind(this));
        }else{
            this.Classifieds.getClassifiedsFromMapBounds(this.wegeooService.getMapBounds()).query(this.onClassifiedsLoadComplete.bind(this));
        }
    };

    MapController.prototype.onClassifiedsLoadComplete = function(event)
    {
        var self = this;

        var lMarkers = [];

        //prepare an array of references to be stored in the searchModel
        var references = [];

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

            references.push(lClassified.reference);
        }

        //add markers
        this.$scope.map.markers = lMarkers;//this.$scope.map.markers.concat(lMarkers);

        //center the map to the city if information is present
        if (event[0].hasOwnProperty('city'))
        {
            var lCity           = event[0].city;

            this.$scope.map.center = {
                latitude: lCity.latitude,
                longitude: lCity.longitude
            };

            this.wegeooService.setSearchType('byMapBounds');
        }

        this.wegeooService.loadReferences(references);
    };
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  ON MARKER CLICKED
    MapController.prototype.onMarkerClicked = function(marker, eventName, model, args) {
        alert('Model: event:' + eventName + ' ' + JSON.stringify(model));
    };

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
    MapController.$inject = ['$scope', 'Classifieds', 'WegeooService','$window'];
    angular.module('core').controller('MapController', MapController);

})(angular);

