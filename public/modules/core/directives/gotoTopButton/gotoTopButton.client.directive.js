'use strict';
angular.module('core').directive('wgGotoTopButton', [
    function() {
        return {
            templateUrl: 'modules/core/directives/gotoTopButton/gotoTopButton.html',
            restrict: 'E',
            scope: {},
            bindToController: {
                active: '='
            },
            controller: 'GotoTopButtonController',
            controllerAs: 'vm',
            link: function(ctrl)
            {
                ctrl.vm.onLink();
            }
        };
    }
]);