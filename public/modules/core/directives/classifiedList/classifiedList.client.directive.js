'use strict';
angular.module('core').directive('wgClassifiedList', [
    function() {
        return {
            templateUrl: 'modules/core/directives/classifiedList/classifiedList.html',
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {},
            bindToController: {
                classifieds: '='
            },
            controller: 'ClassifiedListController',
            controllerAs: 'vm'
        };
    }
]);