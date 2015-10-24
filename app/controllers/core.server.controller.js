'use strict';

var i18n = require('i18n');
var config = require('../../config/config');
var cityController = require('./city.server.controller');
var async = require('async');

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
    var slugName = config.defaultSlugName;
    if ( req.params.cityPostcode && req.params.cityName)
        slugName       = req.params.cityPostcode + '-' + req.params.cityName;

    //reset references from a previous search
    req.session.references = [];

    console.log('slugName:'+slugName);
    async.series({
            city: function (callback) {
                exports._getCityFromSlugName(slugName, callback);
            },
            mostPopulatedCities: function (callback) {
                exports._getMostPopulatedCities(callback);
            }
        },
        function(err, results) {
            console.log('onAsyncFinished:');


            results.theme = lTheme;
            results.category = lCategory;
            results.cityPostCode = lCityPostCode;
            results.cityName = lCityName;
            results.slugName = slugName;

            //console.dir(results);
            exports._renderPage(results);
        }
    );
};

exports._getCityFromSlugName = function(slugName, callback)
{
    console.log('_getCityFromSlugName');

    cityController.getCityFromSlugName(slugName , function(city)
    {
        if (callback)
        {
            var cityDoc = city._doc;
            delete cityDoc.pop;
            delete cityDoc.googleLocalized;
            delete cityDoc.division2;
            delete cityDoc.division;
            delete cityDoc._id;
            delete cityDoc.parentCode;
            delete cityDoc.uppercaseName;

            return callback(null, cityDoc);
        }

    });
};
exports._getMostPopulatedCities = function(callback)
{
    console.log('_getMostPopulatedCities');

    cityController.getMostPopulatedCities(48 , function(cities)
    {
        if (callback)
            return callback(null, cities);
    });
};

exports._renderPage = function(parameters)
{
    _res.render('index', {
        user: _req.user || null,
        request: _req,
        theme: parameters.theme,
        category: parameters.category,
        //cityPostcode: parameters.cityPostcode,
        //cityName: parameters.cityName,
        city: parameters.city,
        slugName: parameters.slugName,
        mostPopulatedCities: parameters.mostPopulatedCities,
        translations: {
            wegeooLastClassifiedsIn :   _res.__('wegeoo.lastClassifiedsIn'),
            classifiedPerWeek:          _res.__('classified.perWeek'),
            classifiedPerMonth:         _res.__('classified.perMonth'),
            classifiedPricePoa:         _res.__('classified.price.poa'),
            classifiedListLoadMore:     _res.__('classifiedList.loadMore'),
            footerFollowus:             _res.__('footer.followus')
        }
    });
};