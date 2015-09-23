'use strict';

(function(angular)
{
    function AnimatedBannerController(Classifieds,$element)
    {
        this.Classifieds = Classifieds;
        this.$element = $element;

        this.classifieds = [];
    }

    AnimatedBannerController.prototype.updateBanner = function(slugName)
    {
        var self = this;

        var lClassifieds = this.Classifieds.getMostRecentfromCity(slugName).query(function()
        {
            self.classifieds = lClassifieds;

            var lImages = [];

            console.log('classifieds found:' + lClassifieds.length);

            for (var iC=0; iC < lClassifieds.length; iC++)
            {
                var lClassified = lClassifieds[iC];
                var lImage = {};
                lImage.caption = lClassified.title.substr(0,30) + '...' + '<br/>' + lClassified.details.price;
                lImage.href = '/property/sale/city-london/rm-34964157';
                lImage.src = lClassified.medias[0];
                lImages.push(lImage);
            }

            angular.element(self.$element[0]).displayImages(lImages,true);
            angular.element(self.$element[0]).find('.bannerTitle .part2').text(slugName.substr(slugName.indexOf('-') +1));

        });
    };

    AnimatedBannerController.$inject = ['Classifieds', '$element'];
    angular.module('core').controller('AnimatedBannerController', AnimatedBannerController);
})(angular);

