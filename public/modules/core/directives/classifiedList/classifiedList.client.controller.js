'use strict';

angular.module('core').controller('ClassifiedListController', [ 'WegeooService', 'I18n', '$sce', '$compile',

    function( WegeooService, I18n, $sce, $compile) {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var ClassifiedListController = function() {
            // Define a set of default roles
            this.wegeooService = WegeooService;
            //this.Classifieds = Classifieds;
            this.I18n = I18n;
            this.$sce = $sce;
            this.$compile = $compile;

            this.classifieds = [];
        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  LOAD CLASSIFIEDS
        ClassifiedListController.prototype.toHTML = function(contentHTML)
        {
            return this.$compile(contentHTML);

            //return angular.element(contentHTML).html();
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

