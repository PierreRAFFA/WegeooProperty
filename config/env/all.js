'use strict';

/**
 * This config is used for Wegeoo Property
 */
module.exports = {
	app: {
		title: 'Wegeoo',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'Wegeoo Property Sale Rent Flat House Apartment'
	},
    theme: 'property',
    countryCode: 'en_GB',
    defaultCategory: 'rent',
    defaultCityPostcode: 'city',
    defaultCityName: 'london',
    defaultSlugName: 'city-london',
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-cookies/angular-cookies.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/lodash/lodash.js',
                'public/lib/angular-google-maps/dist/angular-google-maps_dev_mapped.js'
            ]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/directives/*/*.js',
			'public/modules/*/model/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	},
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