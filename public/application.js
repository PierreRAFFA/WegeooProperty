'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies)

angular.module(ApplicationConfiguration.applicationModuleName).config(['uiGmapGoogleMapApiProvider',
    function(GoogleMapApiProviders) {
        GoogleMapApiProviders.configure({
            china: true
            //v: '3.19.20',
            //libraries: 'weather,geometry,visualization'
        });
    }]
);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');

        //prevent the hash for HTML5 browsers only
        $locationProvider.html5Mode(true);
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});