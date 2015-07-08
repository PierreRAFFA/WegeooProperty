'use strict';

angular.module('core').directive('wgmap', [
	function() {
		return {
			template: '<div>hey</div>',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// Wg map directive logic
				// ...

				//element.text('this is the wgmap directive');
			}
		};
	}
]);