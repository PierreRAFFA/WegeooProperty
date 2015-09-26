'use strict';

(function(angular) {

    var $ = window.$;
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  CONSTRUCTOR
    function MainController($scope, Classifieds, WegeooService) {
        this.wegeooService = WegeooService;
        this.Classifieds = Classifieds;
        this.$scope = $scope;

        this.mapVisible = true;

        var self = this;
        this.$scope.$on('mapEventVisible' , function(event, data)
        {
            self.mapVisible = data;

            //force to refresh
            self.$scope.$apply();
        });



    }

    MainController.prototype.getMapVisible = function()
    {
        return this.mapVisible;
    };

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
    MainController.$inject = ['$scope', 'Classifieds', 'WegeooService'];
    angular.module('core').controller('MainController', MainController);

})(angular);