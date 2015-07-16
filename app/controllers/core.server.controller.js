'use strict';

var i18n = require('i18n');
var config = require('../../config/config');
/**
 * Module dependencies.
 */
exports.index = function(req, res) {

    //get params
    var lTheme          = req.params.theme || config.theme;
    var lCategory       = req.params.category || config.defaultCategory;
    var lCityPostCode   = req.params.cityPostcode || config.defaultCityPostcode;
    var lCityName       = req.params.cityName || config.defaultCityName;

	res.render('index', {
		user: req.user || null,
		request: req,
        theme: lTheme,
        category: lCategory,
        cityPostcode: lCityPostCode,
        cityName: lCityName
	});
};