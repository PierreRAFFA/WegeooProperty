'use strict';

var sha1 = require('sha1');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Classified = mongoose.model('Classified'),
	CityController = require('./city.server.controller'),
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
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/**
 * Create a classified
 */
exports.create = function(req, res) {

    //get city
    CityController.getCityFromSlugName(req.body.city , function(city)
    {
        console.log(city);

        //delete to prevent crash ( city here is actually the slugName value )
        delete req.body.city;

        var classified = new Classified(req.body);
        classified.reference    = generateReference(8 , 'wg-');
        classified.user         = req.user;
        classified.city         = city;
        classified.nCity        = { slugName: city.slugName , parentCode:city.parentCode };

        classified.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(classified);
            }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////  SELECT CLASSIFIED LIST
/**
 * Returns different results depending on 'list' parameter
 * 'list' can be 'getLatestIn', 'getLatestAround'
 */
exports.list = function(req, res) {
    console.log(req.query);

    if ( req.query.list)
    {
        var lListName = req.query.list;
        switch(lListName)
        {
            case 'getLatestIn':
                exports._getLatestIn(req, res);
                break;

            case 'getLatestAround':
                exports._getLatestAround(req, res);
                break;

            default:
                return res.status(400).send({
                    message: 'Incorrect Parameters'
                });
        }
    }else{
        return res.status(400).send({
            message: 'Incorrect Parameters'
        });
    }
};
/**
 * Returns the latest classifieds in a specific city as postcode + cityName
 *
 * @param req
 * @param res
 * @private
 */
exports._getLatestIn = function (req, res)
{
    if ( req.query.slugName)
    {
        var lCityName = req.query.slugName.substring(req.query.slugName.indexOf('-') + 1);
        Classified
            .find( { $or: [ {'nCity.slugName' : req.query.slugName} , {'nCity.parentCode' : lCityName}] })
            .select('-_id -__v -clientIp -numMailsReceived -active -password -lostPasswordCode -activationCode -numWarnings -numSeen')
            .sort('-modificationDate')
            //.populate('user', 'displayName')
            .populate('city', '-_id -id -__v -googleLocalized -pop -division -division2')
            .exec(function(err, classifieds) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(classifieds);
                }
            });
    }else{
        return res.status(400).send({
            message: 'Incorrect Parameters in getLatestIn List'
        });
    }

};
exports._getLatestAround = function(req,res)
{

};
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// SELECT CLASSIFIED
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