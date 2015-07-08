'use strict';

var sha1 = require('sha1');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Classified = mongoose.model('Classified'),
	_ = require('lodash');

function generateReference(length, prefix)
{
    var lReference = (prefix  || '') + sha1(String(Math.random())).substring( 0, length);

    //check if reference exists by checking classified storage path
    //$lClassifiedStoragePath = sprintf("/var/www/storage/%s" , $lReference);
    //if ( file_exists($lClassifiedStoragePath))
    //    $lReference = generateReference($pLength, $pPrefix);

    return lReference;
}

/**
 * Create a classified
 */
exports.create = function(req, res) {
	var classified = new Classified(req.body);
    classified.reference = generateReference(8 , 'wg-');
	classified.user = req.user;

	classified.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classified);
		}
	});
};



/**
 * Show the current classified
 */
exports.read = function(req, res) {
	res.json(req.classified);
};

/**
 * Update a classified
 */
exports.update = function(req, res) {
	var classified = req.classified;

    //@Todo
    //classified.user = req.user;

	classified = _.extend(classified, req.body);

	classified.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classified);
		}
	});
};

/**
 * Delete an classified
 */
exports.delete = function(req, res) {
	var classified = req.classified;

	classified.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classified);
		}
	});
};

/**
 * List of Classifieds
 */
exports.list = function(req, res) {
	Classified.find().sort('-created').populate('user', 'displayName').exec(function(err, classifieds) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classifieds);
		}
	});
};

/**
 * Classified middleware
 *
 * @Todo By reference
 */
exports.classifiedByID = function(req, res, next, id) {
	Classified.findById(id).populate('user', 'displayName').exec(function(err, classified) {
		if (err) return next(err);
		if (!classified) return next(new Error('Failed to load classified ' + id));
		req.classified = classified;
		next();
	});
};

exports.classifiedByReference = function(req, res, next, reference) {
    Classified.findByReference(reference).populate('user', 'displayName').exec(function(err, classified) {
        if (err) return next(err);
        if (!classified) return next(new Error('Failed to load classified ' + reference));
        req.classified = classified;
        next();
    });
};

/**
 * Classified authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.classified.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};