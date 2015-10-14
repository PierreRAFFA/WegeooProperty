'use strict';

/**
 * This config is used for Wegeoo Property
 */
module.exports = {
    app: {
        title: 'Wegeoo Property',
        description: 'Search Flat or House for Sale or Rent on a map',
        keywords: 'property apartment house rent sale'
    },
    theme: 'property',
    countryCode: 'en_GB',
    defaultCategory: 'rent',
    defaultCityPostcode: 'city',
    defaultCityName: 'london',
    defaultSlugName: 'city-london',

    /**
     * Configure the classified details for 'property' theme
     */
    classifiedDetails: {
        price: {
            type: Number,
            required: 'price cannot be blank'
        },
        weekPrice: {
            type: Number
        },
        monthPrice: {
            type: Number
        },
        deposit: {
            type: Number
        },
        currency: {
            type: String,
            default: '£'
        },
        propertyType:{
            type: String,
            required: 'propertyType cannot be blank'
        },
        furnishing:{
            type: String
        },
        lettingType:{
            type: String
        }
    }
};