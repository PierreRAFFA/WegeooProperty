'use strict';

var i18n = require('i18n');
var config = require('../../config/config');
var cityController = require('./city.server.controller');

var _req = null;
var _res = null;

/**
 * Module dependencies.
 */
exports.index = function(req, res) {

    _req = req;
    _res = res;

    //get params
    var lTheme          = req.params.theme          || config.theme;
    var lCategory       = req.params.category       || config.defaultCategory;
    var lCityPostCode   = req.params.cityPostcode   || config.defaultCityPostcode;
    var lCityName       = req.params.cityName       || config.defaultCityName;

    //define slug name
    var lSlugName = config.defaultSlugName;
    if ( req.params.cityPostcode && req.params.cityName)
        lSlugName       = req.params.cityPostcode + '-' + req.params.cityName;

    //reset references from a previous search
    req.session.references = [];

    //get most populated cities
    cityController.getMostPopulatedCities(48 , function(cities)
    {
        _res.render('index', {
            user: req.user || null,
            request: req,
            theme: lTheme,
            category: lCategory,
            cityPostcode: lCityPostCode,
            cityName: lCityName,
            slugName: lSlugName,
            cities: cities,
            translations: {
                wegeooLastClassifiedsIn : res.__('wegeoo.lastClassifiedsIn'),
                classifiedPerWeek: res.__('classified.perWeek'),
                classifiedPerMonth: res.__('classified.perMonth'),
                classifiedPricePoa: res.__('classified.price.poa'),
                classifiedListLoadMore: res.__('classifiedList.loadMore'),
                footerFollowus: res.__('footer.followus')
            }
        });
    });

};