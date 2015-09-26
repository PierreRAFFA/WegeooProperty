'use strict';
angular.module('core').directive('wgClassifiedList', [
    function() {
        return {
            templateUrl: 'themes/' + ApplicationConfiguration.theme + '/directives/classifiedList/classifiedList.html',
            restrict: 'E',
            scope: {},
            bindToController: {
                classifieds: '='
            },
            controller: 'ClassifiedListController',
            controllerAs: 'vm'
        };
    }
]);