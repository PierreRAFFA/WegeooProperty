'use strict';

angular.module('core').directive('wgAnimatedBanner', [
	function() {
		return {
            //templateUrl:'/templates/animated-banner.server.view.html',
            template:
                '<div class="col-xs-12 col-sm-12 col-md-12 nopadding">'+
                    '<div class="bannerTitle">' +
                    '<span class="part1"></span>&nbsp;<span class="part2">{{cityName}}</span>' +
                '</div>' +
                '<div class="bannerContainer"></div>' +
                '</div>',
			restrict: 'E',
            replace: true,
            transclude: true,
            scope:{
                'slugName': '='
            },
            controller: ['$scope','$element', 'Classifieds', function($scope, $element, Classifieds)
            {
                $scope.updateBanner = function(slugName)
                {
                    var lClassifieds = Classifieds.getLatestClassifiedsIn(slugName).query(function()
                    {
                        $scope.classifieds = lClassifieds;

                        var lImages = [];

                        for (var iC=0; iC < lClassifieds.length; iC++)
                        {
                            var lClassified = lClassifieds[iC];
                            var lImage = {};
                            lImage.caption = lClassified.title.substr(0,30) + '...' + '<br/>' + lClassified.price;
                            lImage.href = '/property/sale/city-london/rm-34964157';
                            lImage.src = lClassified.medias[0];
                            lImages.push(lImage);
                        }

                        angular.element($element[0]).displayImages(lImages,true);
                        angular.element($element[0]).find('.bannerTitle .part2').text(slugName.substr(slugName.indexOf('-') +1));

                    });
                };

            }],
			link: function postLink(scope, element, attrs) {

				// instanciate the jquery banner
                angular.element(element[0]).banner();

                //set default text (part1)
                angular.element(element[0]).find('.bannerTitle .part1').text(window.translations.wegeooLastClassifiedsIn);

                //watch the classifieds to update the
                scope.$watch('slugName', function(slugName) {

                    scope.updateBanner(slugName);
                });

                //var lImages = [];
                //var lImage = {};
                //lImage.caption = '3 bedroom duplex for sale, T...<br/>£529,950';
                //lImage.href = '/property/sale/city-london/rm-34964157';
                //lImage.src = 'http://media.rightmove.co.uk/dir/30k/29643/34964157/29643_3664985_IMG_00_0001_max_656x437.jpg';
                //lImages.push(lImage);
                //
                //lImage = {};
                //lImage.caption = '3 bedroom flat for sale, Dal...<br/>£750,000';
                //lImage.href = '/property/sale/e8-dalston/rm-52689128';
                //lImage.src = 'http://media.rightmove.co.uk/dir/102k/101522/52689128/101522_942896_IMG_00_0000_max_656x437.jpg';
                //lImages.push(lImage);
                //
                //lImage = {};
                //lImage.caption = '1 bedroom apartment for sale...<br/>£305,000';
                //lImage.href = '/property/sale/se14-new/rm-52698368';
                //lImage.src = 'http://media.rightmove.co.uk/dir/92k/91592/52698368/91592_CAN2000098_IMG_01_0000_max_656x437.jpg';
                //lImages.push(lImage);
                //
                //lImage = {};
                //lImage.caption = '3 bedroom terraced house for...<br/>£350,000';
                //lImage.href = '/property/sale/e6-east/rm-34942710';
                //lImage.src = 'http://media.rightmove.co.uk/dir/140k/139727/34942710/139727_9490_IMG_00_0000_max_656x437.jpg';
                //lImages.push(lImage);
                //angular.element(element[0]).displayImages(lImages,true);
			}
		};
	}
]);