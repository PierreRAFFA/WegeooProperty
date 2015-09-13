/**
 * Created by pierre on 12/09/15.
 */
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Search', [

    function() {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.slugName = 'toto';


        this.setSlugName = function(value) {
            this.slugName = value;
        };

        this.getSlugName = function() {
            return this.slugName;
        };
    }
]);


