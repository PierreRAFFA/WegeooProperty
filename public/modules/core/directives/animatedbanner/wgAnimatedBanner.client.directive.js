'use strict';

angular.module('core').directive('wgAnimatedBanner', [
	function() {
		return {
            //templateUrl:'/templates/animated-banner.server.view.html',
            template:
                '<div class="col-xs-12 col-sm-12 col-md-12 nopadding">'+
                    '<div class="bannerTitle">' +
                    '<span class="part1">' + window.translations.wegeooLastClassifiedsIn + '</span>&nbsp;<span class="part2">{{cityName}}</span>' +
                '</div>' +
                '<div class="bannerContainer"></div>' +
                '</div>',
			restrict: 'E',
            replace: true,
            transclude: true,
            scope:{
                'slugName': '@'
            },
            controller: 'AnimatedBannerController',
			link: function postLink(scope, element, attrs , AnimatedBannerController) {

                console.log('banner link Function');
				// instanciate the jquery banner
                angular.element(element[0]).banner();

                //set default text (part1)
                //angular.element(element[0]).find('.bannerTitle .part1').text(window.translations.wegeooLastClassifiedsIn);

                AnimatedBannerController.updateBanner(attrs.slugName);
			}
		};
	}
]);