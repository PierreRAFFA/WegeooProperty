'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    City = mongoose.model('City'),
    _ = require('lodash');

/**
 * List of City
 */
exports.getCityFromSlugName = function(slugName, callback) {

    City
        .findOne({slugName:slugName})
        .select()
        .exec(function(err, city) {
            if (err) {
                callback.call(null,null);
            } else {
                callback.call(null, city);
            }
        });
};

/**
 * List of City
 */
exports.getMostPopulatedCities = function(limit, callback) {

    City
        .find({parentCode: { $eq: null }})
        .select('-_id slugName name')
        .sort('-pop')
        .limit(limit)
        .exec(function(err, cities) {
            if (err) {
                callback.call(null,[]);
            } else {
                callback.call(null, cities);
            }
        });
};