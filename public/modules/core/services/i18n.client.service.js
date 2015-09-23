/**
 * Created by pierre on 12/09/15.
 */
'use strict';


//Menu service used for managing  menus
angular.module('core').service('I18n', [

    function() {

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////  CONSTRUCTOR
        var I18n = function() {

        };

        I18n.prototype.t = function(key)
        {
            if (window.translations.hasOwnProperty(key))
            {
                return window.translations[key];
            }else{
                return key;
            }
        };

        return new I18n();

    }
]);


