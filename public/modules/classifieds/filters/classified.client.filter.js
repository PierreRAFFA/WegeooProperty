'use strict';
angular.module('core').filter('formatPrice', function() {
    return function(value, currency) {

        var thousandsSeparator = '';
        var decimalSeparator = '';
        var currencyBefore = false;

        switch(currency)
        {
            case '£':
                thousandsSeparator = ',';
                decimalSeparator = '.';
                currencyBefore = true;
                break;

            default:
                thousandsSeparator = ' ';
                decimalSeparator = ',';
                currencyBefore = false;
        }

        //Add decimal and thousand separator
        var price = value.toString();
        var splittedPrice = price.split('.');
        var integer = splittedPrice[0];
        var formattedPrice = '';
        for(var i = integer.length - 1 ; i >= 0 ; i--)
        {
            if ( (integer.length - 1 - i) % 3 === 0 && i < integer.length - 1)
                formattedPrice = thousandsSeparator + formattedPrice;

            formattedPrice = integer[i] + formattedPrice;
        }

        if ( splittedPrice.length > 1)
            formattedPrice += decimalSeparator + splittedPrice[1];

        if ( currencyBefore)
            formattedPrice = currency + formattedPrice;
        else
            formattedPrice += currency;

        return formattedPrice;
    };
});