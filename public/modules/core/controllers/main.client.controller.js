'use strict';

(function(angular) {
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  CONSTRUCTOR
    function MainController($scope, Classifieds, WegeooService) {
        this.wegeooService = WegeooService;
        this.Classifieds = Classifieds;
        this.$scope = $scope;

        this.mapVisible = true;
    }


    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
    MainController.$inject = ['$scope', 'Classifieds', 'WegeooService'];
    angular.module('core').controller('MainController', MainController);

})(angular);