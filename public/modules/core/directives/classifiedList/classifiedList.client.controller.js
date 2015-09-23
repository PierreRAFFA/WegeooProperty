'use strict';

angular.module('core').controller('ClassifiedListController', [ 'WegeooService', 'Classifieds', 'I18n',

    function( WegeooService, Classifieds, I18n) {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var ClassifiedListController = function() {
            // Define a set of default roles
            this.wegeooService = WegeooService;
            this.Classifieds = Classifieds;
            this.I18n = I18n;

            //this.loadClassifieds();
        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  LOAD CLASSIFIEDS
        ClassifiedListController.prototype.loadClassifieds = function()
        {
            //Classifieds.getClassifiedsFromLastSearch().query(this.onClassifiedsLoadComplete.bind(this));

        };



        return new ClassifiedListController();

    }
]);


// To keep to check the difference of performance with this method.
//
//(function(angular)
//{
//    ///////////////////////////////////////////////////////////////////////////
//    ///////////////////////////////////////////////////////////  CONSTRUCTOR
//    function ClassifiedListController($scope, Classifieds, WegeooService)
//    {
//        this.wegeooService = WegeooService;
//        this.Classifieds = Classifieds;
//        this.$scope = $scope;
//
//    }
//    ///////////////////////////////////////////////////////////////////////////
//    ///////////////////////////////////////////////////////////   INIT MAP
//
//    ///////////////////////////////////////////////////////////////////////////
//    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
//    ClassifiedListController.$inject = ['$scope', 'Classifieds', 'WegeooService'];
//    angular.module('core').controller('ClassifiedListController', ClassifiedListController);
//
//})(angular);

