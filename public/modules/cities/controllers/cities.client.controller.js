'use strict';

angular.module('cities').controller('CitiesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Cities',
	function($scope, $stateParams, $location, Authentication, Cities) {

		$scope.find = function() {
			$scope.cities = Cities.query();
		};

		$scope.findOne = function() {
			$scope.article = Cities.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);