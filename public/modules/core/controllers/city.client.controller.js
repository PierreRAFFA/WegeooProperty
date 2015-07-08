'use strict';

angular.module('core').controller('CityController', ['$scope', '$stateParams',
	function($scope,$stateParams) {

        $scope.name = $stateParams.theme || 'not';
	}
]);