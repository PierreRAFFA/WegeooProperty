'use strict';

angular.module('core').controller('GotoTopButtonController', [ 'WegeooService', 'Classifieds', 'I18n',

    function( WegeooService, Classifieds, I18n) {

        var $ = window.$;
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var GotoTopButtonController = function() {
            // Define a set of default roles
            this.wegeooService = WegeooService;
            this.Classifieds = Classifieds;
            this.I18n = I18n;

            this.active = false;

        };
        ///////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////// LINK
        GotoTopButtonController.prototype.onLink = function()
        {
            console.log('onLink');
        };
        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  SCROLL TO TOP
        GotoTopButtonController.prototype.scrollToTop = function(contentHTML)
        {

            $('html,body').animate({
                'scrollTop' : 0
            }, {
                duration : 250,
                easing : 'swing'
            });
        };

        return new GotoTopButtonController();

    }
]);


// To keep to check the difference of performance with this method.
//
//(function(angular)
//{
//    ///////////////////////////////////////////////////////////////////////////
//    ///////////////////////////////////////////////////////////  CONSTRUCTOR
//    function GotoTopButtonController($scope, Classifieds, WegeooService)
//    {
//        this.wegeooService = WegeooService;
//        this.Classifieds = Classifieds;
//        this.$scope = $scope;
//
//    }
//    ///////////////////////////////////////////////////////////////////////////
//    ///////////////////////////////////////////////////////////   INIT MAP
//
//    ///////////////////////////////////////////////////////////////////////////
//    /////////////////////////////////////////////////////////// ANGULAR REGISTERING
//    GotoTopButtonController.$inject = ['$scope', 'Classifieds', 'WegeooService'];
//    angular.module('core').controller('GotoTopButtonController', GotoTopButtonController);
//
//})(angular);

