'use strict';

angular.module('core').controller('ClassifiedListController', [ '$scope', 'WegeooService', 'I18n', '$sce', '$compile',

    function( $scope, WegeooService, I18n, $sce, $compile) {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var ClassifiedListController = function() {
            this.$scope = $scope;
            this.wegeooService = WegeooService;
            this.I18n = I18n;
            this.$sce = $sce;
            this.$compile = $compile;

            this.classifieds = [];

        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  ON SCROLL
        ClassifiedListController.prototype.loadMore = function(contentHTML)
        {
            this.$scope.$emit('classifiedListLoadMore');
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

