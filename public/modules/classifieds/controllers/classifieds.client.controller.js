'use strict';

angular.module('classifieds').controller('ClassifiedsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Classifieds',
	function($scope, $stateParams, $location, Authentication, Classifieds) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Classifieds({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('classifieds/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.classifieds) {
					if ($scope.classifieds[i] === article) {
						$scope.classifieds.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('classifieds');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('classifieds/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.classifieds = Classifieds.query();
		};

		$scope.findOne = function() {
			$scope.article = Classifieds.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);