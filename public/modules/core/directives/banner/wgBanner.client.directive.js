'use strict';

angular.module('core').directive('wgBanner', [
	function() {
		return {
            //templateUrl:'/templates/animated-banner.server.view.html',
            templateUrl: 'modules/core/directives/banner/wgBanner.html',
			restrict: 'E',
            replace: true,
            transclude: true,
            scope: {},
            bindToController:{
                'options': '=',
                'provider': '=',
                'title': '='
            },
            controller: 'BannerController',
            controllerAs: 'vm',
			link: function postLink(scope, element, attrs , BannerController) {

                console.log('banner link Function');
				// instanciate the jquery banner
                //angular.element(element[0]).banner();


                //set default text (part1)
                //angular.element(element[0]).find('.bannerTitle .part1').text(window.translations.wegeooLastClassifiedsIn);



			}
		};
	}
]);