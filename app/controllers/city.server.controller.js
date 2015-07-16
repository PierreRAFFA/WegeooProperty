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
        .find({slugName:slugName})
        .select('-_id -__v')
        .exec(function(err, cities) {
            if (err) {
                callback.call(null,null);
            } else {
                callback.call(null, new City(cities));
            }
        });
};